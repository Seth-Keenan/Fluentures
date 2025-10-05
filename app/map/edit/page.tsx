import { LinkAsButton } from '@/app/components/LinkAsButton'
import React from 'react'
import CreateOasisAndEditButton from './CreateOasisAndEditButton'

const page = () => {
  return (
    <div className={"flex flex-col justify-center items-center h-screen"}>
        <h1>
            This page is supposed to be where you can create a new oasis and delete oases
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