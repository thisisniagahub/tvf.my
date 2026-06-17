'use client'

import { useState, useEffect, useRef } from 'react'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { PageHeader } from './_shared'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const templates = [
  { id: 'before-after', label: '✨ Before/After', desc: 'Transformation showcase' },
  { id: 'unboxing', label: '📦 Unboxing', desc: 'First impression reveal' },
  { id: 'tutorial', label: '🎓 Tutorial', desc: 'How-to guide' },
  { id: 'review', label: '⭐ Review', desc: 'Honest product review' },
  { id: 'comparison', label: '⚖️ Comparison', desc: 'Side-by-side compare' },
  { id: 'story', label: '📖 Story', desc: 'Personal narrative' },
]

const languages = ['Manglish', 'Bahasa Malaysia', 'English', 'Rojak']
const tones = ['Excited', 'Friendly', 'Professional', 'Funny', 'Urgent', 'Luxurious']
const durations = ['15s', '30s', '60s', '90s']

type VoiceDef = {
  id: string
  name: string
  desc: string
  icon: Icons.LucideIcon
}

const voices: VoiceDef[] = [
  { id: 'tongtong', name: 'TongTong', desc: 'Warm & friendly', icon: Icons.Heart },
  { id: 'chuichui', name: 'ChuiChui', desc: 'Lively & energetic', icon: Icons.Zap },
  { id: 'xiaochen', name: 'XiaoChen', desc: 'Professional & clear', icon: Icons.Briefcase },
  { id: 'jam', name: 'Jam', desc: 'English gentleman', icon: Icons.Crown },
  { id: 'kazi', name: 'Kazi', desc: 'Clear standard voice', icon: Icons.Star },
  { id: 'douji', name: 'DouJi', desc: 'Natural & casual', icon: Icons.Leaf },
  { id: 'luodo', name: 'LuoDo', desc: 'Expressive & dramatic', icon: Icons.Drama },
]

const speedMarks = [
  { value: 0.5, label: '0.5x Slow' },
  { value: 1.0, label: '1.0x Normal' },
  { value: 1.5, label: '1.5x Fast' },
  { value: 2.0, label: '2.0x Very Fast' },
]

const TTS_CHAR_LIMIT = 1024

export function ContentStudioPage() {
  const { setActivePage } = useAppStore()
  // Script tab state
  const [template, setTemplate] = useState('before-after')
  const [productName, setProductName] = useState('')
  const [language, setLanguage] = useState('Manglish')
  const [tone, setTone] = useState('Excited')
  const [duration, setDuration] = useState('30s')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  // Voiceover tab state
  const [voText, setVoText] = useState('')
  const [voice, setVoice] = useState('tongtong')
  const [speed, setSpeed] = useState(1.0)
  const [voLoading, setVoLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [voError, setVoError] = useState<string | null>(null)

  // Voice preview state
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState<string | null>(null)
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null)
  const [previewPlaying, setPreviewPlaying] = useState(false)

  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  // Cleanup object URLs when they change or on unmount to avoid memory leaks.
  // Split into two effects so each cleanup only revokes its own URL.
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  useEffect(() => {
    return () => {
      if (previewAudioUrl) URL.revokeObjectURL(previewAudioUrl)
    }
  }, [previewAudioUrl])

  // Prefill voiceover text when a fresh script result arrives and the
  // voiceover textarea is still empty (lets users flow Script -> Voiceover).
  useEffect(() => {
    if (!voText && result) {
      setVoText(result)
    }
  }, [result, voText])

  const generate = async () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name first')
      return
    }
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/content/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, productName, language, tone, duration }),
      })
      const data = await res.json()
      setResult(data.script || data.result || generateFallback())
    } catch {
      setResult(generateFallback())
    } finally {
      setLoading(false)
    }
  }

  const generateFallback = () => {
    const excited = tone === 'Excited'
    const tag = productName.split(' ').slice(0, 2).join('')
    const scripts: Record<string, string> = {
      'before-after': [
        `Eh, you all won't believe this one lah! 😱`,
        ``,
        `Before: [Show problem/pain point]`,
        ``,
        `After using ${productName}:`,
        `• [Benefit 1]`,
        `• [Benefit 2]`,
        `• [Benefit 3]`,
        ``,
        `Seriously game changer can! ${excited ? 'BEST GILER!' : 'Highly recommend.'}`,
        ``,
        `👉 Click link in bio to grab yours now! Limited stock only lor.`,
        ``,
        `#ShopeeMY #${tag} #Affiliate`,
      ].join('\n'),
      unboxing: [
        `ALOHA everyone! 🎉`,
        ``,
        `Today we unbox the ${productName}! This one I have been eyeing for so long already...`,
        ``,
        `*opens box*`,
        ``,
        `Wah, packaging very premium one! Inside got:`,
        `✨ [Item 1]`,
        `✨ [Item 2]`,
        `✨ [Item 3]`,
        ``,
        `The quality confirm worth every ringgit lah. ${excited ? 'I AM SHAKING!' : 'Solid build.'}`,
        ``,
        `Link below — grab before sold out! 🔥`,
      ].join('\n'),
      tutorial: [
        `Hey kawan-kawan! 👋`,
        ``,
        `Today I teach you how to use ${productName} properly. Many people don't know the right way one...`,
        ``,
        `Step 1: [First step]`,
        `Step 2: [Second step]`,
        `Step 3: [Third step]`,
        ``,
        `Easy right? ${excited ? 'CONFIRM CAN ONE!' : 'Practice makes perfect.'}`,
        ``,
        `Get yours from my Shopee link! 🛒`,
      ].join('\n'),
      review: [
        `Real talk time about ${productName} 💯`,
        ``,
        `I've been using this for 2 weeks now, so here's my honest review:`,
        ``,
        `👍 PROS:`,
        `• [Pro 1]`,
        `• [Pro 2]`,
        ``,
        `👎 CONS:`,
        `• [Con 1]`,
        ``,
        `Overall: ${excited ? '9/10 WORTH IT LAH!' : '8/10, solid purchase.'}`,
        ``,
        `Link below if you want to try 👇`,
      ].join('\n'),
      comparison: [
        `${productName} vs [Competitor] — which one better ah? 🤔`,
        ``,
        `Let us compare:`,
        ``,
        `💰 Price: [Comparison]`,
        `⭐ Quality: [Comparison]`,
        `📦 Features: [Comparison]`,
        `💯 Value: [Comparison]`,
        ``,
        `My verdict: ${excited ? productName + ' WINS HANDS DOWN!' : 'Both good, but ' + productName + ' slightly better.'}`,
        ``,
        `Grab the winner here 👇`,
      ].join('\n'),
      story: [
        `So this happened to me last week... 😅`,
        ``,
        `I was struggling with [problem] until I found ${productName}.`,
        ``,
        `At first I thought, "Confirm scam one this." But after trying...`,
        ``,
        `Wah. LIFE CHANGED. ${excited ? 'NO JOKE!' : 'Genuinely impressed.'}`,
        ``,
        `If you got same problem, try lah. Link below 👇`,
      ].join('\n'),
    }
    return scripts[template] || `Here is your ${language} script for ${productName}!\n\n[Tone: ${tone} | Duration: ${duration}]\n\n[Your generated content will appear here. Add product details and customize as needed.]\n\n👉 Don't forget your affiliate link!`
  }

  const copyResult = () => {
    navigator.clipboard.writeText(result)
    toast.success('Script copied to clipboard!')
  }

  // ---- Voiceover helpers ----

  const generateVoiceover = async () => {
    const trimmed = voText.trim()
    if (!trimmed) {
      toast.error('Please enter some script text first')
      return
    }
    if (trimmed.length > TTS_CHAR_LIMIT) {
      toast.info(`Text is over ${TTS_CHAR_LIMIT} chars and will be truncated`)
    }
    setVoLoading(true)
    setVoError(null)
    // Revoke the previous audio URL to prevent memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    try {
      const res = await fetch('/api/ai/voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, voice, speed }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Generation failed' }))
        throw new Error(err.error)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      toast.success('Voiceover generated successfully!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed'
      setVoError(msg)
      toast.error(msg)
    } finally {
      setVoLoading(false)
    }
  }

  const previewVoice = async (voiceId: string) => {
    // If preview already loaded for this voice, just toggle play/pause
    if (previewVoiceId === voiceId && previewAudioUrl && previewAudioRef.current) {
      if (previewAudioRef.current.paused) {
        try {
          await previewAudioRef.current.play()
          setPreviewPlaying(true)
        } catch {
          /* ignore */
        }
      } else {
        previewAudioRef.current.pause()
        setPreviewPlaying(false)
      }
      return
    }

    setPreviewLoading(voiceId)
    // Revoke previous preview audio
    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl)
      setPreviewAudioUrl(null)
    }
    try {
      const voiceName = voices.find((v) => v.id === voiceId)?.name ?? voiceId
      const previewText = `Hi there, I am ${voiceName}. This is a short sample of my voice.`
      const res = await fetch('/api/ai/voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: previewText, voice: voiceId, speed: 1.0 }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Preview failed' }))
        throw new Error(err.error)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPreviewAudioUrl(url)
      setPreviewVoiceId(voiceId)
      setPreviewPlaying(true)
      // Auto-play after the audio element updates with the new src
      setTimeout(() => {
        previewAudioRef.current?.play().catch(() => {
          /* user gesture required on some browsers */
        })
      }, 80)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Preview failed'
      toast.error(msg)
    } finally {
      setPreviewLoading(null)
    }
  }

  const downloadAudio = () => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `voiceover-${voice}-${Date.now()}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('Download started')
  }

  const regenerateVoiceover = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setVoError(null)
    void generateVoiceover()
  }

  const useScriptForVoiceover = () => {
    if (result) {
      setVoText(result)
      toast.success('Script loaded into voiceover')
    } else {
      toast.error('Generate a script first')
    }
  }

  const charCount = voText.length
  const overLimit = charCount > TTS_CHAR_LIMIT
  const selectedVoice = voices.find((v) => v.id === voice)
  const currentSpeedLabel =
    speedMarks.find((m) => Math.abs(m.value - speed) < 0.05)?.label ??
    `${speed.toFixed(1)}x`

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Studio"
        subtitle="Generate scripts & voiceovers for your content"
        icon={Icons.Clapperboard}
        accent="hermes"
      >
        <Button variant="outline" size="sm">
          <Icons.History className="mr-1 size-4" /> History
        </Button>
      </PageHeader>

      <Tabs defaultValue="script">
        <TabsList>
          <TabsTrigger value="script">
            <Icons.FileText className="mr-1.5 size-4" /> Script
          </TabsTrigger>
          <TabsTrigger value="voiceover">
            <Icons.Mic className="mr-1.5 size-4" /> Voiceover
          </TabsTrigger>
        </TabsList>

        <TabsContent value="script">
          <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
            {/* Generator form */}
            <Card className="border-border/60">
              <div className="border-b p-4">
                <h3 className="text-sm font-semibold">Script Generator</h3>
                <p className="text-xs text-muted-foreground">AI-powered content creation</p>
              </div>
              <CardContent className="space-y-4 p-4">
                {/* Template */}
                <div className="space-y-2">
                  <Label className="text-xs">Template</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={cn(
                          'rounded-lg border-2 p-2 text-left transition-all',
                          template === t.id
                            ? 'border-hermes bg-hermes/5'
                            : 'border-border hover:border-hermes/40'
                        )}
                      >
                        <p className="text-xs font-medium">{t.label}</p>
                        <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product name */}
                <div className="space-y-1.5">
                  <Label htmlFor="product" className="text-xs">Product Name</Label>
                  <Input
                    id="product"
                    placeholder="e.g., Safi Balqis UV Sunblock SPF50"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>

                {/* Language */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Duration (s)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {durations.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={cn(
                          'rounded-lg border-2 py-1.5 text-xs font-medium transition-all',
                          duration === d ? 'border-hermes bg-hermes/5 text-hermes' : 'border-border hover:border-hermes/40'
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={generate} disabled={loading} className="w-full bg-hermes-gradient hover:opacity-90">
                  {loading ? (
                    <><Icons.Loader2 className="mr-1 size-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Icons.Sparkles className="mr-1 size-4" /> Generate Script</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Result */}
            <Card className="border-border/60">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h3 className="text-sm font-semibold">Result</h3>
                  <p className="text-xs text-muted-foreground">Your AI-generated script</p>
                </div>
                {result && (
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" onClick={copyResult}>
                      <Icons.Copy className="mr-1 size-3.5" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast.success('Saved to library!')}>
                      <Icons.Bookmark className="mr-1 size-3.5" /> Save
                    </Button>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                {loading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <Icons.Loader2 className="mx-auto size-8 animate-spin text-hermes" />
                      <p className="mt-2 text-sm text-muted-foreground">HERMES is writing your script...</p>
                    </div>
                  </div>
                ) : result ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{templates.find(t => t.id === template)?.label}</Badge>
                      <Badge variant="outline" className="text-[10px] bg-hermes/5 text-hermes">{language}</Badge>
                      <Badge variant="outline" className="text-[10px]">{tone}</Badge>
                      <Badge variant="outline" className="text-[10px]">{duration}</Badge>
                    </div>
                    <Textarea
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      className="min-h-[400px] resize-none font-mono text-sm leading-relaxed"
                    />
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-xs">
                      <span className="text-muted-foreground">
                        {result.length} characters · ~{Math.ceil(result.split(' ').length / 130)}s read time
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => setActivePage('auto-post')}>
                        <Icons.Send className="mr-1 size-3" /> Schedule Post
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center text-center">
                    <div>
                      <Icons.Clapperboard className="mx-auto size-12 text-muted-foreground/30" />
                      <p className="mt-3 text-sm text-muted-foreground">Generated script will appear here</p>
                      <p className="text-xs text-muted-foreground">Fill in the form and click Generate Script</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============ VOICEOVER TAB ============ */}
        <TabsContent value="voiceover">
          <div className="space-y-4">
            {/* Script input + controls row */}
            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              {/* Script textarea card */}
              <Card className="border-border/60">
                <div className="flex items-center justify-between border-b p-4">
                  <div>
                    <h3 className="text-sm font-semibold">Voiceover Script</h3>
                    <p className="text-xs text-muted-foreground">
                      Paste or type the text you want narrated
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={useScriptForVoiceover}
                    disabled={!result}
                    title={!result ? 'Generate a script in the Script tab first' : 'Load the latest script'}
                  >
                    <Icons.FileText className="mr-1 size-3.5" /> Use Script
                  </Button>
                </div>
                <CardContent className="space-y-2 p-4">
                  <Textarea
                    value={voText}
                    onChange={(e) => setVoText(e.target.value)}
                    placeholder="Paste your script here or generate one in the Script tab..."
                    className="min-h-[260px] resize-y text-sm leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Tip: keep it under {TTS_CHAR_LIMIT} chars for best results
                    </span>
                    <span
                      className={cn(
                        'font-mono font-semibold',
                        overLimit ? 'text-destructive' : 'text-muted-foreground'
                      )}
                    >
                      {charCount} / {TTS_CHAR_LIMIT} chars
                      {overLimit && ' (will truncate)'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Speed + Generate card */}
              <Card className="border-border/60">
                <div className="border-b p-4">
                  <h3 className="text-sm font-semibold">Playback Settings</h3>
                  <p className="text-xs text-muted-foreground">Speed & generation</p>
                </div>
                <CardContent className="space-y-5 p-4">
                  {/* Speed slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Speed</Label>
                      <Badge variant="outline" className="bg-hermes/5 text-hermes">
                        {currentSpeedLabel}
                      </Badge>
                    </div>
                    <Slider
                      value={[speed]}
                      onValueChange={(v) => setSpeed(v[0])}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="py-1"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      {speedMarks.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setSpeed(m.value)}
                          className={cn(
                            'transition-colors hover:text-hermes',
                            Math.abs(m.value - speed) < 0.05 && 'font-semibold text-hermes'
                          )}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icons.Mic className="size-3.5 text-hermes" />
                      <span className="font-medium text-foreground">Selected voice</span>
                    </div>
                    <p className="mt-1">
                      {selectedVoice
                        ? `${selectedVoice.name} — ${selectedVoice.desc}`
                        : 'Pick a voice below'}
                    </p>
                  </div>

                  <Button
                    onClick={generateVoiceover}
                    disabled={voLoading || !voText.trim()}
                    className="w-full bg-hermes-gradient hover:opacity-90"
                  >
                    {voLoading ? (
                      <>
                        <Icons.Loader2 className="mr-1 size-4 animate-spin" /> Generating audio...
                      </>
                    ) : (
                      <>
                        <Icons.Sparkles className="mr-1 size-4" /> Generate Voiceover
                      </>
                    )}
                  </Button>
                  <p className="text-center text-[10px] text-muted-foreground">
                    Powered by HERMES AI TTS engine
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Voice selector */}
            <Card className="border-border/60">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h3 className="text-sm font-semibold">Choose a Voice</h3>
                  <p className="text-xs text-muted-foreground">
                    Tap a card to select · tap the play button to preview
                  </p>
                </div>
                <Badge variant="outline" className="bg-hermes/5 text-hermes">
                  {voices.length} voices
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {voices.map((v) => {
                    const isSelected = voice === v.id
                    const isPreviewing = previewVoiceId === v.id && !!previewAudioUrl
                    const isPreviewLoading = previewLoading === v.id
                    const VoiceIcon = v.icon
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVoice(v.id)}
                        className={cn(
                          'group relative flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all',
                          isSelected
                            ? 'border-hermes bg-hermes/5 shadow-sm'
                            : 'border-border hover:border-hermes/40 hover:bg-muted/30'
                        )}
                      >
                        {/* Voice icon */}
                        <div
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                            isSelected
                              ? 'bg-hermes text-white'
                              : 'bg-muted text-muted-foreground group-hover:text-hermes'
                          )}
                        >
                          <VoiceIcon className="size-4" />
                        </div>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-semibold">{v.name}</p>
                            {isSelected && (
                              <Icons.Check className="size-3.5 shrink-0 text-hermes" />
                            )}
                          </div>
                          <p className="truncate text-[11px] text-muted-foreground">{v.desc}</p>
                        </div>

                        {/* Preview play button */}
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label={`Preview ${v.name} voice`}
                          onClick={(e) => {
                            e.stopPropagation()
                            void previewVoice(v.id)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              e.stopPropagation()
                              void previewVoice(v.id)
                            }
                          }}
                          className={cn(
                            'flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                            isPreviewing
                              ? 'border-hermes bg-hermes text-white'
                              : 'border-border text-muted-foreground hover:border-hermes hover:text-hermes'
                          )}
                        >
                          {isPreviewLoading ? (
                            <Icons.Loader2 className="size-3.5 animate-spin" />
                          ) : isPreviewing && previewPlaying ? (
                            <Icons.Pause className="size-3.5" />
                          ) : (
                            <Icons.Play className="size-3.5" />
                          )}
                        </span>

                        {/* Now playing indicator */}
                        {isPreviewing && previewPlaying && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                            <span className="flex items-end gap-0.5 rounded-full bg-hermes px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                              <span className="inline-block size-1 animate-pulse rounded-full bg-white" />
                              live
                            </span>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Inline preview audio element (hidden) */}
                <audio
                  ref={previewAudioRef}
                  src={previewAudioUrl ?? undefined}
                  onPlay={() => setPreviewPlaying(true)}
                  onPause={() => setPreviewPlaying(false)}
                  onEnded={() => setPreviewPlaying(false)}
                  className="hidden"
                />

                {/* Preview status bar */}
                {previewVoiceId && previewAudioUrl && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-hermes/30 bg-hermes/5 p-2.5 text-xs">
                    <Icons.Music2 className="size-3.5 text-hermes" />
                    <span className="text-muted-foreground">
                      Previewing:{' '}
                      <span className="font-semibold text-hermes">
                        {voices.find((v) => v.id === previewVoiceId)?.name}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (previewAudioUrl) {
                          URL.revokeObjectURL(previewAudioUrl)
                          setPreviewAudioUrl(null)
                        }
                        setPreviewVoiceId(null)
                        setPreviewPlaying(false)
                      }}
                      className="ml-auto text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audio result / error / empty state */}
            {voError ? (
              <Card className="border-destructive/30">
                <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <Icons.CloudOff className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Voiceover generation is warming up</p>
                    <p className="mt-1 max-w-md text-xs text-muted-foreground">
                      The TTS service is starting up. Please try again in a moment.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateVoiceover}
                    disabled={voLoading}
                  >
                    <Icons.RefreshCw className="mr-1 size-3.5" /> Retry
                  </Button>
                </CardContent>
              </Card>
            ) : audioUrl ? (
              <Card className="border-hermes/30">
                <div className="flex items-center justify-between border-b border-hermes/20 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-hermes text-white">
                      <Icons.AudioLines className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">Your Voiceover</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {selectedVoice?.name} · {currentSpeedLabel} · {Math.min(charCount, TTS_CHAR_LIMIT)} chars
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-success/15 text-success">
                    <Icons.Check className="mr-1 size-3" /> Ready
                  </Badge>
                </div>
                <CardContent className="space-y-4 p-4">
                  <audio
                    controls
                    src={audioUrl}
                    className="w-full"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={downloadAudio}>
                      <Icons.Download className="mr-1 size-3.5" /> Download MP3
                    </Button>
                    <Button size="sm" variant="outline" onClick={regenerateVoiceover} disabled={voLoading}>
                      {voLoading ? (
                        <>
                          <Icons.Loader2 className="mr-1 size-3.5 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <Icons.RefreshCw className="mr-1 size-3.5" /> Generate Again
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (audioUrl) {
                          URL.revokeObjectURL(audioUrl)
                          setAudioUrl(null)
                        }
                        toast.success('Voiceover cleared')
                      }}
                    >
                      <Icons.Trash2 className="mr-1 size-3.5" /> Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-border/60">
                <CardContent className="flex h-48 flex-col items-center justify-center text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-hermes/10 text-hermes">
                    <Icons.AudioLines className="size-6" />
                  </div>
                  <p className="mt-3 text-sm font-medium">Your generated audio will appear here</p>
                  <p className="text-xs text-muted-foreground">
                    Pick a voice, set the speed, then click Generate Voiceover
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
