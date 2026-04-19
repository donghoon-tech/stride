'use client'

import { useState } from 'react'
import { useChatStore } from '@/store/chatStore'
import { processUserMessage } from '@/app/actions/chat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActivityCard } from './ActivityCard'
import { SendIcon } from 'lucide-react'

export function ChatInterface() {
  const [input, setInput] = useState('')
  const { messages, isLoading, addMessage, setLoading } = useChatStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input
    setInput('')
    
    // Optimistic UI update
    addMessage({ role: 'user', content: userMessage })
    setLoading(true)

    try {
      const response = await processUserMessage(userMessage)
      
      if (response.success && response.parsed) {
        if (response.requiresConfirmation) {
          addMessage({
            role: 'assistant',
            content: "I parsed your activity, but I'm not entirely sure. Please confirm.",
            ui_card: response.parsed
          })
        } else {
          // Add the parsed card and the coaching feedback
          addMessage({
            role: 'assistant',
            content: response.coaching || 'Activity saved successfully.',
            ui_card: response.parsed
          })
        }
      } else {
        addMessage({
          role: 'assistant',
          content: 'Sorry, I could not understand that activity. Could you try again?'
        })
      }
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: 'An error occurred while processing your request.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full max-w-2xl mx-auto border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-black text-white rounded-br-none'
                    : 'bg-white text-gray-900 border rounded-bl-none shadow-sm'
                }`}
              >
                {msg.content}
              </div>
              
              {/* Render Rich UI Card if available */}
              {msg.ui_card && (
                <div className="mt-2 w-full max-w-sm">
                   <ActivityCard 
                     activity={msg.ui_card} 
                     onConfirm={() => alert("Confirmation logic to be implemented.")} 
                   />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start">
              <div className="bg-white border text-gray-500 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white border-t flex items-center space-x-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Log your workout... e.g. Ran 5km in 28 mins"
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <SendIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
