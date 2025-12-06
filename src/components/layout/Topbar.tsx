/*export function Topbar() {
  return (
    <div className="border-b">
      <div className="container py-3 text-sm">Mi cuenta</div>
    </div>
  )
}*/
import Button from '@components/ui/Button'
import { useAuth } from '@app/hooks/useAuth'

export default function Topbar({ title = 'Mi cuenta' }: { title?: string }) {
  return (
    <div className="border-b border-graphite/10 bg-white">
      <div className="flex h-14 items-center px-4">
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
      </div>
    </div>
  )
}


