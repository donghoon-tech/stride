import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ParsedActivity } from '@/lib/llm/types'

interface ActivityCardProps {
  activity: ParsedActivity
  onConfirm?: () => void
}

export function ActivityCard({ activity, onConfirm }: ActivityCardProps) {
  const { activity_type, metrics, ai_confidence } = activity

  const isHighConfidence = ai_confidence >= 0.8

  return (
    <Card className="w-full max-w-sm mt-2 mb-2 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>{activity_type.charAt(0).toUpperCase() + activity_type.slice(1)}</span>
          <span className="text-xs font-normal text-gray-500">
            Confidence: {(ai_confidence * 100).toFixed(0)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <dt className="font-medium text-gray-500 uppercase text-xs">{key.replace(/_/g, ' ')}</dt>
              <dd className="font-semibold">{String(value)}</dd>
            </div>
          ))}
        </dl>

        {!isHighConfidence && onConfirm && (
          <div className="mt-4 pt-3 border-t flex justify-end">
            <button
              onClick={onConfirm}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Confirm & Save
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
