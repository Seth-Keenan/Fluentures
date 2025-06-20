import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className={"flex flex-col"}>
        <Link href="/map/oasis" className="btn">
            Back
        </Link>
        <h1>
            Edit current oasis here rather than on map - should be easier to implement?
        </h1>
    </div>
  )
}

export default page