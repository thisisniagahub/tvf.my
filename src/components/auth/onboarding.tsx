'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { niches } from '@/lib/demo-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface OnboardingFlowProps {
  onComplete: () => void
}

const apiTutorialOptions = [
  {
    id: 'have',
    title: 'Yes, I have',
    desc: 'Skip the API tutorial — jump straight to picking niches.',
    icon: Icons.Rocket,
  },
  {
    id: 'first',
    title: 'No, first time',
    desc: "We'll guide you through connecting your Shopee API step by step.",
    icon: Icons.GraduationCap,
  },
]

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user } = useAppStore()
  const [step, setStep] = useState(0)
  const [apiChoice, setApiChoice] = useState<string | null>(null)
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])

  const toggleNiche = (id: string) => {
    setSelectedNiches((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    )
  }

  const handleSkip = () => {
    toast.info('Onboarding skipped — you can complete it anytime from Settings.')
    onComplete()
  }

  const handleContinue = () => {
    if (step === 1) {
      // API tutorial choice step
      setStep(2)
    } else if (step === 2) {
      // Niche selection
      setStep(3)
    } else if (step === 3) {
      onComplete()
      toast.success('Onboarding complete! Welcome aboard 🎉')
    }
  }

  const canContinue =
    (step === 1 && apiChoice !== null) ||
    (step === 2 && selectedNiches.length > 0) ||
    step === 3

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute -right-40 -top-40 size-96 rounded-full bg-shopee/10 blur-3xl" />
      <div className="absolute -left-40 -bottom-40 size-96 rounded-full bg-hermes/10 blur-3xl" />

      <Card className="relative w-full max-w-2xl border-border/60 shadow-xl">
        <CardContent className="p-6 md:p-8">
          {/* Skip */}
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs text-muted-foreground">
              Skip <Icons.ChevronRight className="size-3" />
            </Button>
          </div>

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-shopee-gradient text-white shadow-lg animate-float">
                <Icons.ShoppingBag className="size-8" />
              </div>
              <h1 className="text-2xl font-bold md:text-3xl">
                Welcome to TheViralFindsMY, {user?.name ?? 'Demo'}!
              </h1>
              <p className="mt-2 text-muted-foreground">
                Let&apos;s get you set up in just a few steps. This won&apos;t take long.
              </p>

              {/* Progress */}
              <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-colors',
                      i === 0 ? 'bg-shopee' : 'bg-muted'
                    )}
                  />
                ))}
              </div>

              <div className="mt-8">
                <Button onClick={() => setStep(1)} size="lg" className="bg-shopee-gradient hover:opacity-90">
                  Let&apos;s Go <Icons.ArrowRight className="ml-1 size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: API tutorial choice */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <Badge className="mb-2 bg-shopee/10 text-shopee">Step 1 of 2</Badge>
                <h2 className="text-xl font-bold">Do you already have your Shopee Affiliate API credentials?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  You&apos;ll need an App ID and API key from the Shopee Affiliate portal.
                </p>
              </div>

              <div className="space-y-3">
                {apiTutorialOptions.map((opt) => {
                  const selected = apiChoice === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setApiChoice(opt.id)}
                      className={cn(
                        'flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all',
                        selected
                          ? 'border-shopee bg-shopee/5 shadow-sm'
                          : 'border-border hover:border-shopee/40 hover:bg-accent/50'
                      )}
                    >
                      <div className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-lg',
                        selected ? 'bg-shopee text-white' : 'bg-muted text-muted-foreground'
                      )}>
                        <opt.icon className="size-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{opt.title}</p>
                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                      </div>
                      {selected && <Icons.CheckCircle2 className="size-5 text-shopee" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Niche selection */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <Badge className="mb-2 bg-shopee/10 text-shopee">Step 2 of 2</Badge>
                <h2 className="text-xl font-bold">Pick your niches</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select at least one niche. We&apos;ll customize your trending products and AI recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {niches.map((niche) => {
                  const selected = selectedNiches.includes(niche.id)
                  return (
                    <button
                      key={niche.id}
                      onClick={() => toggleNiche(niche.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                        selected
                          ? 'border-shopee bg-shopee/5 shadow-sm'
                          : 'border-border hover:border-shopee/40 hover:bg-accent/50'
                      )}
                    >
                      <span className="text-3xl">{niche.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold">{niche.label}</p>
                        <p className="text-[10px] text-muted-foreground">{niche.desc}</p>
                      </div>
                      {selected && (
                        <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-shopee text-white">
                          <Icons.Check className="size-3" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {selectedNiches.length > 0 && (
                <p className="mt-4 text-center text-sm text-success">
                  {selectedNiches.length} niche{selectedNiches.length > 1 ? 's' : ''} selected ✓
                </p>
              )}
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-success/15 text-success">
                <Icons.PartyPopper className="size-8" />
              </div>
              <h1 className="text-2xl font-bold">You&apos;re all set! 🎉</h1>
              <p className="mt-2 text-muted-foreground">
                Your dashboard is ready. Let&apos;s start earning those commissions!
              </p>
              <div className="mt-6 rounded-xl bg-muted/50 p-4 text-left">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Your setup</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedNiches.map((id) => {
                    const n = niches.find((x) => x.id === id)
                    return n ? (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full bg-shopee/10 px-2.5 py-1 text-xs font-medium text-shopee">
                        {n.emoji} {n.label}
                      </span>
                    ) : null
                  })}
                  <span className="inline-flex items-center gap-1 rounded-full bg-hermes/10 px-2.5 py-1 text-xs font-medium text-hermes">
                    <Icons.Bot className="size-3" /> HERMES AI ready
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step > 0 && (
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <Icons.ChevronLeft className="mr-1 size-4" /> Back
              </Button>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'size-2 rounded-full transition-colors',
                      i === step ? 'bg-shopee' : i < step ? 'bg-shopee/40' : 'bg-muted'
                    )}
                  />
                ))}
              </div>
              <Button
                onClick={handleContinue}
                disabled={!canContinue}
                className="bg-shopee-gradient hover:opacity-90"
              >
                {step === 3 ? 'Enter Dashboard' : 'Continue'}{' '}
                <Icons.ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
