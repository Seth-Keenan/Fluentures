"use client"

import React from 'react';
import { FormEvent } from 'react'
import { HttpStatusCode } from 'axios';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = formData.get("username") as string
    const password = formData.get("password") as string

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login failed:", error.message)
      return
    }

    // Force a hard reload instead of using router.push()
    // This ensures cookies are properly set before the next request
    window.location.href = "/home"
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen bg-[#f2e6c2]'>
      <p className='text-4xl font-bold mb-4 text-gray-500'>Login</p>
      <form className="flex flex-col gap-4 p-6 bg-white shadow-md rounded-xl" onSubmit={onSubmit}>
        <div className='container flex flex-col justify-center gap-4'>
          <div className='flex flex-col'>
            <label>Username</label>
            <input className="border border-black rounded-[.5vw] p-[5px]" placeholder="Enter username" name="username" type="text" required />
          </div>
          <div className='flex flex-col'>
            <label>Password</label>
            <input className="border border-black rounded-[.5vw] p-[5px]" placeholder='Enter password' name="password" type="password" required />
          </div>
          <div className='flex flex-col items-center gap-4'>
            <button type='submit' className="px-4 py-2 bg-amber-400 text-white rounded hover:bg-amber-800 transition: duration-200">Login</button>
            <Link href="/signup" style={{ textDecoration: "underline", textDecorationColor: "orange", color: "orange" }}>
              Not a user? Sign up!
            </Link>
            <Link href="/" style={{ textDecoration: "underline", textDecorationColor: "orange", color: "orange" }}>
              Back to home
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
