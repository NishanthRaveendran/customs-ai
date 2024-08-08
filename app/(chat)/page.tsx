import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { auth } from '@/auth'
import { Session } from '@/lib/types'
import { getMissingKeys, testSupabaseConnection } from '@/app/actions'
import Link from 'next/link'

export const metadata = {
  title: 'Next.js AI Chatbot'
}

export default async function IndexPage() {
  const id = nanoid()
  const session = (await auth()) as Session
  const missingKeys = await getMissingKeys()

  // Test Supabase connection
  const isConnected = await testSupabaseConnection()
  console.log('Supabase connection test result:', isConnected)

  // Debug log
  console.log('Session:', session)

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Welcome to AI Chatbot</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome, {session.user.email}</h1>
      <AI initialAIState={{ chatId: id, messages: [] }}>
        <Chat id={id} session={session} missingKeys={missingKeys} />
      </AI>
    </div>
  )
}