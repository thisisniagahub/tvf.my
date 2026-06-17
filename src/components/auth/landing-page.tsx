'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/ui/logo'
import { AnimatedNumber } from '@/components/ui/animated-number'
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

// Floating particle config for the hero background.
// Each particle gets a deterministic delay/duration/position so it
// renders identically on the server and the client.
const particles = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  left: (i * 53) % 100,
  top: (i * 37) % 100,
  size: 4 + (i % 4),
  delay: (i % 6) * 0.9,
  duration: 8 + (i % 5) * 1.5,
}))

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

  // Stats values parsed for count-up animation
  const stats = useMemo(() => [
    { label: 'Active affiliates', value: 12000, suffix: '+', prefix: '' },
    { label: 'Avg. commission lift', value: 340, suffix: '%', prefix: '+' },
    { label: 'Products tracked', value: 8, suffix: 'M+', prefix: '' },
  ], [])

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Logo size="md" className="text-lg" />
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
        {/* Animated gradient backdrop — slowly cycles between brand hues */}
        <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-shopee/[0.08] via-transparent to-hermes/[0.08]" />
        {/* Grid pattern overlay for a structured, "product dashboard" feel */}
        <div className="absolute inset-0 bg-grid opacity-[0.35]" />
        {/* Soft brand-colored spotlights — anchor the eye to the hero copy */}
        <div className="absolute -right-40 -top-40 size-96 rounded-full bg-shopee/10 blur-3xl" />
        <div className="absolute -left-40 top-40 size-96 rounded-full bg-hermes/10 blur-3xl" />

        {/* Floating particles — decorative dots drifting upward */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className="absolute rounded-full bg-shopee/40 dark:bg-shopee/30"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animation: `particle-drift ${p.duration}s linear infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:px-8 md:py-20">
          {/* Left: Hero */}
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge className="mb-4 w-fit border-shopee/20 bg-shopee/10 text-shopee">
                <Icons.Sparkles className="mr-1 size-3" /> AI-Powered for Malaysian Market
              </Badge>
            </motion.div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl md:leading-[1.05]">
              The Only AI-Powered Platform Built{' '}
              <span className="text-gradient-shopee animate-gradient">Exclusively</span> for{' '}
              <span className="text-gradient animate-gradient">Malaysian Shopee Affiliates</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Discover trending products before everyone else. Generate Manglish-perfect
              captions in seconds. Track every click, conversion, and commission in real-time.
            </p>

            {/* Stats — glassmorphism cards with count-up animation */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
                  className="glass rounded-xl p-3 text-center transition-shadow hover:glow-shopee"
                >
                  <p className="text-2xl font-bold text-shopee md:text-3xl">
                    <AnimatedNumber value={s.value} prefix={s.prefix} suffix={s.suffix} duration={1.6} />
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Button size="lg" onClick={() => handleLogin()} className="bg-shopee-gradient hover:opacity-90 hover:shadow-[0_0_24px_rgba(238,77,45,0.35)] transition-shadow">
                Start Free <Icons.ArrowRight className="ml-1 size-4" />
              </Button>
              <Button size="lg" variant="outline">
                <Icons.Play className="mr-1 size-4" /> Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Login card — glassmorphism + animated gradient border */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="gradient-border relative w-full max-w-md border-border/60 bg-card/80 shadow-xl backdrop-blur-xl">
              <CardContent className="p-6 md:p-8">
                <div className="mb-6 text-center">
                  {/* Logo floats gently — pairs with the `.animate-float` utility */}
                  <div className="mb-3 flex justify-center">
                    <div className="animate-float rounded-2xl p-1">
                      <Logo size="lg" showText={false} />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold">
                    <span className="text-foreground">The</span>
                    <span className="text-shopee">Viral</span>
                    <span className="text-foreground">Finds</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">Ready to start earning? 👋</p>
                </div>

                <Button
                  variant="outline"
                  className="mb-4 w-full hover:border-shopee/40 hover:bg-shopee/5"
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
                      className="h-10 transition-shadow focus-visible:glow-shopee"
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
                        className="h-10 pr-10 transition-shadow focus-visible:glow-shopee"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? <Icons.EyeOff className="size-4" /> : <Icons.Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="h-10 w-full bg-shopee-gradient hover:opacity-90 hover:shadow-[0_0_24px_rgba(238,77,45,0.35)] transition-shadow" disabled={loading}>
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
          </motion.div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold md:text-4xl">
              Affiliates are cashing in with <span className="text-gradient-shopee">TheViralFindsMY</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Everything you need to scale your Shopee commissions</p>
          </motion.div>
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
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="card-hover relative overflow-hidden border-border/60">
                  <CardContent className="p-6">
                    {/* Gradient icon background — matches the value-prop's accent */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -4 }}
                      transition={{ type: 'spring', stiffness: 350 }}
                      className={`mb-4 flex size-12 items-center justify-center rounded-xl ${
                        v.color === 'shopee' ? 'bg-shopee-gradient text-white shadow-[0_0_18px_rgba(238,77,45,0.35)]' :
                        v.color === 'hermes' ? 'bg-hermes-gradient text-white shadow-[0_0_18px_rgba(139,92,246,0.35)]' :
                        'bg-gradient-to-br from-success to-success/60 text-white shadow-[0_0_18px_rgba(34,197,94,0.35)]'
                      }`}
                    >
                      <v.icon className="size-6" />
                    </motion.div>
                    <h3 className="mb-2 text-lg font-bold">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold md:text-4xl">Start free. Upgrade when you scale.</h2>
            <p className="mt-3 text-muted-foreground">No credit card required. Cancel anytime.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                whileHover={tier.highlight
                  ? { y: -8, transition: { duration: 0.25 } }
                  : { y: -4, transition: { duration: 0.25 } }
                }
                style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              >
                <Card
                  className={`relative h-full card-hover ${
                    tier.highlight
                      ? 'border-shopee shadow-lg ring-2 ring-shopee/20 glow-shopee'
                      : 'border-border/60'
                  }`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="animate-gradient bg-shopee-gradient text-white shadow-[0_0_12px_rgba(238,77,45,0.4)]">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold">{tier.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{tier.desc}</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className={`text-3xl font-extrabold ${tier.highlight ? 'text-gradient-shopee' : ''}`}>{tier.price}</span>
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t py-8">
        {/* Gradient divider line above the footer */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-shopee to-transparent" />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">
            © 2025 TheViralFindsMY. Built for Malaysian affiliates. 🇲🇾
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {['Privacy', 'Terms', 'Contact'].map((link) => (
              <button
                key={link}
                className="transition-colors hover:text-shopee"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
