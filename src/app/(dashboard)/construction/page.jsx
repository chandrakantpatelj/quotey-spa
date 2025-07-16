'use client'

import { useAuth } from '@/hooks/useAuth'

export default function Page() {
  useAuth()

  return <h1>About page!</h1>
}
