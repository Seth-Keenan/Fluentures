import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className={"flex flex-col"}>
        <Link href="/map" className="btn">
            Back
        </Link>
        <h1>
            Edit your map
        </h1>
        <Link href="/map/edit" className="btn">
            Create Oasis - does nothing
        </Link>
        <Link href="/map/edit" className="btn">
            Remove Oasis - does nothing
        </Link>
    </div>
  )
}

export default page