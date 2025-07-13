import React from 'react'
import { LinkAsButton } from '../components/LinkAsButton'

const page = () => {
  return (
    <div className={"flex flex-col justify-center items-center h-screen"}>
        <h2>Logbook Page</h2>
        <LinkAsButton href="/home" className="btn">
            Back
        </LinkAsButton>
    </div>
  )
}

export default page