import { ChatInterface } from '@/components/chat/ChatInterface'

export default function CoachPage() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Coach</h1>
          <p className="text-gray-500 mt-2">Log your workouts naturally. Let AI handle the rest.</p>
        </div>
        
        <ChatInterface />
      </div>
    </div>
  )
}
