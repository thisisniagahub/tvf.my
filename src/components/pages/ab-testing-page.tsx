'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader, SectionCard } from './_shared'
import { formatNumber } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface Experiment {
  id: string
  name: string
  variantA: { label: string; content: string }
  variantB: { label: string; content: string }
  metric: string
  variantAClicks: number
  variantBClicks: number
  variantACvr: number
  variantBCvr: number
  winner: 'A' | 'B' | 'tie' | 'pending'
  confidence: number
  status: 'running' | 'paused' | 'completed'
  daysRunning: number
}

const experiments: Experiment[] = [
  {
    id: 'exp1',
    name: 'Safi Balqis Caption Tone',
    variantA: { label: 'Excited Manglish', content: 'BEST GILER! 😱 Confirm must have lah!' },
    variantB: { label: 'Soft Educational', content: 'Halah certified SPF50 — gentle on skin' },
    metric: 'Conversion rate',
    variantAClicks: 412,
    variantBClicks: 387,
    variantACvr: 24.3,
    variantBCvr: 31.8,
    winner: 'B',
    confidence: 92,
    status: 'running',
    daysRunning: 5,
  },
  {
    id: 'exp2',
    name: 'RGB Keyboard Thumbnail Style',
    variantA: { label: 'Bold red gradient', content: 'High-contrast red with big text' },
    variantB: { label: 'Minimal dark', content: 'Clean black background, product only' },
    metric: 'Click-through rate',
    variantAClicks: 528,
    variantBClicks: 461,
    variantACvr: 18.6,
    variantBCvr: 21.4,
    winner: 'A',
    confidence: 87,
    status: 'running',
    daysRunning: 7,
  },
  {
    id: 'exp3',
    name: 'Tudung Bawal Posting Time',
    variantA: { label: '12PM lunch post', content: 'Posted at lunch hour' },
    variantB: { label: '8PM golden post', content: 'Posted at golden hour' },
    metric: 'Engagement rate',
    variantAClicks: 234,
    variantBClicks: 478,
    variantACvr: 12.1,
    variantBCvr: 28.9,
    winner: 'B',
    confidence: 96,
    status: 'completed',
    daysRunning: 14,
  },
  {
    id: 'exp4',
    name: 'Wardah Lipstick Hook Style',
    variantA: { label: 'Question hook', content: 'Eh which halal lipstick best ah?' },
    variantB: { label: 'Bold claim', content: 'I found the BEST halal lipstick EVER' },
    metric: 'Watch time',
    variantAClicks: 0,
    variantBClicks: 0,
    variantACvr: 0,
    variantBCvr: 0,
    winner: 'pending',
    confidence: 0,
    status: 'paused',
    daysRunning: 2,
  },
]

const pastExperiments = [
  { id: 'pe1', name: 'Portable Blender CTA', winner: 'B', learning: '"Tap link below" outperformed "Click in bio" by 47% — direct CTA wins.', confidence: 94 },
  { id: 'pe2', name: 'Anker Power Bank Hashtag Count', winner: 'A', learning: '5 hashtags beat 20 hashtags — less is more on TikTok.', confidence: 88 },
  { id: 'pe3', name: 'Xiaomi Robot Vac Demo Length', winner: 'B', learning: '45s demo beat 90s — short demos convert better.', confidence: 91 },
]

const resultsData = Array.from({ length: 7 }, (_, i) => {
  const day = i + 1
  return {
    day: `Day ${day}`,
    variantA: 20 + i * 1.5 + Math.random() * 3,
    variantB: 18 + i * 2.8 + Math.random() * 3,
  }
})

export function AbTestingPage() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [variantA, setVariantA] = useState('')
  const [variantB, setVariantB] = useState('')
  const [metric, setMetric] = useState('Conversion rate')
  const [duration, setDuration] = useState('7')

  const createExperiment = () => {
    if (!name || !variantA || !variantB) {
      toast.error('Fill in all fields lah — name + both variants required')
      return
    }
    toast.success(`Experiment "${name}" created — HERMES will track it for ${duration} days 🧪`)
    setOpen(false)
    setName(''); setVariantA(''); setVariantB(''); setDuration('7')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="A/B Testing"
        subtitle="Run experiments, learn what works, scale the winners. HERMES does the stats for you."
        icon={Icons.FlaskConical}
        accent="hermes"
      >
        <Badge className="bg-hermes-gradient text-white">
          <Icons.Sparkles className="mr-1 size-3" /> AI Powered
        </Badge>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-hermes-gradient hover:opacity-90">
              <Icons.Plus className="mr-1 size-4" /> Create Experiment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create A/B Experiment</DialogTitle>
              <DialogDescription>Set up two variants — HERMES will track performance and pick a winner.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="exp-name" className="text-xs">Experiment name</Label>
                <Input id="exp-name" placeholder="e.g., Safi Balqis Caption Tone" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Variant A content</Label>
                  <Textarea value={variantA} onChange={(e) => setVariantA(e.target.value)} placeholder="Type variant A copy…" className="min-h-[100px] resize-none text-xs" />
                  <Badge variant="outline" className="text-[10px] bg-shopee/5 text-shopee">Variant A</Badge>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Variant B content</Label>
                  <Textarea value={variantB} onChange={(e) => setVariantB(e.target.value)} placeholder="Type variant B copy…" className="min-h-[100px] resize-none text-xs" />
                  <Badge variant="outline" className="text-[10px] bg-hermes/5 text-hermes">Variant B</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Primary metric</Label>
                  <Select value={metric} onValueChange={setMetric}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conversion rate">Conversion rate</SelectItem>
                      <SelectItem value="Click-through rate">Click-through rate</SelectItem>
                      <SelectItem value="Engagement rate">Engagement rate</SelectItem>
                      <SelectItem value="Watch time">Watch time</SelectItem>
                      <SelectItem value="Revenue per click">Revenue per click</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Duration (days)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days (quick)</SelectItem>
                      <SelectItem value="7">7 days (standard)</SelectItem>
                      <SelectItem value="14">14 days (deep)</SelectItem>
                      <SelectItem value="30">30 days (long)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={createExperiment} className="bg-hermes-gradient hover:opacity-90">
                <Icons.FlaskConical className="mr-1 size-4" /> Start experiment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Active experiments table */}
      <SectionCard
        title="Active Experiments"
        description="Live A/B tests running now"
        icon={Icons.FlaskConical}
        action={<Badge variant="outline" className="text-hermes">{experiments.filter(e => e.status === 'running').length} running</Badge>}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Experiment</TableHead>
                <TableHead>Variant A</TableHead>
                <TableHead>Variant B</TableHead>
                <TableHead className="text-right">Clicks A/B</TableHead>
                <TableHead className="text-right">CVR A/B</TableHead>
                <TableHead>Winner</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiments.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold">{exp.name}</p>
                      <p className="text-[10px] text-muted-foreground">{exp.metric} · {exp.daysRunning}d</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[140px]">
                      <Badge variant="outline" className="text-[10px] bg-shopee/5 text-shopee">{exp.variantA.label}</Badge>
                      <p className="mt-1 truncate text-[10px] text-muted-foreground" title={exp.variantA.content}>{exp.variantA.content}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[140px]">
                      <Badge variant="outline" className="text-[10px] bg-hermes/5 text-hermes">{exp.variantB.label}</Badge>
                      <p className="mt-1 truncate text-[10px] text-muted-foreground" title={exp.variantB.content}>{exp.variantB.content}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <p className="font-semibold">{formatNumber(exp.variantAClicks)}</p>
                    <p className="text-muted-foreground">{formatNumber(exp.variantBClicks)}</p>
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <p className="font-semibold">{exp.variantACvr}%</p>
                    <p className="text-muted-foreground">{exp.variantBCvr}%</p>
                  </TableCell>
                  <TableCell>
                    {exp.winner === 'pending' ? (
                      <Badge variant="outline" className="text-[10px]">Pending</Badge>
                    ) : exp.winner === 'tie' ? (
                      <Badge variant="outline" className="text-[10px]">Tie</Badge>
                    ) : (
                      <Badge className={cn(
                        'text-[10px]',
                        exp.winner === 'A' ? 'bg-shopee/15 text-shopee' : 'bg-hermes/15 text-hermes'
                      )}>
                        <Icons.Trophy className="mr-0.5 size-3" /> Variant {exp.winner}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {exp.confidence > 0 ? (
                      <div className="flex flex-col items-end">
                        <span className={cn(
                          'text-xs font-bold',
                          exp.confidence >= 90 ? 'text-success' : exp.confidence >= 75 ? 'text-warning' : 'text-muted-foreground'
                        )}>{exp.confidence}%</span>
                        <span className="text-[9px] text-muted-foreground">
                          {exp.confidence >= 90 ? 'Significant' : exp.confidence >= 75 ? 'Strong' : 'Weak'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => toast.info('Opening details…')}>
                        <Icons.Eye className="size-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => toast.info(exp.status === 'paused' ? 'Resumed' : 'Paused')}>
                        {exp.status === 'paused' ? <Icons.Play className="size-3.5" /> : <Icons.Pause className="size-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Results chart */}
        <SectionCard
          title="Performance Over Time"
          description="Variant A vs Variant B — cumulative CVR"
          icon={Icons.LineChart}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resultsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="variantA" name="Variant A" stroke="var(--shopee)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="variantB" name="Variant B" stroke="var(--hermes)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Past experiments with learnings */}
        <SectionCard
          title="Past Experiments"
          description="What HERMES learned"
          icon={Icons.GraduationCap}
        >
          <div className="space-y-3">
            {pastExperiments.map((pe) => (
              <div key={pe.id} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold">{pe.name}</p>
                  <Badge variant="outline" className="text-[10px]">
                    <Icons.Trophy className="mr-0.5 size-3 text-warning" /> Var {pe.winner}
                  </Badge>
                </div>
                <div className="mt-2 flex items-start gap-2">
                  <Icons.Lightbulb className="mt-0.5 size-3.5 shrink-0 text-warning" />
                  <p className="text-xs text-muted-foreground">{pe.learning}</p>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Confidence: <span className="font-semibold text-success">{pe.confidence}%</span></span>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => toast.info('Applying learning to your next post…')}>
                    Apply learning
                  </Button>
                </div>
              </div>
            ))}
            <Card className="border-hermes/30 bg-gradient-to-br from-hermes/[0.05] to-transparent">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-hermes-gradient text-white">
                    <Icons.Bot className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">HERMES insight</p>
                    <p className="text-[10px] text-muted-foreground">From {pastExperiments.length} past experiments</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  💡 Pattern: <span className="font-semibold text-foreground">Direct CTAs + shorter content + evening posts</span> consistently win. Apply this template to new content lah.
                </p>
              </CardContent>
            </Card>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
