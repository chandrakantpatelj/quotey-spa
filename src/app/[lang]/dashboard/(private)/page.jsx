'use client' // <-- make it a Client Component

import dynamic from 'next/dynamic'

// ✅ Dynamically load dashboard only on client
const LeadQuoteDashboard = dynamic(() => import('./LeadQuoteDashboard'), {
  ssr: false,
  loading: () => <p>Loading Dashboard...</p>
})

export default function DashboardPage() {
  return <LeadQuoteDashboard />
}
