'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@aws-amplify/auth' // named import

export default function PrivateLayout({ children }) {
  const router = useRouter()

  useEffect(() => {
    getCurrentUser().catch(() => {
      router.push('/en/login')
    })
  }, [router])

  return <>{children}</>
}
