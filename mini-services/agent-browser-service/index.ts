/**
 * TheViralFindsMY — Agent Browser Service (Mini-service)
 * -----------------------------------------------------
 * WebSocket-driven browser-automation SIMULATION service.
 *
 * Why simulation?
 *   Playwright is heavy and the sandbox environment cannot reliably run a
 *   headless Chromium. Instead of crashing at runtime, this service accepts
 *   the exact same action surface a real Playwright-backed controller would
 *   (`navigate`, `click`, `type`, `scroll`, `extract`, `status`) and returns
 *   simulated screenshots as gradient SVG data-URLs plus logged action
 *   results. The browser controller is isolated in `generateScreenshot`
 *   + per-action handlers so a future Playwright upgrade is a drop-in
 *   replacement — the wire protocol stays identical.
 *
 * Wire protocol (Socket.io, path "/"):
 *   Client → Server:
 *     - `navigate`   { url: string }
 *     - `click`      { x: number; y: number; selector?: string }
 *     - `type`       { text: string; selector?: string }
 *     - `scroll`     { direction: 'up' | 'down'; amount?: number }
 *     - `extract`    { selector?: string; fields?: string[] }
 *     - `status`     { status: string }
 *     - `stop`       {}                           // cancel current task
 *   Server → Client:
 *     - `connected`       { message, sessionId }
 *     - `screenshot`      { screenshot, url }
 *     - `action-result`   { type, success, ...payload }
 *     - `log`             { level, message, timestamp }
 *     - `task-stopped`    { reason }
 *
 * Transport: WebSocket only. Caddy routes /?XTransformPort=3004 → :3004.
 */

import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  // Restricted origins — production deployments should set
  // ALLOWED_ORIGINS to a comma-separated list of trusted domains
  // (e.g. "https://tvf.my,https://www.tvf.my"). Wildcard "*" is
  // insecure because it allows any website to open a Socket.io
  // connection (and with credentials:true, to send cookies).
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ============== Types ==============

interface BrowserAction {
  type: string
  payload: Record<string, unknown>
  timestamp: string
}

interface BrowserSession {
  id: string
  url: string
  title: string
  isActive: boolean
  history: string[]
  actions: BrowserAction[]
  cancelled: boolean
}

// ============== Session registry ==============

const sessions = new Map<string, BrowserSession>()

function getSession(socket: Socket): BrowserSession | undefined {
  return sessions.get(socket.id)
}

function recordAction(session: BrowserSession, type: string, payload: Record<string, unknown> = {}): BrowserAction {
  const action: BrowserAction = { type, payload, timestamp: new Date().toISOString() }
  session.actions.push(action)
  // Cap action history to prevent unbounded memory growth
  if (session.actions.length > 200) {
    session.actions = session.actions.slice(-200)
  }
  return action
}

// ============== Simulated screenshot ==============

/**
 * Generate a placeholder browser screenshot as a base64-encoded SVG data URL.
 * The SVG is intentionally lightweight (no external assets) so it renders
 * instantly on the client <img>. Status colour-codes the state of the
 * simulated page so the UI can show progress (idle / running / error).
 *
 * NOTE: We emit `data:image/svg+xml;base64,...` (not PNG) so the client
 * can use it directly as an <img src=...>. PNG would require a real
 * rasteriser; SVG is universally supported.
 */
function generateScreenshot(url: string, status: string): string {
  const safeUrl = (url || 'No URL').replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '"': return '&quot;'
      case "'": return '&#39;'
      default: return c
    }
  })
  const statusColor =
    status === 'running' ? '#22c55e' :
    status === 'error' ? '#ef4444' :
    status === 'done' ? '#0ea5e9' :
    '#888'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.1"/>
        <stop offset="100%" style="stop-color:#ee4d2d;stop-opacity:0.1"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <rect x="0" y="0" width="1280" height="48" fill="#1f2937"/>
    <circle cx="24" cy="24" r="6" fill="#ef4444"/>
    <circle cx="48" cy="24" r="6" fill="#f59e0b"/>
    <circle cx="72" cy="24" r="6" fill="#22c55e"/>
    <rect x="120" y="14" width="1040" height="20" rx="10" fill="#374151"/>
    <text x="640" y="29" font-family="monospace" font-size="11" fill="#9ca3af" text-anchor="middle">${safeUrl}</text>
    <text x="640" y="340" font-family="sans-serif" font-size="28" font-weight="bold" fill="#6b7280" text-anchor="middle">TheViralFindsMY Agent</text>
    <text x="640" y="380" font-family="sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle">Simulated browser session</text>
    <text x="640" y="440" font-family="sans-serif" font-size="14" font-weight="bold" fill="${statusColor}" text-anchor="middle">Status: ${status}</text>
    <text x="640" y="690" font-family="sans-serif" font-size="10" fill="#9ca3af" text-anchor="middle">This is a simulated screenshot — upgrade to Playwright for real page rendering</text>
  </svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

function logEvent(socket: Socket, level: 'info' | 'success' | 'warn' | 'error', message: string): void {
  socket.emit('log', { level, message, timestamp: new Date().toISOString() })
  // Mirror to server console for debugging
  const tag = `[${socket.id}]`
  const line = `${tag} ${level.toUpperCase()}: ${message}`
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

function emitScreenshot(socket: Socket, session: BrowserSession, status: string): void {
  socket.emit('screenshot', {
    screenshot: generateScreenshot(session.url, status),
    url: session.url,
  })
}

// ============== Connection lifecycle ==============

io.on('connection', (socket: Socket) => {
  console.log(`Agent browser client connected: ${socket.id}`)

  const sessionId = socket.id
  sessions.set(sessionId, {
    id: sessionId,
    url: '',
    title: '',
    isActive: false,
    history: [],
    actions: [],
    cancelled: false,
  })

  // Initial handshake
  socket.emit('connected', {
    message: 'Agent browser service connected',
    sessionId,
  })
  socket.emit('screenshot', {
    screenshot: generateScreenshot('', 'idle'),
    url: '',
  })

  // ---------- navigate ----------
  socket.on('navigate', (data: { url: string }) => {
    const session = getSession(socket)
    if (!session) return
    session.cancelled = false
    session.url = data.url
    session.history.push(data.url)
    if (session.history.length > 50) session.history = session.history.slice(-50)
    recordAction(session, 'navigate', { url: data.url })
    logEvent(socket, 'info', `Navigating to ${data.url}`)

    setTimeout(() => {
      if (session.cancelled) {
        logEvent(socket, 'warn', 'Navigation cancelled')
        socket.emit('task-stopped', { reason: 'cancelled during navigate' })
        return
      }
      emitScreenshot(socket, session, 'running')
      socket.emit('action-result', { type: 'navigate', success: true, url: data.url })
      logEvent(socket, 'success', `Loaded ${data.url}`)
    }, 500)
  })

  // ---------- click ----------
  socket.on('click', (data: { x: number; y: number; selector?: string }) => {
    const session = getSession(socket)
    if (!session) return
    recordAction(session, 'click', { x: data.x, y: data.y, selector: data.selector })
    logEvent(socket, 'info', `Click at (${data.x}, ${data.y})${data.selector ? ` via ${data.selector}` : ''}`)

    setTimeout(() => {
      if (session.cancelled) {
        socket.emit('task-stopped', { reason: 'cancelled during click' })
        return
      }
      socket.emit('action-result', {
        type: 'click',
        success: true,
        x: data.x,
        y: data.y,
        selector: data.selector,
      })
      emitScreenshot(socket, session, 'running')
      logEvent(socket, 'success', `Clicked element at (${data.x}, ${data.y})`)
    }, 300)
  })

  // ---------- type ----------
  socket.on('type', (data: { text: string; selector?: string }) => {
    const session = getSession(socket)
    if (!session) return
    recordAction(session, 'type', { text: data.text, selector: data.selector })
    const preview = data.text.length > 50 ? `${data.text.substring(0, 50)}…` : data.text
    logEvent(socket, 'info', `Type "${preview}"${data.selector ? ` into ${data.selector}` : ''}`)

    setTimeout(() => {
      if (session.cancelled) {
        socket.emit('task-stopped', { reason: 'cancelled during type' })
        return
      }
      socket.emit('action-result', {
        type: 'type',
        success: true,
        text: data.text,
        selector: data.selector,
      })
      logEvent(socket, 'success', `Typed ${data.text.length} characters`)
    }, 200)
  })

  // ---------- scroll ----------
  socket.on('scroll', (data: { direction: 'up' | 'down'; amount?: number }) => {
    const session = getSession(socket)
    if (!session) return
    recordAction(session, 'scroll', { direction: data.direction, amount: data.amount })
    logEvent(socket, 'info', `Scroll ${data.direction}${data.amount ? ` by ${data.amount}px` : ''}`)

    setTimeout(() => {
      if (session.cancelled) {
        socket.emit('task-stopped', { reason: 'cancelled during scroll' })
        return
      }
      socket.emit('action-result', {
        type: 'scroll',
        success: true,
        direction: data.direction,
        amount: data.amount,
      })
      emitScreenshot(socket, session, 'running')
      logEvent(socket, 'success', `Scrolled ${data.direction}`)
    }, 300)
  })

  // ---------- extract ----------
  socket.on('extract', (data: { selector?: string; fields?: string[] }) => {
    const session = getSession(socket)
    if (!session) return
    recordAction(session, 'extract', { selector: data.selector, fields: data.fields })
    const fieldList = data.fields && data.fields.length > 0 ? data.fields.join(', ') : 'all'
    logEvent(socket, 'info', `Extract fields: ${fieldList}`)

    setTimeout(() => {
      if (session.cancelled) {
        socket.emit('task-stopped', { reason: 'cancelled during extract' })
        return
      }
      // Simulated extraction — Malaysian-context sample data so the UI has
      // something realistic to render. A future Playwright controller would
      // return real DOM text here.
      const extractedData = {
        title: 'Sample Product Page',
        price: 'RM 29.90',
        rating: '4.8',
        sold: '1,234',
        commission: '12%',
        stock: 'In Stock',
        shop: 'ShopeeMall Official',
      }
      socket.emit('action-result', {
        type: 'extract',
        success: true,
        data: extractedData,
        fields: data.fields,
      })
      const summary = JSON.stringify(extractedData)
      logEvent(socket, 'success', `Extracted ${summary.length > 80 ? summary.substring(0, 80) + '…' : summary}`)
    }, 500)
  })

  // ---------- status ----------
  socket.on('status', (data: { status: string }) => {
    const session = getSession(socket)
    if (!session) return
    emitScreenshot(socket, session, data.status)
  })

  // ---------- stop ----------
  socket.on('stop', () => {
    const session = getSession(socket)
    if (!session) return
    session.cancelled = true
    session.isActive = false
    recordAction(session, 'stop', {})
    logEvent(socket, 'warn', 'Task stopped by user')
    socket.emit('task-stopped', { reason: 'user requested stop' })
    emitScreenshot(socket, session, 'idle')
  })

  // ---------- disconnect ----------
  socket.on('disconnect', () => {
    sessions.delete(sessionId)
    console.log(`Agent browser client disconnected: ${socket.id}`)
  })

  socket.on('error', (error: unknown) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

// ============== Boot ==============

const PORT = 3004
httpServer.listen(PORT, () => {
  console.log(`TheViralFindsMY Agent Browser Service running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  console.log('Shutting down agent-browser service (SIGTERM)...')
  httpServer.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  console.log('Shutting down agent-browser service (SIGINT)...')
  httpServer.close(() => process.exit(0))
})
