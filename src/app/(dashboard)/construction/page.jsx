import { useState, useEffect } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { getLeads } from '@/services/leadsService'

export default function Page() {
  const { token } = useAuth()

  const [leads, setLeads] = useState([])

  useEffect(() => {
    if (token) {
      getLeads(token).then(setLeads).catch(console.error)
    }
  }, [token])

  return (
    <div>
      <h1>Leads</h1>
      <ul>
        {leads.map(lead => (
          <li key={lead.leadId}>{lead.leadId}</li>
        ))}
      </ul>
    </div>
  )