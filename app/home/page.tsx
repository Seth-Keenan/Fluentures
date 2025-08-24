"use client"

import Link from 'next/link'
import React from 'react'
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { useSession } from '@supabase/auth-helpers-react'

const page = () => {
  const session = useSession()
  
  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      
      {/* ChatGPT magic, might wanna look up how to properly access sessions in code */}
      {session ? (
        <p>Logged in as {session.user.email}</p>
      ) : (
        <p>Not logged in.</p>
      )}

      <LinkAsButton href="/social" className="btn">
        Social
      </LinkAsButton>
      <LinkAsButton href="/map" className="btn">
        Map
      </LinkAsButton>
      <LinkAsButton href="/logbook" className="btn">
        Log Book
      </LinkAsButton>
      <LinkAsButton href="/settings" className="btn m-1">
          Settings
        </LinkAsButton>
      {/* For now just have this go back but in the future have a log out */}
      <LinkAsButton href="/" className="btn">
        Back
      </LinkAsButton>
    </div>
  )
}

export default page