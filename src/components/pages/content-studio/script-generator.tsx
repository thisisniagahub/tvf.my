'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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

export interface ScriptGeneratorProps {
  result: string
  setResult: (value: string | ((prev: string) => string)) => void
}

export function ScriptGenerator({ result, setResult }: ScriptGeneratorProps) {
  const { setActivePage } = useAppStore()
  const [template, setTemplate] = useState('before-after')
  const [productName, setProductName] = useState('')
  const [language, setLanguage] = useState('Manglish')
  const [tone, setTone] = useState('Excited')
  const [duration, setDuration] = useState('30s')
  const [loading, setLoading] = useState(false)

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

  const copyResult = () => {
    navigator.clipboard.writeText(result)
    toast.success('Script copied to clipboard!')
  }

  return (
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
  )
}
