import { createServer } from 'http'
import { Server } from 'socket.io'

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

interface LiveEvent {
  id: string
  type: 'sale' | 'trend' | 'xtra' | 'achievement' | 'info'
  title: string
  message: string
  amount?: number
  timestamp: string
}

const products = [
  'RGB Mechanical Keyboard',
  'Safi Balqis UV Sunblock',
  'Tudung Bawal Premium',
  'Portable Blender USB',
  'Wardah Matte Lipstick',
  'Wireless Earbuds Pro',
  'Xiaomi Robot Vacuum',
  'Instant Pot Pressure Cooker',
  'Anker Power Bank 20000mAh',
  'Smart Watch Fitness Tracker',
]

const trendProducts = [
  'Tudung Bawal Premium — Fashion velocity 92%',
  'RGB Mechanical Keyboard — Electronics 78%',
  'Wardah Matte Lipstick — Beauty 84%',
  'Safi Balqis UV Sunblock — Beauty 64%',
  'Portable Blender USB — Home 67%',
]

const buyers = [
  'Ahmad from KL',
  'Siti from Shah Alam',
  'Wei Ming from Penang',
  'Priya from Johor Bahru',
  'Hafiz from Subang',
  'Nurul from Klang',
  'Rajesh from Petaling Jaya',
  'Jasmine from Ipoh',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateSaleEvent(): LiveEvent {
  const product = randomItem(products)
  const buyer = randomItem(buyers)
  const commissions = [2.99, 3.85, 3.99, 4.19, 4.49, 7.12, 8.33, 11.04, 11.94, 44.95]
  const amount = randomItem(commissions)
  return {
    id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'sale',
    title: 'New Sale! 🎉',
    message: `${product} sold to ${buyer} — you earned RM ${amount.toFixed(2)}`,
    amount,
    timestamp: new Date().toISOString(),
  }
}

function generateTrendEvent(): LiveEvent {
  return {
    id: `trend-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'trend',
    title: 'Trending Alert 🔥',
    message: randomItem(trendProducts),
    timestamp: new Date().toISOString(),
  }
}

function generateXtraEvent(): LiveEvent {
  const product = randomItem(products)
  return {
    id: `xtra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'xtra',
    title: 'Commission XTRA Live! ⭐',
    message: `${product} now offers 40% extra commission — grab it fast!`,
    timestamp: new Date().toISOString(),
  }
}

function generateEvent(): LiveEvent {
  const rand = Math.random()
  if (rand < 0.55) return generateSaleEvent()
  if (rand < 0.8) return generateTrendEvent()
  return generateXtraEvent()
}

const connectedClients = new Set<string>()

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  connectedClients.add(socket.id)

  // Send welcome event
  socket.emit('connected', {
    message: 'Real-time notifications active — live Malaysian market intel',
    timestamp: new Date().toISOString(),
  })

  // Send an initial event shortly after connection
  setTimeout(() => {
    const event = generateSaleEvent()
    socket.emit('notification', event)
  }, 3000)

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    connectedClients.delete(socket.id)
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

// Broadcast live events to all connected clients every 18-35 seconds
function scheduleNextEvent() {
  const delay = 18000 + Math.random() * 17000
  setTimeout(() => {
    if (connectedClients.size > 0) {
      const event = generateEvent()
      io.emit('notification', event)
      console.log(`Broadcast [${event.type}] to ${connectedClients.size} clients: ${event.title}`)
    }
    scheduleNextEvent()
  }, delay)
}

scheduleNextEvent()

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`TheViralFindsMY notification service running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  console.log('Shutting down notification service...')
  httpServer.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  console.log('Shutting down notification service...')
  httpServer.close(() => process.exit(0))
})
