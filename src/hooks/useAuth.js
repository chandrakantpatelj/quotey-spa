'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import userPool from '@/lib/cognitoConfig'

export const useAuth = () => {
  const router = useRouter()

  useEffect(() => {
    const user = userPool.getCurrentUser()

    if (!user) {
      router.push('/login')
    }
  }, [router])
}
