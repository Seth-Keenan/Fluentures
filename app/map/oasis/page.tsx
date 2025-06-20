import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div>
        {/* This is the home icon button */}
        <Link href="/map" className="btn">
            Back
        </Link>
        {/* Add Senrch bar here ****component*/}

        <Link href="/map/oasis/quiz" className="btn">
            Quiz
        </Link>
        
        <Link href="/map/oasis/sentences" className="btn">
            Sentences
        </Link>
        
        <Link href="/map/oasis/story" className="btn">
            Story
        </Link>

        {/* Add word list here ****component*/}

        {/* Not sure what hamburger on this diagram means??? */}

        <Link href="/map/oasis/edit" className="btn">
            Edit Oasis
        </Link>

    </div>
  )
}

export default page