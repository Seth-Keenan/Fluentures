"use client"

import Link from 'next/link'
import React, { useState } from 'react'
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { useSession } from '@supabase/auth-helpers-react'

const Page = () => {
  const session = useSession()
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="relative h-screen w-screen flex items-center justify-center">
      
      {/* Putting the text on top. Feel free to change */}
      <div className="absolute top-4 w-full text-center">
        {session ? (
          <p>Welcome back user {session.user.email}!</p>
        ) : (
          <p>Not logged in.</p>
        )}
      </div>
      {/* I am just going based on capstone 1 design ideas with the intent of putting either a tent png or svg as the background */}
      
      {/* Map */}
      <LinkAsButton href="/map" size="lg" className="">
        Map
      </LinkAsButton>

      {/* Log Book */}
      <LinkAsButton href="/logbook" size="md" className="absolute top-35 right-50">
        Log Book
      </LinkAsButton>

      {/* Social */}
      <LinkAsButton href="/social" size="md" className="absolute bottom-35 left-50">
        Social
      </LinkAsButton>

      {/* Help (toggle panel instead of redirect) */}
      <LinkAsButton onClick={() => setShowHelp(!showHelp)} size="sm" className="absolute bottom-5 right-5">
        Help
      </LinkAsButton>

      {/* Settings */}
      <LinkAsButton href="/settings" size="sm" className="absolute top-5 left-5">
        <img
          src = "/Icons/gearIcon.svg"
          alt = "Settings"
        />
      </LinkAsButton>

      {/* Help Panel that pops up once clicked. Might add more of a dynamic option for newcomers to press later */}
      {showHelp && (
        <div className="absolute bottom-30 right-5 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
          <h2 className="font-semibold text-lg mb-2">Need help getting started?</h2>
          <p className="text-sm text-gray-700">
            Welcome to Fluentures! Use the Map to create oasis's, the Log Book to track
            progress, and Social to connect with friends!
          </p>
          <button
            className="mt-3 px-3 py-1 bg-amber-400 rounded text-white hover:bg-amber-600"
            onClick={() => setShowHelp(false)}
          >
            Close
          </button>
        </div>
      )}

    </div>
  )
}

export default Page
