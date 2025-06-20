import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className={"flex flex-col"}>
        <Link href="/home" className="btn">
            Back
        </Link>
        <Link href="/map/oasis" className="btn">
            Choose Oasis
        </Link>
        <Link href="/map/edit" className="btn">
            Edit Map
        </Link>
        <h2>Map placeholder</h2>
    </div>
  )
}

export default page