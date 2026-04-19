'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAnonymousLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInAnonymously()
      if (error) {
        alert("Failed to login anonymously. Please check if Anonymous Sign-in is enabled in your Supabase project settings: Authentication -> Providers.")
        console.error(error)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center">Login to Stride</h1>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <Button className="w-full" type="submit" disabled>
            Login (Coming Soon)
          </Button>
        </form>
        <div className="text-center text-sm text-gray-500">
          Or continue without an account
          <Button 
            variant="link" 
            className="w-full mt-2" 
            onClick={handleAnonymousLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login Anonymously'}
          </Button>
        </div>
      </div>
    </div>
  )
}

