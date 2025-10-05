import { LinkAsButton } from '@/app/components/LinkAsButton'
import React from 'react'
import CreateOasisAndEditButton from './CreateOasisAndEditButton'

const page = () => {
  return (
    <div className={"flex flex-col justify-center items-center h-screen"}>
        <h1>
            Edit current oasis here rather than on map - should be easier to implement?
        </h1>
        {/* create + redirect straight to edit */}
        <CreateOasisAndEditButton />
        <LinkAsButton href="/map" className="btn">
            Back
        </LinkAsButton>
    </div>
  )
}

export default page