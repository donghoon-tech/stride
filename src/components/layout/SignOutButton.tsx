'use client'

import { Button } from "@/components/ui/button"
import { signOut } from "@/app/actions/auth"
import { LogOut } from "lucide-react"
import { useTransition } from "react"

export function SignOutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-gray-500 hover:text-red-600 hover:bg-red-50"
      onClick={() => startTransition(() => signOut())}
      disabled={isPending}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isPending ? 'Signing out...' : 'Sign Out'}
    </Button>
  )
}
