import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createManualActivity } from "@/app/actions/activity"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewActivityPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
          <header>
            <h1 className="text-2xl font-bold tracking-tight">Log Activity</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your workout details manually.</p>
          </header>

          <form action={createManualActivity} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="activity_type" className="text-sm font-medium">Activity Type</label>
              <Input id="activity_type" name="activity_type" defaultValue="running" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">Date & Time</label>
              <Input id="date" name="date" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="distance" className="text-sm font-medium">Distance (km)</label>
                <Input id="distance" name="distance" type="number" step="0.1" placeholder="5.0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium">Duration (mins)</label>
                <Input id="duration" name="duration" type="number" placeholder="30" />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4">Save Activity</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
