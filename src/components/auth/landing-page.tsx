'use client'

import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

// ============ ANIMATED COUNTER ============
function Counter({ value, prefix = '', suffix = '', duration = 2 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const animate = () => {
      const elapsed = (Date.now() - start) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [inView, value, duration])

  const formatted = display.toLocaleString('en-MY', { maximumFractionDigits: 1 })
  return <span ref={ref} className="stat-number">{prefix}{formatted}{suffix}</span>
}

// ============ MARQUEE TEXT ============
function Marquee({ text, speed = 30 }: { text: string; speed?: number }) {
  return (
    <div className="relative flex overflow-hidden py-4">
      <motion.div
        className="flex shrink-0 items-center gap-8 whitespace-nowrap pr-8"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {[...Array(8)].map((_, i) => (
          <span key={i} className="heading-font text-3xl font-bold uppercase tracking-tight text-white/10 md:text-5xl">
            {text} <span className="text-[var(--accent)]/30">✦</span>
          </span>
        ))}
      </motion.div>
      <motion.div
        className="flex shrink-0 items-center gap-8 whitespace-nowrap pr-8"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {[...Array(8)].map((_, i) => (
          <span key={i} className="heading-font text-3xl font-bold uppercase tracking-tight text-white/10 md:text-5xl">
            {text} <span className="text-[var(--accent)]/30">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ============ MAGNETIC BUTTON ============
function MagneticButton({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLButtonElement>(null)

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setPos({ x: x * 0.3, y: y * 0.3 })
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  )
}

// ============ MAIN LANDING PAGE ============
export function LandingPage() {
  const { login } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => { login(); toast.success('Welcome to TheViralFindsMY!'); setLoading(false) }, 600)
  }

  return (
    <div className="min-h-screen bg-[#030303] text-[#e5e7eb] overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" } as React.CSSProperties}>
      {/* ============ NAV — Letter-spaced minimalist ============ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-panel border-b border-[var(--border-subtle)]' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg btn-glow">
              <Icons.Zap className="size-5 text-white" />
            </div>
            <span className="heading-font text-lg font-bold text-white">
              TheViral<span className="text-[var(--accent)]">Finds</span>
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {['Features', 'Engine', 'Dashboard', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-white">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden text-xs uppercase tracking-wider text-gray-400 hover:text-white sm:inline-flex" onClick={handleLogin}>
              Sign In
            </Button>
            <MagneticButton onClick={handleLogin} className="btn-glow rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white">
              Start Free
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* ============ HERO — Oversized typography ============ */}
      <section className="relative hero-glow flex min-h-screen items-center justify-center pt-32 pb-20">
        <div className="absolute inset-0 grid-bg opacity-20" />
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 22 }).map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`, height: `${2 + Math.random() * 4}px`,
              animationDelay: `${Math.random() * 4}s`, animationDuration: `${3 + Math.random() * 4}s`,
            }} />
          ))}
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center md:px-8">
          {/* Badge */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="mb-8 flex justify-center">
            <div className="glass-panel premium-border flex items-center gap-2 rounded-full px-4 py-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-2 animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-[var(--accent)]" />
              </span>
              <span className="text-xs uppercase tracking-wider text-gray-300">AI-Powered for Malaysian Market</span>
            </div>
          </motion.div>

          {/* Mega headline — trionn style oversized type */}
          <h1 className="heading-font text-5xl font-extrabold leading-[1.05] text-white md:text-7xl lg:text-8xl">
            {'Designed to'.split(' ').map((word, i) => (
              <span key={i} className="word-3d" style={{ animationDelay: `${i * 0.08}s` }}>{word} </span>
            ))}
            <span className="word-3d bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] bg-clip-text text-transparent" style={{ animationDelay: '0.2s' }}>mean</span>{' '}
            <span className="word-3d text-white" style={{ animationDelay: '0.3s' }}>something.</span>
          </h1>

          {/* Subtext — clean, measured */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="mx-auto mt-8 max-w-2xl text-base text-gray-400 md:text-lg">
            The only AI-powered platform built exclusively for Malaysian affiliates.
            Track 8M+ products across Shopee, TikTok Shop &amp; Lazada. Generate Manglish captions.
            Auto-post to 8 social media platforms.
          </motion.p>

          {/* CTAs — magnetic + clean */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton onClick={handleLogin} className="btn-glow rounded-xl px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white" >
              {loading ? 'Starting...' : 'Start Free Trial'}
            </MagneticButton>
            <button onClick={() => toast.info('Demo coming soon!')} className="rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium uppercase tracking-wider text-gray-400 transition-colors hover:border-white/30 hover:text-white">
              Watch Demo
            </button>
          </motion.div>

          {/* Trust indicators — minimal, spaced */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.6 }} className="mt-20 flex flex-wrap items-center justify-center gap-8 text-xs uppercase tracking-wider text-gray-600">
            <span>NextAuth Secured</span>
            <span className="text-white/10">·</span>
            <span>HERMES AI v2</span>
            <span className="text-white/10">·</span>
            <span>28 Products Tracked</span>
            <span className="text-white/10">·</span>
            <span>Shopee + TikTok + Lazada</span>
          </motion.div>
        </div>
      </section>

      {/* ============ MARQUEE BAND ============ */}
      <div className="border-y border-white/5 py-2">
        <Marquee text="Track · Generate · Automate · Scale" speed={25} />
      </div>

      {/* ============ KEY FACTS — Animated counters (trionn style) ============ */}
      <section className="relative py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)] mb-4">✦ Key Facts</p>
            <h2 className="heading-font text-3xl font-bold text-white md:text-4xl">A snapshot of our impact</h2>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: 8, suffix: 'M+', label: 'Products Tracked', desc: 'Across Shopee, TikTok & Lazada' },
              { value: 28, suffix: '', label: 'Demo Products', desc: 'Live Malaysian market data' },
              { value: 40, suffix: '', label: 'Pages Built', desc: '6 categories, fully functional' },
              { value: 394, suffix: '', label: 'Unit Tests', desc: '100% pass rate' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="heading-font text-5xl font-extrabold text-white md:text-6xl">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-white">{stat.label}</p>
                <p className="mt-1 text-xs text-gray-500">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MARQUEE BAND 2 ============ */}
      <div className="border-y border-white/5 py-2">
        <Marquee text="Shopee · TikTok · Lazada · Facebook · Instagram · Telegram" speed={35} />
      </div>

      {/* ============ ENGINE ROOM ============ */}
      <section id="engine" className="relative py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)] mb-4">✦ The Engine Room</p>
            <h2 className="heading-font text-3xl font-bold text-white md:text-4xl">
              Powered by the <span className="text-[var(--accent)]">HERMES AI</span> Engine
            </h2>
            <p className="mt-3 text-sm text-gray-400">Hover over the glowing hotspots to explore</p>
          </motion.div>

          {/* Engine scene — 3D isometric */}
          <div className="engine-wrapper">
            <div className="engine-scene glass-panel premium-border scan-effect rounded-2xl overflow-hidden">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 grid-bg opacity-20" />
                {/* Server racks */}
                <div className="absolute left-[8%] top-[15%] w-[25%] h-[35%]">
                  <div className="glass-panel premium-border h-full rounded-lg p-3 flex flex-col gap-1.5">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center gap-1.5 rounded bg-[var(--panel-light)] px-2 py-1">
                        <div className="size-1.5 rounded-full bg-[var(--accent)] engine-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        <div className="h-1 flex-1 rounded-full bg-white/5" />
                        <div className="size-1 rounded-full bg-green-500/50" />
                      </div>
                    ))}
                    <div className="mt-auto text-[8px] text-gray-500 font-mono">TREND-SPY.MY</div>
                  </div>
                </div>
                {/* Power core */}
                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-20 blur-2xl engine-pulse" />
                    <div className="relative flex size-20 items-center justify-center rounded-full border-2 border-[var(--accent)]/30 glass-panel">
                      <div className="flex size-12 items-center justify-center rounded-full bg-[var(--accent)]/10">
                        <Icons.Cpu className="size-6 text-[var(--accent)]" />
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border border-[var(--accent)]/10 animate-ping" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="mt-2 text-[8px] text-gray-500 font-mono">HERMES-CORE</div>
                </div>
                {/* Dashboard */}
                <div className="absolute right-[8%] top-[15%] w-[25%] h-[30%]">
                  <div className="glass-panel premium-border h-full rounded-lg p-3">
                    <div className="text-[8px] text-gray-500 font-mono mb-2">DASHBOARD.MY</div>
                    <div className="space-y-1">
                      <div className="flex gap-1"><div className="h-3 flex-1 rounded-sm bg-[var(--accent)]/30" /><div className="h-3 w-1/3 rounded-sm bg-green-500/20" /></div>
                      <div className="flex gap-1"><div className="h-3 w-1/4 rounded-sm bg-hermes/20" /><div className="h-3 flex-1 rounded-sm bg-[var(--accent)]/15" /></div>
                      <div className="flex gap-1"><div className="h-3 flex-1 rounded-sm bg-green-500/15" /><div className="h-3 w-1/3 rounded-sm bg-[var(--accent)]/25" /></div>
                    </div>
                    <div className="mt-2 flex items-center gap-1"><div className="size-1 rounded-full bg-green-500 engine-pulse" /><span className="text-[7px] text-gray-500">LIVE DATA</span></div>
                  </div>
                </div>
                {/* Data streams */}
                <div className="absolute left-[30%] top-[50%] h-[40%] w-px"><div className="data-stream h-full" /></div>
                <div className="absolute right-[30%] top-[50%] h-[40%] w-px"><div className="data-stream h-full" style={{ animationDelay: '0.5s' }} /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LIVE DASHBOARD ============ */}
      <section id="dashboard" className="relative py-20 md:py-32">
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="relative mx-auto max-w-5xl px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)] mb-4">✦ Live Dashboard</p>
            <h2 className="heading-font text-3xl font-bold text-white md:text-4xl">Your Affiliate Command Center</h2>
          </motion.div>

          {/* Alert bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 alert-bar">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10"><Icons.Flame className="size-4 text-[var(--accent)]" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">Fashion is on fire right now</p>
              <p className="text-xs text-gray-400">Tudung Bawal Premium saw a 35% conversion rate — 4x your average</p>
            </div>
            <Button size="sm" className="btn-glow border-0 text-white shrink-0">Boost Now</Button>
          </motion.div>

          {/* Stats — trionn style big numbers */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: 5487.32, prefix: 'RM ', decimals: 2, label: 'Total Earnings', delta: '+12.5%', color: 'var(--accent)' },
              { value: 2847, prefix: '', decimals: 0, label: 'Total Clicks', delta: '+8.2%', color: '#8b5cf6' },
              { value: 26.4, prefix: '', suffix: '%', decimals: 1, label: 'Conversion Rate', delta: '+3.1%', color: '#22c55e' },
              { value: 42, prefix: '', decimals: 0, label: 'Active Links', delta: '+5 new', color: '#facc15' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="glass-panel premium-border iso-tilt rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">{stat.label}</p>
                      <p className="mt-1 text-3xl font-bold text-white">
                        <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix || ''} />
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <Icons.TrendingUp className="size-3 text-green-500" />
                    <span className="text-xs font-semibold text-green-500">{stat.delta}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mini chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-6 glass-panel premium-border rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Earnings Overview</h3>
                <p className="text-xs text-gray-500">Last 30 days performance</p>
              </div>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                <Icons.TrendingUp className="mr-1 size-3" /> +24% growth
              </Badge>
            </div>
            <div className="flex h-40 items-end gap-1.5">
              {[40, 55, 48, 65, 52, 70, 58, 75, 62, 80, 68, 85, 72, 90, 78, 95].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.03 }} className="flex-1 rounded-t bg-gradient-to-t from-[var(--accent)]/20 to-[var(--accent)]/60" />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ MARQUEE BAND 3 ============ */}
      <div className="border-y border-white/5 py-2">
        <Marquee text="Inspire · Innovate · Impact" speed={20} />
      </div>

      {/* ============ FEATURES — Clean grid ============ */}
      <section id="features" className="relative py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)] mb-4">✦ Features</p>
            <h2 className="heading-font text-3xl font-bold text-white md:text-4xl">Different disciplines. One standard of craft.</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Icons.Radar, title: 'Trend Spy Engine', desc: 'Real-time monitoring of 8M+ products across Shopee, TikTok & Lazada with AI viral detection.' },
              { icon: Icons.Bot, title: 'HERMES AI Automation', desc: 'Autonomous agent with memory, skills, cron automation, and subagent delegation.' },
              { icon: Icons.Share2, title: 'Social Media Management', desc: '8 platforms — FB, IG, TikTok, X, YouTube, LinkedIn, WhatsApp, Telegram. Schedule & auto-post.' },
              { icon: Icons.Building2, title: 'Agent Town', desc: 'Pixel RPG world where AI agents live, work, and collaborate in a 3D office.' },
              { icon: Icons.Clapperboard, title: 'Content Studio', desc: 'AI script generator + TTS voiceover with 7 voices. Manglish, Bahasa, English support.' },
              { icon: Icons.ShieldCheck, title: 'Enterprise Security', desc: 'AES-256-GCM encryption, NextAuth, CSRF protection, rate limiting, SSRF defense.' },
            ].map((feat, i) => (
              <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="glass-panel premium-border iso-tilt h-full rounded-xl p-6">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                    <feat.icon className="size-5 text-[var(--accent)]" />
                  </div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white">{feat.title}</h3>
                  <p className="text-xs leading-relaxed text-gray-400">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="relative py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)] mb-4">✦ Pricing</p>
            <h2 className="heading-font text-3xl font-bold text-white md:text-4xl">Start free. Upgrade when you scale.</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Free', price: 'RM 0', period: 'forever', features: ['50 products tracked', 'Basic trend spy', '5 AI content / month', 'Shopee + TikTok + Lazada'], highlight: false },
              { name: 'Pro', price: 'RM 49', period: '/month', features: ['Unlimited products', 'Full HERMES AI', '100 AI content / month', 'Auto-posting', 'Social media mgmt', 'Agent Town access'], highlight: true },
              { name: 'Business', price: 'RM 149', period: '/month', features: ['Everything in Pro', 'Unlimited AI content', 'Team dashboard (5 seats)', 'White-label reports', 'API access'], highlight: false },
              { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Business', 'Unlimited seats', 'Custom integrations', 'SLA guarantee', '24/7 support'], highlight: false },
            ].map((tier, i) => (
              <motion.div key={tier.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`glass-panel premium-border rounded-xl p-6 ${tier.highlight ? 'ring-2 ring-[var(--accent)]/30 relative' : ''}`}>
                {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="btn-glow border-0 text-white">Most Popular</Badge></div>}
                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1"><span className="text-3xl font-extrabold text-white">{tier.price}</span><span className="text-sm text-gray-500">{tier.period}</span></div>
                <MagneticButton onClick={handleLogin} className={`mt-4 w-full rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wider ${tier.highlight ? 'btn-glow text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                  {tier.name === 'Enterprise' ? 'Contact Sales' : 'Start Free'}
                </MagneticButton>
                <ul className="mt-6 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                      <Icons.Check className="mt-0.5 size-3 shrink-0 text-[var(--accent)]" /><span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MARQUEE BAND 4 ============ */}
      <div className="border-y border-white/5 py-2">
        <Marquee text="Built for Malaysian affiliates 🇲🇾" speed={30} />
      </div>

      {/* ============ CTA SECTION ============ */}
      <section className="relative py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)] mb-4">✦ Let's Talk</p>
            <h2 className="heading-font text-4xl font-extrabold text-white md:text-6xl">
              Ready to scale your<br />affiliate business?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm text-gray-400">
              Join thousands of Malaysian affiliates using TheViralFindsMY to track trends, generate content, and automate their social media.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton onClick={handleLogin} className="btn-glow rounded-xl px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white">
                Start Free Trial
              </MagneticButton>
              <button onClick={() => toast.info('Contact us at hello@theviralfinds.my')} className="rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium uppercase tracking-wider text-gray-400 transition-colors hover:border-white/30 hover:text-white">
                Contact Sales
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-lg btn-glow"><Icons.Zap className="size-4 text-white" /></div>
            <span className="text-sm font-bold text-white">TheViral<span className="text-[var(--accent)]">Finds</span></span>
          </div>
          <p className="text-xs uppercase tracking-wider text-gray-600">© 2026 TheViralFindsMY. Built for Malaysian affiliates. 🇲🇾</p>
          <div className="flex items-center gap-4">
            {[Icons.Facebook, Icons.Instagram, Icons.Twitter, Icons.Youtube, Icons.Send].map((Icon, i) => (
              <button key={i} className="text-gray-600 transition-colors hover:text-[var(--accent)]" onClick={() => toast.info('Social link coming soon!')}><Icon className="size-4" /></button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
