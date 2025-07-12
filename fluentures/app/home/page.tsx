import Link from 'next/link'
import React from 'react'
import { LinkAsButton } from "@/app/components/LinkAsButton";

const page = () => {
  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <LinkAsButton href="/social" className="btn">
        Social
      </LinkAsButton>
      <LinkAsButton href="/map" className="btn">
        Map
      </LinkAsButton>
      <LinkAsButton href="/logbook" className="btn">
        Log Book
      </LinkAsButton>
      {/* For now just have this go back but in the future have a log out */}
      <LinkAsButton href="/" className="btn">
        Back
      </LinkAsButton>
    </div>
  )
}

export default page