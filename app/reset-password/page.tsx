"use client"

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClientComponentClient()

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for the password reset link')
      }
    } catch (err) {
      setError('An error occurred while requesting password reset')
    }
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen bg-[#f2e6c2]'>
      <p className='text-4xl font-bold mb-4 text-gray-500'>Reset Password</p>
      <form className="flex flex-col gap-4 p-6 bg-white shadow-md rounded-xl" onSubmit={handleResetPassword}>
        <div className='container flex flex-col justify-center gap-4'>
          <div className='flex flex-col'>
            <label>Email</label>
            <input
              className="border border-black rounded-[.5vw] p-[5px]"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {message && <p className="text-green-600 text-center">{message}</p>}
          {error && <p className="text-red-600 text-center">{error}</p>}
          <div className='flex flex-col items-center gap-4'>
            <button type='submit' className="px-4 py-2 bg-amber-400 text-white rounded hover:bg-amber-800 transition: duration-200">
              Send Reset Link
            </button>
            <Link href="/login" style={{ textDecoration: "underline", textDecorationColor: "orange", color: "orange" }}>
              Back to Login
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
