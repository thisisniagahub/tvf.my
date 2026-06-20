'use client'

import * as Icons from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SectionCard } from '../_shared'
import { formatRM } from '@/lib/demo-data'

const billingHistory = [
  { date: '01 Dec 2025', invoice: 'INV-2025-1201', amount: 99, status: 'paid' },
  { date: '01 Nov 2025', invoice: 'INV-2025-1101', amount: 99, status: 'paid' },
  { date: '01 Oct 2025', invoice: 'INV-2025-1001', amount: 99, status: 'paid' },
  { date: '01 Sep 2025', invoice: 'INV-2025-0901', amount: 99, status: 'paid' },
  { date: '01 Aug 2025', invoice: 'INV-2025-0801', amount: 29, status: 'paid' },
]

export function BillingTab() {
  return (
    <>
      <SectionCard title="Current Plan" description="Your subscription details" icon={Icons.CreditCard}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-warning/15 text-warning">
              <Icons.Crown className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Pro Plan</h3>
                <Badge className="bg-warning text-white">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{formatRM(99)}/month · Next billing 1 Jan 2026</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Change Plan</Button>
            <Button variant="ghost" size="sm" className="text-destructive">Cancel</Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Payment Method" description="How you pay for your subscription" icon={Icons.Wallet}>
        <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
              <Icons.CreditCard className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 08/27 · Ahmad Faizal</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Update</Button>
        </div>
      </SectionCard>

      <SectionCard title="Billing History" description="Your past invoices" icon={Icons.Receipt}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billingHistory.map((inv) => (
              <TableRow key={inv.invoice}>
                <TableCell className="text-sm">{inv.date}</TableCell>
                <TableCell className="font-mono text-xs">{inv.invoice}</TableCell>
                <TableCell className="text-right font-medium">{formatRM(inv.amount)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="gap-1 border-success/30 bg-success/5 text-success">
                    <Icons.Check className="size-3" /> Paid
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-7">
                    <Icons.Download className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </>
  )
}
