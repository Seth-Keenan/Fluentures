import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className={"flex flex-col"}>
        <Link href="/map/oasis" className="btn">
            Back
        </Link>
        <h1>
            Here I think we could include different kinds of quizzes in one page instead of multiple on each oasis screen. - Something to discuss
        </h1>
    </div>
  )
}

export default page