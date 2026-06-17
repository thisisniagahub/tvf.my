/**
 * HERMES v2 Tool Gateway
 * ----------------------
 * A unified facade over the four z-ai-web-dev-sdk capabilities that
 * HERMES uses for tool-augmented generation:
 *
 *   - `webSearch(query)`       → zai.functions.invoke('web_search', ...)
 *   - `generateImage(prompt)`  → zai.images.generations.create(...)
 *   - `textToSpeech(text)`     → zai.audio.tts.create(...)
 *   - `readWebPage(url)`       → zai.functions.invoke('page_reader', ...)
 *
 * Every method:
 *   - Loads the SDK via dynamic import (so it never runs on the client).
 *   - Returns a typed result object or `null`/`[]` on failure.
 *   - Logs via `@/lib/logger` for observability.
 *   - Never throws — callers can `await` directly without try/catch.
 *
 * This class is the single chokepoint through which all HERMES v2
 * tool calls flow, so we can add caching, retries, or circuit-breaker
 * logic here in the future without touching call sites.
 */

import { logger } from '@/lib/logger'

// ============== Result Types ==============

export interface WebSearchResult {
  title: string
  url: string
  snippet: string
  hostName: string
  rank: number
}

export interface ImageGenResult {
  /** Data URL: `data:image/png;base64,...` */
  image: string
  prompt: string
}

export interface TTSResult {
  /** Raw WAV audio bytes. Stored as Uint8Array (Buffer is a Uint8Array
   * subclass) so it satisfies the standard `BodyInit` contract used by
   * NextResponse without TS union-typing quirks. */
  audio: Uint8Array<ArrayBuffer>
  format: string
}

export interface WebPageResult {
  title: string
  url: string
  html: string
  text: string
  publishedTime?: string
}

// ============== Tool Gateway ==============

const MAX_TTS_CHARS = 1000
const MAX_SNIPPET_LENGTH = 500

/**
 * SSRF allowlist — validate a URL before letting the page_reader tool
 * fetch it. Blocks internal/private IPs, link-local addresses, the AWS
 * metadata endpoint, and any non-http(s) protocol. Returns true if the
 * URL is safe to fetch, false otherwise.
 *
 * This is intentionally conservative — it errs on the side of blocking
 * anything that looks remotely internal. Add explicit allowlist entries
 * here if a legitimate internal feed needs to be fetched.
 */
function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Block internal/private IPs and known metadata endpoints.
    // Note: hostname comparisons are case-insensitive.
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '169.254.169.254', // AWS / GCP / Azure IMDS
      'metadata.google.internal',
      '10.',
      '172.16.',
      '172.17.',
      '172.18.',
      '172.19.',
      '172.20.',
      '172.21.',
      '172.22.',
      '172.23.',
      '172.24.',
      '172.25.',
      '172.26.',
      '172.27.',
      '172.28.',
      '172.29.',
      '172.30.',
      '172.31.',
      '192.168.',
      '::1',
      'fc00:',
      'fe80:',
    ]
    const hostname = parsed.hostname.toLowerCase()
    for (const blocked of blockedHosts) {
      if (hostname.startsWith(blocked) || hostname === blocked) {
        return false
      }
    }
    // Only allow http/https protocols — no file:, ftp:, data:, etc.
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }
    return true
  } catch {
    return false
  }
}

export class ToolGateway {
  /**
   * Web Search via z-ai-web-dev-sdk `functions.invoke('web_search', ...)`.
   * Returns up to `num` (default 10) results.
   */
  async webSearch(query: string, num: number = 10): Promise<WebSearchResult[]> {
    if (!query || typeof query !== 'string') return []

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const raw = (await zai.functions.invoke('web_search', {
        query,
        num,
      })) as unknown

      if (!Array.isArray(raw)) {
        logger.warn('Web search returned non-array', { query })
        return []
      }

      const results: WebSearchResult[] = raw.map(
        (item, idx): WebSearchResult => {
          const r = item as Record<string, unknown>
          const snippet =
            typeof r.snippet === 'string'
              ? r.snippet.slice(0, MAX_SNIPPET_LENGTH)
              : ''
          return {
            title: typeof r.name === 'string' ? r.name : '(untitled)',
            url: typeof r.url === 'string' ? r.url : '',
            snippet,
            hostName:
              typeof r.host_name === 'string' ? r.host_name : '',
            rank: typeof r.rank === 'number' ? r.rank : idx + 1,
          }
        }
      )

      logger.info('Web search executed', {
        query,
        resultCount: results.length,
      })
      return results
    } catch (error) {
      logger.error('Web search failed', { query }, error)
      return []
    }
  }

  /**
   * Image Generation via z-ai-web-dev-sdk `images.generations.create`.
   * `size` must be one of the SDK-supported sizes (defaults to 1024x1024).
   * Returns `{ image: dataURL, prompt }` or `null` on failure.
   */
  async generateImage(
    prompt: string,
    size:
      | '1024x1024'
      | '768x1344'
      | '864x1152'
      | '1344x768'
      | '1152x864'
      | '1440x720'
      | '720x1440' = '1024x1024'
  ): Promise<ImageGenResult | null> {
    if (!prompt || typeof prompt !== 'string') return null

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const response = await zai.images.generations.create({
        prompt,
        size,
      })

      const base64 = response.data?.[0]?.base64
      if (!base64) {
        logger.warn('Image generation returned no data', { prompt })
        return null
      }

      logger.info('Image generated', { prompt, size })
      return {
        image: `data:image/png;base64,${base64}`,
        prompt,
      }
    } catch (error) {
      logger.error('Image generation failed', { prompt, size }, error)
      return null
    }
  }

  /**
   * Text-to-Speech via z-ai-web-dev-sdk `audio.tts.create`.
   * `text` is truncated to 1000 chars (SDK limit). Voice must be a
   * valid SDK voice id (defaults to 'tongtong'). Speed is clamped to
   * [0.5, 2.0]. Returns `{ audio: Buffer, format }` or `null`.
   */
  async textToSpeech(
    text: string,
    voice: string = 'tongtong',
    speed: number = 1.0
  ): Promise<TTSResult | null> {
    if (!text || typeof text !== 'string') return null

    const truncatedText = text.slice(0, MAX_TTS_CHARS)
    const clampedSpeed = Math.min(2.0, Math.max(0.5, speed))

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const response = await zai.audio.tts.create({
        input: truncatedText,
        voice,
        speed: clampedSpeed,
        response_format: 'wav',
        stream: false,
      })

      const arrayBuffer = await (response as unknown as {
        arrayBuffer: () => Promise<ArrayBuffer>
      }).arrayBuffer()
      // Note: `new Uint8Array(arrayBuffer)` returns `Uint8Array<ArrayBuffer>`
      // (not the generic `<ArrayBufferLike>`), which is what the BodyInit
      // contract of NextResponse expects.
      const buffer = new Uint8Array(arrayBuffer)

      logger.info('TTS generated', {
        voice,
        textLength: truncatedText.length,
        bytes: buffer.length,
      })
      return { audio: buffer, format: 'wav' }
    } catch (error) {
      logger.error(
        'TTS failed',
        { voice, textLength: truncatedText.length },
        error
      )
      return null
    }
  }

  /**
   * Web Page Reading via z-ai-web-dev-sdk `functions.invoke('page_reader', ...)`.
   * Returns the page's title, URL, raw HTML, and a best-effort
   * plain-text extraction (HTML tags stripped), or `null` on failure.
   *
   * Security: URLs are validated against an SSRF allowlist before being
   * forwarded to the SDK. Internal/private IPs, link-local addresses,
   * the AWS metadata endpoint, and non-http(s) protocols are blocked.
   */
  async readWebPage(url: string): Promise<WebPageResult | null> {
    if (!url || typeof url !== 'string') return null

    // SSRF guard — block internal/private URLs before fetching.
    if (!validateUrl(url)) {
      logger.warn('SSRF blocked: invalid or internal URL', { url })
      return null
    }

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const raw = (await zai.functions.invoke('page_reader', {
        url,
      })) as {
        code?: number
        data?: {
          html: string
          publishedTime?: string
          title: string
          url: string
        }
        status?: number
      }

      if (!raw || !raw.data) {
        logger.warn('Page reader returned no data', { url })
        return null
      }

      const html = raw.data.html ?? ''
      // Best-effort text extraction — strip tags + collapse whitespace.
      // We avoid an HTML parser dependency for this lightweight use case.
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 10000)

      logger.info('Web page read', {
        url,
        title: raw.data.title,
        htmlLength: html.length,
      })

      return {
        title: raw.data.title ?? '',
        url: raw.data.url ?? url,
        html,
        text,
        publishedTime: raw.data.publishedTime,
      }
    } catch (error) {
      logger.error('Web page read failed', { url }, error)
      return null
    }
  }
}

/** Singleton instance — shared across the app. */
export const toolGateway = new ToolGateway()
