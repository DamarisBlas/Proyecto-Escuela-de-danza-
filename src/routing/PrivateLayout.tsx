import { Outlet } from 'react-router-dom'
import AccountTabs from '@components/layout/AccountTabs'

export default function PrivateLayout() {
  return (
    <section className="py-6">
      {/* Tabs por rol: se muestran una sola vez */}
      <AccountTabs />
      <div className="container py-6">
        <Outlet />
      </div>
    </section>
  )
}
