// app/community/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faCommentDots,
  faTrashCan,
  faPaperPlane,
  faPlus,
  faPenToSquare,
  faFloppyDisk,
  faXmark,
  faMagnifyingGlass,
  faFilter,
  faUserPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { LinkAsButton } from "@/app/components/LinkAsButton";

type Post = {
  id: string;
  user: string;
  text: string;
  tags: string[];
  createdAt: number;
  likes: number;
  liked?: boolean;
  comments: { id: string; user: string; text: string; createdAt: number }[];
};

type Friend = {
  friendship_id: string;
  user_id: string;
  friend_id: string;
  status: string;
  friendInfo?: {
    social_username: string;
    avatar_url?: string;
  };
  created_at: string;
};

type Activity = {
  activity_id: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
  user: {
    user_id: string;
    social_username: string;
    avatar_url?: string;
  };
};

const POSTS_KEY = "fluentures.community.posts.v1";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function savePosts(posts: Post[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}
function loadPosts(): Post[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    return raw ? (JSON.parse(raw) as Post[]) : [];
  } catch {
    return [];
  }
}
function formatTime(ts: number | string) {
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  return d.toLocaleString();
}
function avatarGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  const h = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h} 70% 60%), hsl(${(h + 40) % 360} 70% 52%))`;
}

export default function CommunityPage() {
  const prefersReducedMotion = useReducedMotion();

  const [me] = useState("You");
  const [view, setView] = useState<"posts" | "friends" | "activity">("posts");

  // Posts (local demo)
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "liked" | "mine">("all");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");

  // Real Friends from DB
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Activity Feed
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    setPosts(loadPosts());
    loadFriends();
    loadPendingRequests();
    loadActivities();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Load friends from API
  const loadFriends = async () => {
    try {
      const response = await fetch('/api/friends/list?type=accepted');
      const data = await response.json();
      if (data.friends) {
        const friendsWithInfo = await Promise.all(
          data.friends.map(async (friendship: Friend) => {
            const friendId = friendship.user_id !== friendship.friend_id 
              ? friendship.friend_id 
              : friendship.user_id;
            const userResponse = await fetch(`/api/users/${friendId}`);
            const userData = await userResponse.json();
            return {
              ...friendship,
              friendInfo: userData.user || { username: 'Unknown' }
            };
          })
        );
        setFriends(friendsWithInfo);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const response = await fetch('/api/friends/list?type=pending');
      const data = await response.json();
      if (data.friends) {
        const requestsWithInfo = await Promise.all(
          data.friends.map(async (friendship: Friend) => {
            const userResponse = await fetch(`/api/users/${friendship.user_id}`);
            const userData = await userResponse.json();
            return {
              ...friendship,
              friendInfo: userData.user || { username: 'Unknown' }
            };
          })
        );
        setPendingRequests(requestsWithInfo);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const response = await fetch('/api/activity/feed');
      const data = await response.json();
      if (data.activities) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!newFriendUsername.trim()) {
      showMessage('error', 'Please enter a username');
      return;
    }

    try {
      const response = await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_username: newFriendUsername.trim() })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', 'Friend request sent!');
        setNewFriendUsername('');
        loadFriends();
      } else {
        showMessage('error', data.error || 'Failed to send request');
      }
    } catch (error) {
      showMessage('error', 'Error sending request');
    }
  };

  const respondToRequest = async (friendshipId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('/api/friends/respond', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendship_id: friendshipId, action })
      });

      if (response.ok) {
        showMessage('success', `Friend request ${action}ed`);
        loadFriends();
        loadPendingRequests();
        if (action === 'accept') loadActivities();
      } else {
        const data = await response.json();
        showMessage('error', data.error || `Failed to ${action} request`);
      }
    } catch (error) {
      showMessage('error', `Error ${action}ing request`);
    }
  };

  const allTags = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    let arr = posts.slice().sort((a, b) => b.createdAt - a.createdAt);
    if (filter === "liked") arr = arr.filter((p) => p.liked);
    if (filter === "mine") arr = arr.filter((p) => p.user === me);
    if (tagFilter) arr = arr.filter((p) => p.tags.includes(tagFilter));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      arr = arr.filter((p) => p.text.toLowerCase().includes(q) || p.user.toLowerCase().includes(q));
    }
    return arr;
  }, [posts, filter, tagFilter, query, me]);

  const filteredFriends = useMemo(() => {
    let arr = friends.slice().sort((a, b) => 
      (a.friendInfo?.social_username || '').localeCompare(b.friendInfo?.social_username || '')
    );
    if (friendSearch.trim()) {
      const q = friendSearch.trim().toLowerCase();
      arr = arr.filter((f) => f.friendInfo?.social_username.toLowerCase().includes(q));
    }
    return arr;
  }, [friends, friendSearch]);

  function createPost() {
    if (!text.trim()) return;
    const tlist = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const newPost: Post = {
      id: uid(),
      user: me,
      text: text.trim(),
      tags: tlist,
      createdAt: Date.now(),
      likes: 0,
      comments: [],
    };
    const next = [newPost, ...posts];
    setPosts(next);
    savePosts(next);
    setText("");
    setTags("");
  }

  function toggleLike(id: string) {
    const next = posts.map((p) =>
      p.id === id
        ? {
            ...p,
            liked: !p.liked,
            likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1,
          }
        : p
    );
    setPosts(next);
    savePosts(next);
  }

  function addComment(id: string, comment: string) {
    if (!comment.trim()) return;
    const next = posts.map((p) =>
      p.id === id
        ? {
            ...p,
            comments: [...p.comments, { id: uid(), user: me, text: comment.trim(), createdAt: Date.now() }],
          }
        : p
    );
    setPosts(next);
    savePosts(next);
  }

  function deletePost(id: string) {
    const next = posts.filter((p) => p.id !== id);
    setPosts(next);
    savePosts(next);
  }

  const formatActivity = (activity: Activity) => {
    const username = activity.user.social_username || 'Unknown User';

    switch (activity.activity_type) {
      case 'word_added':
        return {
          icon: '📝',
          text: `${username} added "${activity.activity_data?.word}" to their vocabulary`,
          color: 'bg-green-500/20 border-green-500/30'
        };
      case 'wordlist_created':
        return {
          icon: '📚',
          text: `${username} created a new word list: "${activity.activity_data?.name}"`,
          color: 'bg-blue-500/20 border-blue-500/30'
        };
      case 'study_session':
        return {
          icon: '✍️',
          text: `${username} completed a study session`,
          color: 'bg-purple-500/20 border-purple-500/30'
        };
      case 'achievement':
        return {
          icon: '🏆',
          text: `${username} earned an achievement: ${activity.activity_data?.name}`,
          color: 'bg-yellow-500/20 border-yellow-500/30'
        };
      default:
        return {
          icon: '📌',
          text: `${username} did something`,
          color: 'bg-gray-500/20 border-gray-500/30'
        };
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {message.text}
        </div>
      )}

      {/* Background */}
      <motion.img
        src="/desert.png"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className="text-white text-3xl sm:text-4xl font-semibold">Community</h1>
            <p className="text-white/85 mt-1">
              Share progress, connect with friends, and track learning together
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <LinkAsButton
              href="/home"
              className="!cursor-pointer inline-flex items-center justify-center w-auto whitespace-nowrap rounded-lg bg-white/20 text-white ring-1 ring-white/30 hover:bg-white/30 transition px-6 py-3"
            >
              Back to Home
            </LinkAsButton>
          </div>
        </motion.div>

        {/* View Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-6 flex gap-2"
        >
          <button
            onClick={() => setView('activity')}
            className={`cursor-pointer px-4 py-2 rounded-lg transition ${
              view === 'activity'
                ? 'bg-white text-gray-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <FontAwesomeIcon icon={faUsers} className="mr-2 h-4 w-4" />
            Friend Activity
          </button>
          <button
            onClick={() => setView('friends')}
            className={`cursor-pointer px-4 py-2 rounded-lg transition relative ${
              view === 'friends'
                ? 'bg-white text-gray-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2 h-4 w-4" />
            Friends
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setView('posts')}
            className={`cursor-pointer px-4 py-2 rounded-lg transition ${
              view === 'posts'
                ? 'bg-white text-gray-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <FontAwesomeIcon icon={faCommentDots} className="mr-2 h-4 w-4" />
            Posts
          </button>
        </motion.div>

        {/* Content based on view */}
        {view === 'activity' && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-3xl mx-auto"
          >
            <motion.div variants={item} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Friend Activity</h2>
                <button
                  onClick={loadActivities}
                  className="cursor-pointer text-white/80 hover:text-white text-sm"
                >
                  Refresh
                </button>
              </div>

              {loadingActivities ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-white/80 text-lg mb-2">No activity yet</p>
                  <p className="text-white/60 text-sm">
                    Add friends to see their learning progress here!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => {
                    const formatted = formatActivity(activity);
                    return (
                      <div
                        key={activity.activity_id}
                        className={`p-4 rounded-lg border-2 ${formatted.color} backdrop-blur-sm`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{formatted.icon}</div>
                          <div className="flex-1">
                            <p className="text-white">{formatted.text}</p>
                            <p className="text-sm text-white/60 mt-1">
                              {getTimeAgo(activity.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {view === 'friends' && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-3xl mx-auto space-y-5"
          >
            {/* Add Friend */}
            <motion.div variants={item} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-5">
              <h3 className="text-white font-semibold mb-3">Add Friend</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter username"
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendFriendRequest()}
                  className="flex-1 bg-white/80 text-gray-900 rounded-lg px-3 py-2 ring-1 ring-white/30 placeholder:text-gray-500 focus:outline-none"
                />
                <button
                  onClick={sendFriendRequest}
                  className="cursor-pointer bg-emerald-500 text-white hover:bg-emerald-400 px-4 py-2 rounded-lg transition"
                >
                  <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                  Send Request
                </button>
              </div>
            </motion.div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <motion.div variants={item} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-5">
                <h3 className="text-white font-semibold mb-3">Pending Requests</h3>
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div key={request.friendship_id} className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white">{request.friendInfo?.social_username}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToRequest(request.friendship_id, 'accept')}
                          className="cursor-pointer bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respondToRequest(request.friendship_id, 'reject')}
                          className="cursor-pointer bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Friends List */}
            <motion.div variants={item} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-semibold">Friends ({friends.length})</h3>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70"
                  />
                  <input
                    className="w-48 bg-white/10 pl-7 pr-2 py-1.5 rounded-lg text-sm text-white ring-1 ring-white/30 placeholder:text-white/60 focus:outline-none"
                    placeholder="Search friends…"
                    value={friendSearch}
                    onChange={(e) => setFriendSearch(e.target.value)}
                  />
                </div>
              </div>

              {filteredFriends.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  No friends yet. Add some above!
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFriends.map((friend) => (
                    <div key={friend.friendship_id} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                      <div
                        className="h-10 w-10 rounded-full ring-2 ring-white/60"
                        style={{ background: avatarGradient(friend.friendInfo?.social_username || '') }}
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">{friend.friendInfo?.social_username}</p>
                        <p className="text-white/60 text-xs">
                          Friends since {new Date(friend.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {view === 'posts' && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5"
          >
            {/* Left: Composer + Feed */}
            <motion.div variants={item} className="lg:col-span-2">
              {/* Composer */}
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 shrink-0 rounded-full ring-2 ring-white/60"
                    style={{ background: avatarGradient(me) }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        className="w-full bg-white/80 text-gray-900 rounded-lg px-3 py-2 ring-1 ring-white/30 placeholder:text-gray-500 focus:outline-none"
                        placeholder="Share what you learned today…"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={createPost}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 ring-1 ring-white/20 transition px-3 py-2"
                      >
                        <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                        Post
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        className="flex-1 bg-white/75 text-gray-900 rounded-lg px-3 py-1.5 ring-1 ring-white/30 placeholder:text-gray-500 focus:outline-none text-sm"
                        placeholder="Tags (comma-separated, e.g., vocab, travel)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feed */}
              <motion.div variants={container} initial="hidden" animate="show" className="mt-4 space-y-3">
                {filtered.length ? (
                  filtered.map((p) => (
                    <PostCard
                      key={p.id}
                      post={p}
                      me={me}
                      onToggleLike={() => toggleLike(p.id)}
                      onDelete={() => deletePost(p.id)}
                      onComment={(t) => addComment(p.id, t)}
                    />
                  ))
                ) : (
                  <motion.div
                    variants={item}
                    className="rounded-xl bg-white/10 text-white p-6 text-center ring-1 ring-white/20"
                  >
                    No posts yet. Share your first update!
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Right: Filters */}
            <motion.div variants={item} className="space-y-5">
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-5 sticky top-24">
                <Filters
                  filter={filter}
                  setFilter={setFilter}
                  tagFilter={tagFilter}
                  setTagFilter={setTagFilter}
                  allTags={allTags}
                  query={query}
                  setQuery={setQuery}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}

function Filters({
  filter,
  setFilter,
  tagFilter,
  setTagFilter,
  allTags,
  query,
  setQuery,
}: {
  filter: "all" | "liked" | "mine";
  setFilter: (f: "all" | "liked" | "mine") => void;
  tagFilter: string;
  setTagFilter: (t: string) => void;
  allTags: string[];
  query: string;
  setQuery: (q: string) => void;
}) {
  return (
    <div className="text-white">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
        <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
        <span className="text-sm">Filters</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {(["all", "liked", "mine"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={[
              "cursor-pointer rounded-lg px-3 py-1.5 text-sm ring-1 transition",
              filter === f
                ? "bg-indigo-500 text-white ring-white/20"
                : "bg-white/10 text-white hover:bg-white/20 ring-white/30",
            ].join(" ")}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
        </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <select
          className="col-span-2 rounded-lg bg-white/10 text-white px-3 py-1.5 text-sm ring-1 ring-white/30 focus:outline-none"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="relative">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70"
          />
          <input
            className="w-full rounded-lg bg-white/10 pl-7 pr-2 py-1.5 text-sm text-white ring-1 ring-white/30 placeholder:text-white/60 focus:outline-none"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function PostCard({
  post,
  me,
  onToggleLike,
  onDelete,
  onComment,
}: {
  post: Post;
  me: string;
  onToggleLike: () => void;
  onDelete: () => void;
  onComment: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [cmt, setCmt] = useState("");

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 shrink-0 rounded-full ring-2 ring-white/60"
          style={{ background: avatarGradient(post.user) }}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/95 font-semibold">{post.user}</div>
              <div className="text-[11px] text-white/70">{formatTime(post.createdAt)}</div>
            </div>
            {post.user === me ? (
              <button
                type="button"
                onClick={onDelete}
                className="cursor-pointer rounded-md bg-white/10 text-white hover:bg-white/20 px-2 py-1 text-xs ring-1 ring-white/30"
                title="Delete post"
              >
                <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
              </button>
            ) : null}
          </div>

          <div className="mt-2 text-white">{post.text}</div>

          {post.tags.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] text-white/90 ring-1 ring-white/20"
                >
                  #{t}
                </span>
              ))}
            </div>
          ) : null}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleLike}
              className={[
                "cursor-pointer inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ring-1 transition",
                post.liked
                  ? "bg-rose-500 text-white ring-white/20"
                  : "bg-white/10 text-white hover:bg-white/20 ring-white/30",
              ].join(" ")}
            >
              <FontAwesomeIcon icon={faHeart} className="h-3 w-3" />
              <span>{post.likes}</span>
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 text-white px-2 py-1 text-xs ring-1 ring-white/30 transition"
            >
              <FontAwesomeIcon icon={faCommentDots} className="h-3 w-3" />
              <span>{post.comments.length}</span>
            </button>
          </div>

          {/* Comments */}
          {open && (
            <div className="mt-3 rounded-xl bg-white/90 p-3 ring-1 ring-white/30 shadow-sm">
              <div className="space-y-2">
                {post.comments.length ? (
                  post.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <div
                        className="h-7 w-7 shrink-0 rounded-full ring-2 ring-white/60"
                        style={{ background: avatarGradient(c.user) }}
                      />
                      <div>
                        <div className="text-sm">
                          <span className="font-semibold">{c.user}</span>{" "}
                          <span className="text-gray-600">{c.text}</span>
                        </div>
                        <div className="text-[10px] text-gray-500">{formatTime(c.createdAt)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-600">No comments yet.</div>
                )}

                {/* Add comment */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    className="flex-1 rounded-md border border-black/10 bg-white px-2 py-1 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none"
                    placeholder="Write a comment…"
                    value={cmt}
                    onChange={(e) => setCmt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onComment(cmt);
                        setCmt("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onComment(cmt);
                      setCmt("");
                    }}
                    className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white px-2 py-1 text-xs ring-1 ring-white/20 transition"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="h-3 w-3" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}