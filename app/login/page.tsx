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
      username: formData.get("username"),
      password: formData.get("password"),
    }

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    // Handle lgoin response
    const data = await response.json();
    if (response.ok) {
      console.log("You're logged in!");
      router.push("/home")
      return HttpStatusCode.Ok;
    }
    else {
      console.error("Login failed!");
      return response.status;
    }
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <p className='text-4xl font-bold mb-4'>Login</p>
        <form className="flex flex-col gap-4 p-6 bg-white shadow-md rounded" onSubmit={onSubmit}>
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
              <Link href="/signup" style={{textDecoration: "underline", textDecorationColor: "orange", color: "orange"}}>
                Not a user? Sign up!
              </Link>
            </div>
          </div>
        </form>
    </div>
  );
}