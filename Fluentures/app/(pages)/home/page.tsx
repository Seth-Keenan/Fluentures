import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div>
      <Link href="/social" className="btn">
        Social
      </Link>
      <Link href="/map" className="btn">
        Map
      </Link>
      <Link href="/logbook" className="btn">
        Log Book
      </Link>
      {/* For now just have this go back but in the future have a log out */}
      <Link href="/" className="btn">
        Back
      </Link>
    </div>
  )
}

export default page