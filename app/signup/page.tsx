"use client"

import React from 'react';
import { FormEvent } from 'react'
import { HttpStatusCode } from 'axios';
import { useRouter } from 'next/navigation'
import Link from 'next/link';

export default function LoginPage() {

  // Define a router upon successful login
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    
    const body = {
      name: formData.get("name"),
      username: formData.get("username"),
      password: formData.get("password"),
    }

    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    // Handle lgoin response
    const result = await response.json();
    if (response.ok) {
      console.log("You're signed up!");
      router.push("/login")
      return HttpStatusCode.Ok;
    }
    else {
      console.error("Signup failed!", response.status, result.message);
      return response.status;
    }
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen bg-[#f2e6c2]'>
      <p className='text-4xl font-bold mb-4 text-gray-500'>Sign up</p>
      <p className='text-sm text-gray-700 mb-2'>Upon sign up, you must confirm your email before logging in.</p>
        <form className="flex flex-col gap-4 p-6 bg-white shadow-md rounded-xl" onSubmit={onSubmit}>
          <div className='container flex flex-col justify-center gap-4'>
            <div className='flex flex-col'>
              <label>Name</label>
              <input className="border border-black rounded-[.5vw] p-[5px]" placeholder='Enter name' name="name" type="name" required />
            </div>
            <div className='flex flex-col'>
              <label>Username</label>
              <input className="border border-black rounded-[.5vw] p-[5px]" placeholder="Enter username" name="username" type="text" required />
            </div>
            <div className='flex flex-col'>
              <label>Password</label>
              <input className="border border-black rounded-[.5vw] p-[5px]" placeholder='Enter password' name="password" type="password" required />
            </div>
            <div className='flex flex-col items-center gap-4'>
              <button type='submit' className="px-4 py-2 bg-amber-400 text-white rounded hover:bg-amber-800 transition: duration-200">Sign up</button>
              <Link href="/login" style={{textDecoration: "underline", textDecorationColor: "orange", color: "orange"}}>
                Already a user? Sign in!
              </Link>
              <Link href="/" style={{textDecoration: "underline", textDecorationColor: "orange", color: "orange"}}>
                Back to home
              </Link>
            </div>
          </div>
        </form>
    </div>
  );
}
