'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const pricingTiers = [
  {
    name: 'Free',
    price: 'RM 0',
    period: 'forever',
    desc: 'Perfect for getting started',
    features: ['50 products tracked', 'Basic trend spy', '5 AI content / month', 'Shopee platform only', 'Community support'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'RM 49',
    period: '/month',
    desc: 'For serious affiliates',
    features: ['Unlimited products', 'Full trend spy', '100 AI content / month', 'Shopee + TikTok', 'HERMES AI chat', 'Auto-posting', 'Priority support'],
    cta: 'Start Free',
    highlight: true,
  },
  {
    name: 'Business',
    price: 'RM 149',
    period: '/month',
    desc: 'For growing teams',
    features: ['Everything in Pro', 'Unlimited AI content', 'All platforms', 'Team dashboard (5 seats)', 'White-label reports', 'API access', 'Dedicated manager'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For agencies & brands',
    features: ['Everything in Business', 'Unlimited seats', 'Custom integrations', 'SLA guarantee', 'Onboarding training', 'White-label app', '24/7 support'],
    cta: 'Contact Sales',
    highlight: false,
  },
]

export function LandingPage() {
  const { login } = useAppStore()
  const [email, setEmail] = useState('demo@theviralfindsmy.com')
  const [password, setPassword] = useState('demo1234')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setTimeout(() => {
      login()
      toast.success('Welcome back to TheViralFindsMY!')
      setLoading(false)
    }, 600)
  }

  const fillDemo = () => {
    setEmail('demo@theviralfindsmy.com')
    setPassword('demo1234')
    toast.info('Demo credentials filled!')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-shopee-gradient text-white shadow-sm">
              <Icons.ShoppingBag className="size-5" />
            </div>
            <span className="text-lg font-bold">
              TheViral<span className="text-shopee">FindsMY</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Privacy
            </Button>
            <Button size="sm" onClick={() => handleLogin()} className="bg-shopee-gradient hover:opacity-90">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero + Login */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.4]" />
        <div className="absolute -right-40 -top-40 size-96 rounded-full bg-shopee/10 blur-3xl" />
        <div className="absolute -left-40 top-40 size-96 rounded-full bg-hermes/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:px-8 md:py-20">
          {/* Left: Hero */}
          <div className="flex flex-col justify-center">
            <Badge className="mb-4 w-fit bg-shopee/10 text-shopee border-shopee/20">
              <Icons.Sparkles className="mr-1 size-3" /> AI-Powered for Malaysian Market
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl md:leading-[1.1]">
              The Only AI-Powered Platform Built{' '}
              <span className="text-gradient-shopee">Exclusively</span> for{' '}
              <span className="text-gradient-shopee">Malaysian Shopee Affiliates</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Discover trending products before everyone else. Generate Manglish-perfect
              captions in seconds. Track every click, conversion, and commission in real-time.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: 'Active affiliates', value: '12,000+' },
                { label: 'Avg. commission lift', value: '+340%' },
                { label: 'Products tracked', value: '8M+' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-shopee md:text-3xl">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => handleLogin()} className="bg-shopee-gradient hover:opacity-90">
                Start Free <Icons.ArrowRight className="ml-1 size-4" />
              </Button>
              <Button size="lg" variant="outline">
                <Icons.Play className="mr-1 size-4" /> Watch Demo
              </Button>
            </div>
          </div>

          {/* Right: Login card */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border-border/60 shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-shopee-gradient text-white shadow-md animate-float">
                    <Icons.ShoppingBag className="size-6" />
                  </div>
                  <h2 className="text-xl font-bold">TheViralFindsMY</h2>
                  <p className="text-sm text-muted-foreground">Ready to start earning? 👋</p>
                </div>

                <Button
                  variant="outline"
                  className="mb-4 w-full"
                  onClick={() => handleLogin()}
                  disabled={loading}
                >
                  {loading ? (
                    <Icons.Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Icons.Zap className="mr-2 size-4 text-shopee" />
                  )}
                  Continue with demo account
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or sign in</span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs">Password</Label>
                      <button type="button" className="text-xs text-shopee hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <Icons.EyeOff className="size-4" /> : <Icons.Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="h-10 w-full bg-shopee-gradient hover:opacity-90" disabled={loading}>
                    {loading ? <Icons.Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Sign In
                  </Button>
                </form>

                <Button variant="ghost" size="sm" className="mt-3 w-full text-xs" onClick={fillDemo}>
                  Fill demo credentials →
                </Button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <button className="font-medium text-shopee hover:underline">Create one now</button>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold md:text-4xl">
              Affiliates are cashing in with <span className="text-gradient-shopee">TheViralFindsMY</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Everything you need to scale your Shopee commissions</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Icons.Radar,
                title: 'Discover trending products before everyone else',
                desc: 'Trend Spy monitors 8M+ Shopee products in real-time. See what\'s hot before your competitors do.',
                color: 'shopee',
              },
              {
                icon: Icons.Sparkles,
                title: 'Generate Manglish-perfect captions in seconds',
                desc: 'HERMES AI writes captions that sound like a local — Manglish, Bahasa, or formal. No more writer\'s block.',
                color: 'hermes',
              },
              {
                icon: Icons.BarChart3,
                title: 'Track every click, conversion, and commission in real-time',
                desc: 'Live dashboard with WebSocket updates. See sales the moment they happen, not tomorrow.',
                color: 'success',
              },
            ].map((v) => (
              <Card key={v.title} className="relative overflow-hidden border-border/60">
                <CardContent className="p-6">
                  <div className={`mb-4 flex size-12 items-center justify-center rounded-xl ${
                    v.color === 'shopee' ? 'bg-shopee/10 text-shopee' :
                    v.color === 'hermes' ? 'bg-hermes/10 text-hermes' : 'bg-success/10 text-success'
                  }`}>
                    <v.icon className="size-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold md:text-4xl">Start free. Upgrade when you scale.</h2>
            <p className="mt-3 text-muted-foreground">No credit card required. Cancel anytime.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative ${
                  tier.highlight
                    ? 'border-shopee shadow-lg ring-2 ring-shopee/20'
                    : 'border-border/60'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-shopee-gradient text-white">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold">{tier.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{tier.desc}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{tier.price}</span>
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  </div>
                  <Button
                    className="mt-4 w-full"
                    variant={tier.highlight ? 'default' : 'outline'}
                    onClick={() => handleLogin()}
                  >
                    {tier.cta}
                  </Button>
                  <ul className="mt-6 space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Icons.Check className="mt-0.5 size-4 shrink-0 text-success" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-shopee-gradient text-white">
              <Icons.ShoppingBag className="size-4" />
            </div>
            <span className="text-sm font-bold">TheViralFindsMY</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 TheViralFindsMY. Built for Malaysian affiliates. 🇲🇾
          </p>
        </div>
      </footer>
    </div>
  )
}
