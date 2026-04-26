'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError("Email and password are required.")
      setIsLoading(false)
      return
    }

    if (!trimmedEmail.includes('.') || !trimmedEmail.includes('@')) {
      setError("Please enter a valid email format (e.g., user@gmail.com).")
      setIsLoading(false)
      return
    }
    
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: trimmedEmail, 
          password: trimmedPassword 
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ 
          email: trimmedEmail, 
          password: trimmedPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (error) {
          if (error.message.includes('valid email')) {
            throw new Error("This email domain might be blocked. Please try a different one (e.g., @gmail.com).")
          }
          throw error
        }
      }
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnonymousLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md border">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-sm text-gray-500">Stride - Your AI Fitness Coach</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleEmailAuth}>
          <div className="flex flex-col space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>
          <Button className="w-full py-6 text-base" type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className="space-y-4 pt-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              disabled={isLoading}
            >
              Switch to {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full text-gray-500 font-normal" 
              onClick={handleAnonymousLogin}
              disabled={isLoading}
            >
              Continue Anonymously
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

