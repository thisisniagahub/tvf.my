'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { demoConversations } from '@/lib/demo-data'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { ListRowSkeleton } from './_shared'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const suggestedPrompts = [
  { icon: Icons.TrendingUp, text: 'What are the top trending products in Malaysia this week?' },
  { icon: Icons.Sparkles, text: 'Generate a Manglish caption for a skincare product' },
  { icon: Icons.Target, text: 'How can I improve my conversion rate?' },
  { icon: Icons.Coins, text: 'Which products have the highest commission XTRA?' },
]

export function HermesHubPage() {
  const { user } = useAppStore()
  const [conversations, setConversations] = useState(demoConversations)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: `Hello ${user?.name ?? 'there'}! I'm HERMES, your AI Shopee Affiliate Assistant. I can help you analyze products, generate content, optimize campaigns, and find trending opportunities in the Malaysian market. How can I help you today?`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Simulate async loading for conversations sidebar
  const { isLoading: conversationsLoading } = useQuery({
    queryKey: ['hermes-conversations'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500))
      return true
    },
  })

  // Simulate async loading for automated tasks
  const { isLoading: tasksLoading } = useQuery({
    queryKey: ['hermes-tasks'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500))
      return true
    },
  })

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim()
    if (!content || loading) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/hermes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history: messages.slice(-6) }),
      })
      const data = await res.json()
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.response || data.message || 'I apologize, I could not process that request.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const fallback: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Based on your affiliate data, here are your top 5 performing products this month: RGB Mechanical Keyboard (12.3% CVR), Tudung Bawal Premium (35.3% CVR), Portable Blender (30.5% CVR), Wardah Lipstick (31.4% CVR), and Safi Balqis Sunblock (24.1% CVR). Your rates are above the Shopee affiliate average of 8.5%.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, fallback])
    } finally {
      setLoading(false)
    }
  }

  const newChat = () => {
    setMessages([
      {
        id: 'init',
        role: 'assistant',
        content: `Starting a fresh conversation. What would you like to explore?`,
        timestamp: new Date().toISOString(),
      },
    ])
    setActiveConvId(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-hermes-gradient text-white shadow-md">
          <Icons.Bot className="size-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">HERMES AGENT</h1>
            <Badge className="bg-hermes/15 text-hermes">
              <Icons.Sparkles className="mr-1 size-3" /> AI Powered
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Self-Improving AI Agent • Shopee Affiliate Assistant</p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList>
          <TabsTrigger value="chat">
            <Icons.MessageSquare className="mr-1.5 size-4" /> AI Chat
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <Icons.ListChecks className="mr-1.5 size-4" /> Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            {/* Conversations sidebar */}
            <Card className="border-border/60">
              <div className="border-b p-3">
                <Button onClick={newChat} size="sm" className="w-full bg-hermes-gradient hover:opacity-90">
                  <Icons.Plus className="mr-1 size-4" /> New Chat
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-1 p-2">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Conversations
                  </p>
                  {conversationsLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <ListRowSkeleton key={i} />
                      ))
                    : conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={cn(
                        'w-full rounded-lg p-2.5 text-left transition-colors hover:bg-accent/50',
                        activeConvId === conv.id && 'bg-accent'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{conv.title}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{conv.lastActivity}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{conv.messages[0]?.content ?? 'No messages'}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{conv.messageCount} messages</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Chat area */}
            <Card className="flex flex-col border-border/60" style={{ height: 'calc(100vh - 280px)' }}>
              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-4 p-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex gap-3',
                          msg.role === 'user' && 'flex-row-reverse'
                        )}
                      >
                        <Avatar className="size-8 shrink-0">
                          {msg.role === 'assistant' ? (
                            <AvatarFallback className="bg-hermes-gradient text-white text-xs">
                              <Icons.Bot className="size-4" />
                            </AvatarFallback>
                          ) : (
                            <AvatarFallback className="bg-shopee-gradient text-white text-xs">
                              {user?.name?.slice(0, 2).toUpperCase() ?? 'ME'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-4 py-2.5',
                            msg.role === 'assistant'
                              ? 'bg-muted rounded-tl-sm'
                              : 'bg-shopee text-white rounded-tr-sm'
                          )}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex gap-3">
                        <Avatar className="size-8 shrink-0">
                          <AvatarFallback className="bg-hermes-gradient text-white">
                            <Icons.Bot className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                          <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: '0ms' }} />
                          <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: '150ms' }} />
                          <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Suggested prompts */}
              {messages.length <= 1 && (
                <div className="border-t p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Try asking:</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt.text}
                        onClick={() => sendMessage(prompt.text)}
                        className="flex items-center gap-2 rounded-lg border border-border/60 p-2.5 text-left text-xs transition-colors hover:border-hermes/40 hover:bg-hermes/5"
                      >
                        <prompt.icon className="size-4 shrink-0 text-hermes" />
                        <span className="text-muted-foreground">{prompt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage()
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    placeholder="Ask Hermes anything about your affiliate business..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button type="submit" size="icon" disabled={loading || !input.trim()} className="bg-hermes-gradient hover:opacity-90">
                    {loading ? <Icons.Loader2 className="size-4 animate-spin" /> : <Icons.Send className="size-4" />}
                  </Button>
                </form>
                <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                  HERMES is powered by AI. Always verify important advice before acting.
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Icons.ListChecks className="size-5 text-hermes" />
                <h3 className="text-lg font-semibold">HERMES Automated Tasks</h3>
              </div>
              <div className="space-y-3">
                {tasksLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                        <Skeleton className="size-9 shrink-0 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-40" />
                          <Skeleton className="h-3 w-64" />
                        </div>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    ))
                  : [
                  { name: 'Daily trend report', desc: 'Generates a summary of trending products every morning at 8 AM', status: 'active', schedule: 'Daily 8:00 AM' },
                  { name: 'Commission XTRA monitor', desc: 'Watches for new XTRA commission offers on your tracked products', status: 'active', schedule: 'Every 30 min' },
                  { name: 'Weekly performance digest', desc: 'Compiles your weekly stats and sends to your email', status: 'active', schedule: 'Mondays 9:00 AM' },
                  { name: 'Competitor price tracker', desc: 'Monitors price changes on top competitor products', status: 'paused', schedule: 'Every 2 hours' },
                  { name: 'Content calendar generator', desc: 'Auto-generates a month of content ideas based on trends', status: 'draft', schedule: 'Monthly' },
                ].map((task) => (
                  <div key={task.name} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex size-9 items-center justify-center rounded-lg',
                        task.status === 'active' ? 'bg-success/15 text-success' :
                        task.status === 'paused' ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground'
                      )}>
                        <Icons.Clock className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{task.name}</p>
                        <p className="text-xs text-muted-foreground">{task.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{task.schedule}</Badge>
                      <Badge className={cn(
                        task.status === 'active' && 'bg-success/15 text-success',
                        task.status === 'paused' && 'bg-warning/15 text-warning',
                        task.status === 'draft' && 'bg-muted text-muted-foreground'
                      )}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
