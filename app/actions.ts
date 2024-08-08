'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import { auth } from '@/auth'
import { type Chat } from '@/lib/types'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching chats:', error)
      return []
    }

    return data as Chat[]
  } catch (error) {
    console.error('Error in getChats:', error)
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const { data: chat, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching chat:', error)
    return null
  }

  return chat as Chat | null
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) {
    return {
      error: 'Failed to remove chat'
    }
  }

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('user_id', session.user.id)

  if (error) {
    return {
      error: 'Failed to clear chats'
    }
  }

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const { data: chat, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', id)
    .eq('share_path', `/share/${id}`)
    .single()

  if (error) {
    console.error('Error fetching shared chat:', error)
    return null
  }

  return chat as Chat | null
}

export async function shareChat(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const { data: chat, error: fetchError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (fetchError) {
    return {
      error: 'Failed to fetch chat'
    }
  }

  const sharePath = `/share/${chat.id}`

  const { error: updateError } = await supabase
    .from('chats')
    .update({ share_path: sharePath })
    .eq('id', chat.id)

  if (updateError) {
    return {
      error: 'Failed to share chat'
    }
  }

  return { ...chat, sharePath }
}

export async function saveChat(chat: Chat) {
  const session = await auth()

  if (!session?.user?.id) {
    return
  }

  const { error } = await supabase.from('chats').upsert({
    id: chat.id,
    user_id: chat.userId,
    title: chat.title,
    created_at: chat.createdAt,
    path: chat.path,
    messages: chat.messages,
    share_path: chat.sharePath
  })

  if (error) {
    console.error('Error saving chat:', error)
  }
}

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('name')
      .limit(1)

    if (error) {
      console.error('Error connecting to Supabase:', error)
      return false
    }

    console.log('Successfully connected to Supabase. Sample data:', data)
    return true
  } catch (error) {
    console.error('Error connecting to Supabase:', error)
    return false
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}