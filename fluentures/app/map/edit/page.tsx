import { LinkAsButton } from '@/app/components/LinkAsButton'
import React from 'react'

const page = () => {
  return (
    <div className={"flex flex-col justify-center items-center h-screen"}>
        <h1>
            Edit current oasis here rather than on map - should be easier to implement?
        </h1>
        <LinkAsButton href="/map" className="btn">
            Back
        </LinkAsButton>
    </div>
  )
}

export default page