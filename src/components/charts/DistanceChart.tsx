'use client'

import { Activity } from '@/lib/llm/types'
import { format, subDays, parseISO } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface DistanceChartProps {
  activities: Activity[]
}

export function DistanceChart({ activities }: DistanceChartProps) {
  // Simple data transformation for the last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i)
    return {
      date: format(d, 'MMM dd'),
      rawDate: d,
      distance: 0
    }
  })

  // Aggregate distance
  activities.forEach(activity => {
    if (activity.activity_type === 'running' && activity.metrics.distance_km) {
      const actDate = format(parseISO(activity.recorded_at), 'MMM dd')
      const day = last7Days.find(d => d.date === actDate)
      if (day) {
        day.distance += Number(activity.metrics.distance_km) || 0
      }
    }
  })

  return (
    <div className="w-full h-80 bg-white border rounded-xl p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">7-Day Distance (km)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={last7Days}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6B7280' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6B7280' }} 
          />
          <Tooltip 
            cursor={{ fill: '#F3F4F6' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="distance" fill="#111827" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
