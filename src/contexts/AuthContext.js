'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { Auth } from '@aws-amplify/auth' // ✅ Corrected import

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (username, password) => {
    try {
      const user = await Auth.signIn(username, password)
      setUser(user)
      return user
    } catch (error) {
      throw error
    }
  }

  const signUp = async (username, password, email) => {
    try {
      const result = await Auth.signUp({
        username,
        password,
        attributes: {
          email
        }
      })
      return result
    } catch (error) {
      throw error
    }
  }

  const confirmSignUp = async (username, code) => {
    try {
      await Auth.confirmSignUp(username, code)
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await Auth.signOut()
      setUser(null)
    } catch (error) {
      throw error
    }
  }

  const getToken = async () => {
    try {
      const session = await Auth.currentSession()
      return session.getIdToken().getJwtToken()
    } catch (error) {
      return null
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    getToken
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
