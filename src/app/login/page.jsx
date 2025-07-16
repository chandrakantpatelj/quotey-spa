'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { login } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async e => {
    e.preventDefault()

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className='flex justify-center items-center h-screen'>
      <form onSubmit={handleLogin} className='flex flex-col gap-4 p-6 bg-white rounded shadow-md'>
        <h2 className='text-xl font-bold'>Login</h2>
        {error && <p className='text-red-500'>{error}</p>}
        <input
          type='text'
          placeholder='Email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          className='border p-2 rounded'
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          className='border p-2 rounded'
        />
        <button type='submit' className='bg-blue-600 text-white p-2 rounded'>
          Login
        </button>
      </form>
    </div>
  )
}
