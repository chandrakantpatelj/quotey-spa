'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import userPool from '@/lib/cognitoConfig'

export const useAuth = () => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const currentUser = userPool.getCurrentUser()

    if (!currentUser) {
      router.push('/login')
    } else {
      currentUser.getSession((err, session) => {
        if (err || !session.isValid()) {
          router.push('/login')
        } else {
          setUser(currentUser)
          setToken(session.getAccessToken().getJwtToken())
        }
      })
    }
  }, [router])

  return { user, token }
}
