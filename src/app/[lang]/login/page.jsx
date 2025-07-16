'use client'

import { useState } from 'react'
import { signIn } from 'aws-amplify/auth'
import { useRouter } from 'next/navigation'

// ✅ Amplify UI React
import { Button, Heading, Text, View, ThemeProvider, TextField, useTheme } from '@aws-amplify/ui-react'

// ✅ Import your custom theme from the provided code
import { theme } from './theme-config' // <-- We'll put your theme in a separate file

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { isSignedIn } = await signIn({ username: email, password })
      if (isSignedIn) {
        router.push('/en/dashboard') // ✅ Redirect after successful login
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f7fa'
        }}
      >
        <View
          backgroundColor='white'
          padding='2rem'
          borderRadius='12px'
          boxShadow='0 4px 10px rgba(0,0,0,0.1)'
          width='400px'
        >
          {/* ✅ Logo */}
          <View textAlign='center' marginBottom='1rem'>
            <img src='/warehouse-img/Logo.png' alt='Logo' style={{ height: '50px' }} />
          </View>

          {/* ✅ Heading */}
          <Heading level={3} textAlign='center' marginBottom='1.5rem'>
            Sign In
          </Heading>

          {/* ✅ Login Form */}
          <form onSubmit={handleLogin}>
            <TextField
              label='Email'
              placeholder='Enter your email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <TextField
              label='Password'
              type='password'
              placeholder='Enter your password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              marginTop='1rem'
            />

            {error && (
              <Text color='red' fontSize='0.9rem' marginTop='0.5rem'>
                {error}
              </Text>
            )}

            <Button type='submit' variation='primary' width='100%' marginTop='1.5rem' isLoading={loading}>
              {loading ? 'Signing In...' : 'Login'}
            </Button>
          </form>

          {/* ✅ Forgot Password Link */}
          <View textAlign='center' marginTop='1rem'>
            <Button variation='link' size='small' onClick={() => router.push('/reset-password')}>
              Forgot Password?
            </Button>
          </View>

          {/* ✅ Footer */}
          <View textAlign='center' marginTop='1.5rem'>
            <Text fontSize='0.85rem' color='gray'>
              &copy; All Rights Reserved
            </Text>
          </View>
        </View>
      </View>
    </ThemeProvider>
  )
}
