'use client'

import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionCard } from '../_shared'
import { McpSections } from '../mcp-sections'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const integrations = [
  { name: 'Shopee API', desc: 'Sync products, orders & commissions', icon: Icons.ShoppingBag, status: 'connected', color: 'text-shopee' },
  { name: 'TikTok Shop', desc: 'Cross-post & track TikTok sales', icon: Icons.Music, status: 'disconnected', color: 'text-foreground' },
  { name: 'Lazada', desc: 'Multi-platform affiliate tracking', icon: Icons.ShoppingCart, status: 'disconnected', color: 'text-success' },
  { name: 'Telegram Bot', desc: 'Get instant alerts on Telegram', icon: Icons.Send, status: 'disconnected', color: 'text-hermes' },
  { name: 'WhatsApp Business', desc: 'Send reports & alerts via WA', icon: Icons.MessageCircle, status: 'disconnected', color: 'text-success' },
  { name: 'Google Analytics', desc: 'Track click attribution', icon: Icons.BarChart3, status: 'connected', color: 'text-warning' },
]

export function IntegrationsTab() {
  return (
    <>
      {/* MCP Servers + Plugins — external agent servers and automation extensions */}
      <McpSections />

      <SectionCard title="Connected Platforms" description="Link your affiliate accounts and tools" icon={Icons.Plug}>
        <div className="grid gap-3 sm:grid-cols-2">
          {integrations.map((int) => {
            const IntIcon = int.icon
            const isConnected = int.status === 'connected'
            return (
              <Card key={int.name} className="border-border/60 transition-all hover:shadow-md">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={cn('flex size-10 items-center justify-center rounded-lg bg-muted', int.color)}>
                    <IntIcon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{int.name}</p>
                      {isConnected ? (
                        <Badge className="gap-1 bg-success text-white">
                          <Icons.Check className="size-3" /> Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Connected</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{int.desc}</p>
                    <Button
                      variant={isConnected ? 'outline' : 'default'}
                      size="sm"
                      className={cn('mt-3 h-7 text-xs', !isConnected && 'bg-shopee-gradient hover:opacity-90')}
                      onClick={() => toast.success(isConnected ? `${int.name} disconnected` : `${int.name} connected`, {
                        description: isConnected ? 'You can reconnect anytime' : 'Syncing your data now...',
                      })}
                    >
                      {isConnected ? (
                        <>
                          <Icons.Unlink className="mr-1 size-3" /> Disconnect
                        </>
                      ) : (
                        <>
                          <Icons.Plus className="mr-1 size-3" /> Connect
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </SectionCard>
    </>
  )
}
