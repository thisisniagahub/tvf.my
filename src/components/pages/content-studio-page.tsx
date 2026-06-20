'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from './_shared'
import { ScriptGenerator } from './content-studio/script-generator'
import { VoiceoverStudio } from './content-studio/voiceover-studio'

export function ContentStudioPage() {
  // Latest generated script — shared between the Script tab (writer) and
  // the Voiceover tab (reader, used to prefill the textarea).
  const [result, setResult] = useState('')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Studio"
        subtitle="Generate scripts & voiceovers for your content"
        icon={Icons.Clapperboard}
        accent="hermes"
      >
        <Button variant="outline" size="sm">
          <Icons.History className="mr-1 size-4" /> History
        </Button>
      </PageHeader>

      <Tabs defaultValue="script">
        <TabsList>
          <TabsTrigger value="script">
            <Icons.FileText className="mr-1.5 size-4" /> Script
          </TabsTrigger>
          <TabsTrigger value="voiceover">
            <Icons.Mic className="mr-1.5 size-4" /> Voiceover
          </TabsTrigger>
        </TabsList>

        <TabsContent value="script">
          <ScriptGenerator result={result} setResult={setResult} />
        </TabsContent>

        <TabsContent value="voiceover">
          <VoiceoverStudio result={result} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
