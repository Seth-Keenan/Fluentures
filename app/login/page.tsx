"use client"

import React from 'react';
import Link from "next/link";
import { FormEvent } from 'react'
import { HttpStatusCode } from 'axios';
import { useRouter } from 'next/navigation'

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
    <div>
      <h1 className="text-center text-4xl">Fluentures Login</h1>
      <main className="flex justify-center items-center min-h-screen bg-gray-100">
        <form className="flex flex-col gap-4 p-6 bg-white shadow-md rounded" onSubmit={onSubmit}>
          <div className='container'>

            <label className="text-4xl">Username</label>
            <input className="border border-black rounded-[.5vw] p-[5px]" placeholder="Enter username" name="username" type="text" required />
            <label>Password</label>
            <input className="border border-black rounded-[.5vw] p-[5px]" placeholder='Enter password' name="password" type="password" required />

            <button type='submit' className="btn btn-success w-full mt-[10px]">Login</button>

            <Link href="/signup" className='btn btn-soft btn-warning mt-[5px]'>
              Not a user? Sign up!
            </Link>

          </div>
        </form>
      </main>
    </div>
  );
}
