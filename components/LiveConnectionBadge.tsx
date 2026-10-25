import type { LiveConnectionStatus } from '@/hooks/useVisitorLiveRefresh'

export default function LiveConnectionBadge({ status }: { status: LiveConnectionStatus }) {
  const live = status === 'live'
  return <span role="status" className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${live ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}><span className={`h-2 w-2 rounded-full ${live ? 'bg-green-600' : 'bg-amber-600'}`} aria-hidden="true" />{live ? 'Live' : status === 'connecting' ? 'Connecting' : 'Reconnecting'}</span>
}
