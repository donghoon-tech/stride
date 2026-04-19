'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateWeeklyPlan } from '@/app/actions/plan'
import { useRouter } from 'next/navigation'

export function GeneratePlanButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const res = await generateWeeklyPlan()
      if (res.success) {
        router.refresh()
      } else {
        alert(res.error || 'Failed to generate plan.')
      }
    } catch {
      alert('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={isLoading}>
      {isLoading ? 'Generating Plan...' : 'Generate New Plan'}
    </Button>
  )
}
