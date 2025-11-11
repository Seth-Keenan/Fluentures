// app/components/FriendsPanel.tsx
'use client'

import { useState, useEffect } from 'react'

interface Friend {
  friendship_id: string
  status: string
  user_id: string
  friend_id: string
  friendInfo?: {
    username: string
    avatar_url?: string
  }
  created_at: string
}

export default function FriendsPanel() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [sentRequests, setSentRequests] = useState<Friend[]>([])
  const [newFriendUsername, setNewFriendUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends')

  useEffect(() => {
    loadFriends()
    loadPendingRequests()
    loadSentRequests()
  }, [])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const loadFriends = async () => {
    try {
      const response = await fetch('/api/friends/list?type=accepted')
      const data = await response.json()
      if (data.friends) {
        // Get user info for friends
        const friendsWithInfo = await Promise.all(
          data.friends.map(async (friendship: Friend) => {
            const friendId = friendship.user_id !== friendship.friend_id 
              ? friendship.friend_id 
              : friendship.user_id
            const userResponse = await fetch(`/api/users/${friendId}`)
            const userData = await userResponse.json()
            return {
              ...friendship,
              friendInfo: userData.user || { username: 'Unknown' }
            }
          })
        )
        setFriends(friendsWithInfo)
      }
    } catch (error) {
      console.error('Error loading friends:', error)
    }
  }

  const loadPendingRequests = async () => {
    try {
      const response = await fetch('/api/friends/list?type=pending')
      const data = await response.json()
      if (data.friends) {
        // Get user info for pending requests
        const requestsWithInfo = await Promise.all(
          data.friends.map(async (friendship: Friend) => {
            const userResponse = await fetch(`/api/users/${friendship.user_id}`)
            const userData = await userResponse.json()
            return {
              ...friendship,
              friendInfo: userData.user || { username: 'Unknown' }
            }
          })
        )
        setPendingRequests(requestsWithInfo)
      }
    } catch (error) {
      console.error('Error loading pending requests:', error)
    }
  }

  const loadSentRequests = async () => {
    try {
      const response = await fetch('/api/friends/list?type=sent')
      const data = await response.json()
      if (data.friends) {
        const requestsWithInfo = await Promise.all(
          data.friends.map(async (friendship: Friend) => {
            const userResponse = await fetch(`/api/users/${friendship.friend_id}`)
            const userData = await userResponse.json()
            return {
              ...friendship,
              friendInfo: userData.user || { username: 'Unknown' }
            }
          })
        )
        setSentRequests(requestsWithInfo)
      }
    } catch (error) {
      console.error('Error loading sent requests:', error)
    }
  }

  const sendFriendRequest = async () => {
    if (!newFriendUsername.trim()) {
      showMessage('error', 'Please enter a username')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_username: newFriendUsername.trim() })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        showMessage('success', 'Friend request sent!')
        setNewFriendUsername('')
        loadSentRequests()
      } else {
        showMessage('error', data.error || 'Failed to send request')
      }
    } catch (error) {
      showMessage('error', 'Error sending request')
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
        showMessage('success', `Friend request ${action}ed`)
        loadFriends()
        loadPendingRequests()
      } else {
        const data = await response.json()
        showMessage('error', data.error || `Failed to ${action} request`)
      }
    } catch (error) {
      showMessage('error', `Error ${action}ing request`)
    }
  }

  const removeFriend = async (friendshipId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return

    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showMessage('success', 'Friend removed')
        loadFriends()
      } else {
        showMessage('error', 'Failed to remove friend')
      }
    } catch (error) {
      showMessage('error', 'Error removing friend')
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h1 className="text-3xl font-bold text-white">Friends</h1>
          <p className="text-blue-100 mt-1">Connect with other learners</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'friends'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'requests'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'add'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Add Friend
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Friends List */}
          {activeTab === 'friends' && (
            <div className="space-y-3">
              {friends.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No friends yet</p>
                  <p className="text-sm mt-2">Add friends to see their learning progress!</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.friendship_id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {friend.friendInfo?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {friend.friendInfo?.username || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Friends since {new Date(friend.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFriend(friend.friendship_id)}
                      className="text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Pending Requests (Received) */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Pending Requests</h3>
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm">No pending requests</p>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.friendship_id}
                        className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {request.friendInfo?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-gray-900">
                            {request.friendInfo?.username || 'Unknown User'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => respondToRequest(request.friendship_id, 'accept')}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondToRequest(request.friendship_id, 'reject')}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Sent Requests</h3>
                {sentRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm">No sent requests</p>
                ) : (
                  <div className="space-y-3">
                    {sentRequests.map((request) => (
                      <div
                        key={request.friendship_id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                            {request.friendInfo?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-gray-900">
                            {request.friendInfo?.username || 'Unknown User'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">Pending...</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Friend */}
          {activeTab === 'add' && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Add a Friend</h3>
                <p className="text-gray-600 text-sm">Enter your friend's username to send them a request</p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter username"
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendFriendRequest()}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendFriendRequest}
                  disabled={loading}
                  className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Sending...' : 'Send Friend Request'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}