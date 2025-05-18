import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className={"flex flex-col"}>
        <Link href="/home" className="btn">
            Back
        </Link>
        <h2>Social Page</h2>
    </div>
  )
}

export default page