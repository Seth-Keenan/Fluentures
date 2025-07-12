'use client'

import React, { useEffect, useState } from 'react'

const Page = () => {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await fetch('/api/test')
        if (!res.ok) throw new Error('Failed to fetch API')
        const data = await res.json()
        setMessage(data.message)
      } catch (err) {
        console.error(err)
        setMessage('Error fetching message')
      }
    }

    fetchMessage()
  }, [])

  return (
    <div className='container'>
      <h1 style={{ color: 'grey', fontSize: '24px', marginTop: '50px', marginBottom: '10px' }}>Testing an API call:</h1>
      <p style={{ color: 'gray', fontStyle: 'italic' }}>{message}</p>
    </div>
  )
}

export default Page