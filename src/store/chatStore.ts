import { create } from 'zustand'
import { ParsedActivity } from '@/lib/llm/types'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  ui_card?: ParsedActivity
}

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  addMessage: (msg: Omit<ChatMessage, 'id'>) => void
  setLoading: (loading: boolean) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  addMessage: (msg) => set((state) => ({ 
    messages: [...state.messages, { ...msg, id: Date.now().toString() }] 
  })),
  setLoading: (loading) => set({ isLoading: loading })
}))
