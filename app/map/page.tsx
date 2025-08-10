import React from 'react'
import { LinkAsButton } from '../components/LinkAsButton'

export const metadata = {
  title: 'Fluentures',
  icons: {
    icon: '/favicon.ico',
  },
}

const page = () => {
  return (
    <div className={"flex flex-col justify-center items-center h-screen"}>
        <h2>Map placeholder</h2>
        <LinkAsButton href="/oasis" className="btn">
            Test Oasis 1
        </LinkAsButton>
        <LinkAsButton href="/map/edit" className="btn">
            Edit Map
        </LinkAsButton>
        <LinkAsButton href="/home" className="btn">
            Back
        </LinkAsButton>
    </div>
  )
}

export default page