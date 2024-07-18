import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          Welcome to Customs-AI Chatbot!
        </h1>
        <p className="leading-normal text-muted-foreground">
          Powered by OpenAI, use this chatbot to help with all your customs needs.
        </p>
      </div>
    </div>
  )
}
