'use client'

import { useEffect, useRef, useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

export interface VoiceoverStudioProps {
  /** Latest generated script result — used to prefill the voiceover textarea. */
  result: string
}

export function VoiceoverStudio({ result }: VoiceoverStudioProps) {
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
  )
}
