"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const result = await supabase.auth.getSession()
  
        // Handle undefined safely
        if (!result || !result.data) {
          router.push('/login')
          return
        }
  
        const { session } = result.data
  
        if (!session) {
          router.push('/login')
        }
      } catch (err) {
        router.push('/login')
      }
    }
  
    checkSession()
  }, [router, supabase])
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Password updated successfully!')
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      setError('An error occurred while updating the password')
    }
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen bg-[#f2e6c2]'>
      <h1 className='text-4xl font-bold mb-4 text-gray-500'>Update Password</h1>
      <form className="flex flex-col gap-4 p-6 bg-white shadow-md rounded-xl" onSubmit={handleSubmit}>
        <div className='container flex flex-col justify-center gap-4'>
          <div className='flex flex-col'>
            <label>New Password</label>
            <input
              className="border border-black rounded-[.5vw] p-[5px]"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {message && <p className="text-green-600 text-center">{message}</p>}
          {error && <p className="text-red-600 text-center">{error}</p>}
          <div className='flex flex-col items-center gap-4'>
            <button type='submit' className="px-4 py-2 bg-amber-400 text-white rounded hover:bg-amber-800 transition: duration-200">
              Update Password
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
