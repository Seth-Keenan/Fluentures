import { LinkAsButton } from '@/app/components/LinkAsButton'
import React from 'react'

const page = () => {
  return (
    <div className='flex flex-col justify-center items-center h-screen'>
        {/* This is the home icon button */}
        <LinkAsButton href="/oasis/quiz" className="btn">
            Quiz
        </LinkAsButton>
        
        <LinkAsButton href="/oasis/sentences" className="btn">
            Sentences
        </LinkAsButton>
        
        <LinkAsButton href="/oasis/story" className="btn">
            Story
        </LinkAsButton>
        <LinkAsButton href="/oasis/edit" className="btn">
            Edit Oasis
        </LinkAsButton>
        <LinkAsButton href="/map" className="btn">
            Back
        </LinkAsButton>

    </div>
  )
}

export default page