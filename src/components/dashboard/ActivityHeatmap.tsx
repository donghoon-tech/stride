import { useMemo } from 'react'
import { format, subDays, startOfDay, eachDayOfInterval, isSameDay } from 'date-fns'
import { Activity } from '@/lib/llm/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ActivityHeatmapProps {
  activities: Activity[]
  days?: number
}

export function ActivityHeatmap({ activities, days = 90 }: ActivityHeatmapProps) {
  // Generate the last N days
  const dateRange = useMemo(() => {
    const end = startOfDay(new Date())
    const start = subDays(end, days - 1)
    return eachDayOfInterval({ start, end })
  }, [days])

  // Group activities by date and calculate intensity
  const heatmapData = useMemo(() => {
    const activityMap = new Map<string, { count: number, distance: number }>()
    
    activities.forEach(activity => {
      const dateStr = format(new Date(activity.recorded_at), 'yyyy-MM-dd')
      const current = activityMap.get(dateStr) || { count: 0, distance: 0 }
      
      const distance = Number((activity.metrics as any)?.distance_km) || 0
      
      activityMap.set(dateStr, {
        count: current.count + 1,
        distance: current.distance + distance
      })
    })

    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const data = activityMap.get(dateStr)
      
      // Calculate level (0-4) based on count or distance
      // 0: none, 1: low, 2: medium, 3: high, 4: very high
      let level = 0
      if (data) {
        if (data.count === 1) level = 1
        if (data.count > 1 || data.distance > 5) level = 2
        if (data.distance > 10) level = 3
        if (data.distance > 20) level = 4
      }

      return {
        date,
        dateStr,
        data,
        level
      }
    })
  }, [activities, dateRange])

  // Get color based on level
  const getColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-emerald-200 dark:bg-emerald-900/40'
      case 2: return 'bg-emerald-400 dark:bg-emerald-700/60'
      case 3: return 'bg-emerald-600 dark:bg-emerald-500/80'
      case 4: return 'bg-emerald-800 dark:bg-emerald-400'
      default: return 'bg-gray-100 dark:bg-gray-800'
    }
  }

  // Group into weeks (columns)
  const weeks = useMemo(() => {
    const weeksArr: typeof heatmapData[] = []
    let currentWeek: typeof heatmapData = []
    
    heatmapData.forEach((day, i) => {
      currentWeek.push(day)
      // If it's Saturday (6) or the last day, push the week
      if (day.date.getDay() === 6 || i === heatmapData.length - 1) {
        weeksArr.push(currentWeek)
        currentWeek = []
      }
    })
    return weeksArr
  }, [heatmapData])

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-fit flex gap-1">
        <TooltipProvider delay={0}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {/* Fill empty days at the start of the first week to align properly */}
              {weekIndex === 0 && week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
                 <div key={`empty-${i}`} className="w-3 h-3 rounded-sm bg-transparent" />
              ))}
              
              {week.map((day) => (
                <Tooltip key={day.dateStr}>
                  <TooltipTrigger
                    className={`w-3 h-3 rounded-sm ${getColor(day.level)} hover:ring-1 hover:ring-black/20 hover:scale-110 transition-all cursor-pointer focus:outline-none border-none p-0 m-0`}
                  />
                  <TooltipContent>
                    <p className="font-medium text-xs">{format(day.date, 'MMM d, yyyy')}</p>
                    {day.data ? (
                      <p className="text-xs text-gray-500 mt-1">
                        {day.data.count} workout{day.data.count > 1 ? 's' : ''}
                        {day.data.distance > 0 ? ` (${day.data.distance}km)` : ''}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">No activity</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </TooltipProvider>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className={`w-3 h-3 rounded-sm ${getColor(0)}`} />
          <div className={`w-3 h-3 rounded-sm ${getColor(1)}`} />
          <div className={`w-3 h-3 rounded-sm ${getColor(2)}`} />
          <div className={`w-3 h-3 rounded-sm ${getColor(3)}`} />
          <div className={`w-3 h-3 rounded-sm ${getColor(4)}`} />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}