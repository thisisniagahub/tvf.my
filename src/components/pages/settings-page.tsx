'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from './_shared'
import { ProfileTab } from './settings/profile-tab'
import { NotificationsTab } from './settings/notifications-tab'
import { BillingTab } from './settings/billing-tab'
import { IntegrationsTab } from './settings/integrations-tab'
import { SecurityTab } from './settings/security-tab'
import { AppearanceTab } from './settings/appearance-tab'
import { AboutTab } from './settings/about-tab'

const TABS = [
  { id: 'profile', label: 'Profile', icon: Icons.User },
  { id: 'notifications', label: 'Notifications', icon: Icons.Bell },
  { id: 'billing', label: 'Billing', icon: Icons.CreditCard },
  { id: 'integrations', label: 'Integrations', icon: Icons.Plug },
  { id: 'security', label: 'Security', icon: Icons.Shield },
  { id: 'appearance', label: 'Appearance', icon: Icons.Palette },
  { id: 'about', label: 'About', icon: Icons.Info },
] as const

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account, integrations, and preferences"
        icon={Icons.Settings}
        accent="shopee"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <TabsList className="flex h-auto w-full shrink-0 flex-col items-stretch gap-1 bg-transparent p-0 lg:w-56">
          {TABS.map((tab) => {
            const TabIcon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="justify-start gap-2 border border-transparent bg-muted/40 px-3 py-2 text-sm data-[state=active]:bg-shopee/10 data-[state=active]:text-shopee data-[state=active]:shadow-none"
              >
                <TabIcon className="size-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-6">
          <TabsContent value="profile" className="mt-0 space-y-6">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 space-y-6">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="billing" className="mt-0 space-y-6">
            <BillingTab />
          </TabsContent>

          <TabsContent value="integrations" className="mt-0 space-y-6">
            <IntegrationsTab />
          </TabsContent>

          <TabsContent value="security" className="mt-0 space-y-6">
            <SecurityTab />
          </TabsContent>

          <TabsContent value="appearance" className="mt-0 space-y-6">
            <AppearanceTab />
          </TabsContent>

          <TabsContent value="about" className="mt-0 space-y-6">
            <AboutTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
