// app/components/FriendsPanel.tsx
'use client'

import { useState, useEffect } from 'react'

interface Friend {
  friendship_id: string
  status: string
  friendInfo: {
    email: string
  }
  created_at: string
}

export default function FriendsPanel() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [newFriendEmail, setNewFriendEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFriends()
    loadPendingRequests()
  }, [])

  const loadFriends = async () => {
    const response = await fetch('/api/friends/list?type=accepted')
    const data = await response.json()
    if (data.friends) setFriends(data.friends)
  }

  const loadPendingRequests = async () => {
    const response = await fetch('/api/friends/list?type=pending')
    const data = await response.json()
    if (data.friends) setPendingRequests(data.friends)
  }

  const sendFriendRequest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_email: newFriendEmail })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('Friend request sent!')
        setNewFriendEmail('')
      } else {
        alert(data.error || 'Failed to send request')
      }
    } catch (error) {
      alert('Error sending request')
    }
    setLoading(false)
  }

  const respondToRequest = async (friendshipId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('/api/friends/respond', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendship_id: friendshipId, action })
      })

      if (response.ok) {
        loadFriends()
        loadPendingRequests()
      }
    } catch (error) {
      console.error('Error responding to request:', error)
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Send Friend Request */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Add Friend</h2>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Friend's email"
            value={newFriendEmail}
            onChange={(e) => setNewFriendEmail(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={sendFriendRequest}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Send Request
          </button>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Pending Requests</h2>
          {pendingRequests.map((request) => (
            <div key={request.friendship_id} className="flex justify-between items-center py-2 border-b">
              <span>{request.friendInfo.email}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => respondToRequest(request.friendship_id, 'accept')}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => respondToRequest(request.friendship_id, 'reject')}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Friends ({friends.length})</h2>
        {friends.map((friend) => (
          <div key={friend.friendship_id} className="py-2 border-b">
            {friend.friendInfo.email}
          </div>
        ))}
      </div>
    </div>
  )
}