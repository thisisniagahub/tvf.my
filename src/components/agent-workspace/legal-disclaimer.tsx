'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import * as Icons from 'lucide-react'

interface LegalDisclaimerProps {
  open: boolean
  onAccept: () => void
  onDecline: () => void
}

/**
 * Agent Automation Legal Disclaimer
 * ---------------------------------
 * Modal shown the first time a user opens the Agent Workspace (or
 * before they execute their first agent task). The user MUST click
 * "I Understand, Proceed" before any agent action can be triggered.
 *
 * The component is purely presentational — accept/decline state is
 * owned by the parent (typically persisted to localStorage so the
 * acknowledgement is sticky across sessions).
 */
export function LegalDisclaimer({ open, onAccept, onDecline }: LegalDisclaimerProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onDecline()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.AlertTriangle className="size-5 text-warning" />
            Agent Automation Disclaimer
          </DialogTitle>
          <DialogDescription>
            Please read and acknowledge before using Agent Automation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
            <p className="font-semibold text-warning">⚠️ Important Legal Notice</p>
          </div>

          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2">
              <Icons.Check className="mt-0.5 size-4 shrink-0 text-success" />
              <span>
                You are solely responsible for all actions performed by the agent using
                your accounts.
              </span>
            </li>
            <li className="flex gap-2">
              <Icons.Check className="mt-0.5 size-4 shrink-0 text-success" />
              <span>
                Browser automation may violate the Terms of Service of some platforms
                (Shopee, Lazada, TikTok, Facebook, Instagram).
              </span>
            </li>
            <li className="flex gap-2">
              <Icons.Check className="mt-0.5 size-4 shrink-0 text-success" />
              <span>
                Your account may be suspended or banned by the platform for automated
                activity.
              </span>
            </li>
            <li className="flex gap-2">
              <Icons.Check className="mt-0.5 size-4 shrink-0 text-success" />
              <span>
                Credentials are stored encrypted and never shared with third parties.
              </span>
            </li>
            <li className="flex gap-2">
              <Icons.Check className="mt-0.5 size-4 shrink-0 text-success" />
              <span>
                TheViralFindsMY is not liable for any account bans, data loss, or legal
                consequences.
              </span>
            </li>
            <li className="flex gap-2">
              <Icons.Check className="mt-0.5 size-4 shrink-0 text-success" />
              <span>
                Use official APIs whenever available. Agent automation is a workaround,
                not a primary solution.
              </span>
            </li>
          </ul>

          <div className="rounded-lg bg-muted p-3 text-xs">
            <p className="font-semibold">Recommended platforms for agent automation:</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge variant="outline" className="border-success/30 text-success">
                TikTok Web (low risk)
              </Badge>
              <Badge variant="outline" className="border-warning/30 text-warning">
                Facebook (medium risk)
              </Badge>
              <Badge variant="outline" className="border-warning/30 text-warning">
                Instagram (medium risk)
              </Badge>
              <Badge variant="outline" className="border-destructive/30 text-destructive">
                Shopee (high risk — use official API)
              </Badge>
              <Badge variant="outline" className="border-destructive/30 text-destructive">
                Lazada (high risk — use official API)
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-2">
          <Button variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button onClick={onAccept} className="bg-shopee-gradient hover:opacity-90">
            <Icons.Check className="mr-1 size-4" /> I Understand, Proceed
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
