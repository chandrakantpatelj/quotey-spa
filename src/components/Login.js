import { useState } from 'react'

import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')

  const [password, setPassword] = useState('')

  const [error, setError] = useState('')

  const { signIn } = useAuth()

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      await signIn(username, password)
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='max-w-md mx-auto mt-8'>
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-2'>Username</label>
        <input
          type='text'
          value={username}
          onChange={e => setUsername(e.target.value)}
          className='w-full px-3 py-2 border rounded-md'
          required
        />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-2'>Password</label>
        <input
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          className='w-full px-3 py-2 border rounded-md'
          required
        />
      </div>

      {error && <div className='text-red-500 text-sm mb-4'>{error}</div>}
      <button type='submit' className='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600'>
        Sign In
      </button>
    </form>
  )
}
