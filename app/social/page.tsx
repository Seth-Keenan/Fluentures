"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faCommentDots,
  faTrashCan,
  faPaperPlane,
  faPlus,
  faMagnifyingGlass,
  faFilter,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { deserts } from "@/app/data/deserts";
import PageBackground from "@/app/components/PageBackground";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// ==== TYPES ==========================================================

type Post = {
  id: string;
  user_id?: string;
  user: string; // social_username
  text: string;
  tags: string[];
  createdAt: number;
  likes: number;
  liked_by: string[];
  comments: {
    id: string;
    user: string; // social_username
    text: string;
    createdAt: number;
  }[];
};

type Friend = {
  friendship_id: string;
  user_id: string;
  friend_id: string;
  status: string;
  friendInfo?: {
    user_id: string;
    social_username: string;
    avatar_url?: string;
  };
  created_at: string;
};

// ==== UI ANIMATIONS ==================================================

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

// ==== HELPERS =========================================================

function avatarGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  const h = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h} 70% 60%), hsl(${(h + 40) % 360} 70% 52%))`;
}

function formatTime(ts: number | string) {
  const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
  return d.toLocaleString();
}

// =====================================================================
//                            COMMUNITY PAGE
// =====================================================================

export default function CommunityPage() {
  // const prefersReducedMotion = a();
  const supabase = createClientComponentClient();

  // === STATE ==========================================================

  const [view, setView] = useState<"posts" | "friends" | "templates">("posts");

  // POSTS
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "liked" | "mine">("all");
  const [tagFilter, setTagFilter] = useState("");
  const [visibilityView, setVisibilityView] = useState<"all" | "public" | "friends">("all");

  // FRIENDS
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [friendSearch] = useState("");
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 2500);
  };

  // === LOAD INITIAL DATA ==============================================

  const desert = deserts.find(d => d.name === "Atacama Desert")!;

  useEffect(() => {
    loadPosts();
    loadFriends();
    loadPendingRequests();
  }, []);

  // ===================================================================
  //                             DELETE POST
  // ===================================================================

  async function deletePost(id: string) {
    try {
      // ensure we have the current user and ownership
      const postToDelete = posts.find((p) => p.id === id);
      if (!postToDelete) {
        showMessage("error", "Post not found");
        return;
      }
      if (!currentUserId || postToDelete.user_id !== currentUserId) {
        showMessage("error", "You don't have permission to delete this post");
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // optional: require logged in user
      if (!user) {
        showMessage("error", "You must be logged in to delete posts");
        return;
      }

      const { error } = await supabase.from("Post").delete().eq("id", id);

      if (error) {
        console.error("deletePost error:", error);
        showMessage("error", "Failed to delete post");
        return;
      }

      setPosts((prev) => prev.filter((p) => p.id !== id));
      showMessage("success", "Post deleted");
    } catch (e) {
      console.error("deletePost crashed:", e);
      showMessage("error", "Error deleting post");
    }
  }

  // ===================================================================
  //                             LOAD POSTS
  // ===================================================================

  async function loadPosts() {
    try {
      const { data: postsRows, error: postErr } = await supabase
        .from("Post")
        .select(`
          *,
          Users:user_id (social_username)
        `)
        .order("created_at", { ascending: false });

      if (postErr) {
        console.error("loadPosts error:", postErr);
        return;
      }

      // Map posts
      const mapped: Post[] = postsRows.map((r: unknown) => {
        const row = r as Record<string, unknown>;

        const createdAt =
          typeof row.created_at === "string"
            ? new Date(row.created_at).getTime()
            : (row.created_at as number | undefined) ?? Date.now();

        const liked_by = Array.isArray(row.liked_by)
          ? (row.liked_by as string[])
          : [];

        return {
          id: String(row.id),
          user_id: row.user_id ? String(row.user_id as string) : undefined,
          user: (row.Users as { social_username?: string } | undefined)?.social_username ?? "Unknown",
          text: (row.text as string) ?? "",
          tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
          createdAt,
          likes: (row.likes as number) ?? liked_by.length,
          liked_by,
          comments: [],
        };
      });



      // Load comments
      const postIds = mapped.map((p) => p.id);
      if (postIds.length) {
        const { data: cRows, error: cErr } = await supabase
          .from("Comment")
          .select(`
            *,
            Users:user_id (social_username)
          `)
          .in("post_id", postIds);

        if (cErr) {
          console.error("loadComments error:", cErr);
        } else {
          type CommentRow = Record<string, unknown>;
          const byPost: Record<string, CommentRow[]> = {};

          (cRows as CommentRow[]).forEach((c) => {
            const pid = String(c.post_id);
            if (!byPost[pid]) byPost[pid] = [];
            byPost[pid].push(c);
          });

          mapped.forEach((p) => {
            const arr = byPost[p.id] || [];
            p.comments = arr.map((c) => ({
              id: String(c.id),
              user: ((c as Record<string, unknown>).Users as { social_username?: string } | undefined)?.social_username ?? "Unknown",
              text: (c.text as string) ?? "",
              createdAt:
                typeof c.created_at === "string"
                  ? new Date(c.created_at as string).getTime()
                  : (c.created_at as number) ?? Date.now(),
            }));
          });
        }
      }

      // Fetch logged-in user id
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
      }

      setPosts(mapped);
    } catch (e) {
      console.error("loadPosts crashed:", e);
    }
  }

  // ===================================================================
  //                             CREATE POST
  // ===================================================================

  async function createPost() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (!text.trim()) return;

    const tlist = tags.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      const payload = {
        user_id: user.id,
        text: text.trim(),
        tags: tlist,
        likes: 0,
        liked_by: [],
      };

      const { data: inserted, error } = await supabase
        .from("Post")
        .insert([payload])
        .select(`
          *,
          Users:user_id (social_username)
        `)
        .single();

      if (error) {
        console.error("createPost error:", error);
        return;
      }

      const newPost: Post = {
        id: String(inserted.id),
        user_id: inserted.user_id ? String(inserted.user_id) : user.id,
        user: inserted.Users.social_username,
        text: inserted.text,
        tags: inserted.tags ?? [],
        createdAt: new Date(inserted.created_at).getTime(),
        likes: 0,
        liked_by: [],
        comments: [],
      };

      setPosts((prev) => [newPost, ...prev]);
      setText("");
      setTags("");
    } catch (e) {
      console.error("createPost crashed:", e);
    }
  }

  // ===================================================================
  //                             LIKE TOGGLE
  // ===================================================================

  async function toggleLike(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      const { data: row } = await supabase
        .from("Post")
        .select("liked_by")
        .eq("id", id)
        .single();

      const liked_by = Array.isArray(row?.liked_by) ? row.liked_by : [];
      const has = liked_by.includes(user.id);

      const nextLikedBy = has
        ? liked_by.filter((u) => u !== user.id)
        : [...liked_by, user.id];

      const { error: updateErr } = await supabase
        .from("Post")
        .update({
          liked_by: nextLikedBy,
          likes: nextLikedBy.length,
        })
        .eq("id", id);

      if (updateErr) {
        console.error("toggleLike update error:", updateErr);
        return;
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
              ...p,
              liked_by: nextLikedBy,
              likes: nextLikedBy.length,
            }
            : p
        )
      );
    } catch (e) {
      console.error("toggleLike crashed:", e);
    }
  }

  // ===================================================================
  //                             COMMENT
  // ===================================================================

  async function addComment(postId: string, commentText: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    if (!commentText.trim()) return;

    try {
      const payload = {
        post_id: postId,
        user_id: user.id,
        text: commentText.trim(),
      };

      const { data: row, error } = await supabase
        .from("Comment")
        .insert([payload])
        .select(`
          *,
          Users:user_id (social_username)
        `)
        .single();

      if (error) {
        console.error("addComment error:", error);
        return;
      }

      const newComment = {
        id: String(row.id),
        user: row.Users.social_username,
        text: row.text,
        createdAt: new Date(row.created_at).getTime(),
      };

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
        )
      );
    } catch (e) {
      console.error("addComment crashed:", e);
    }
  }

  // ===================================================================
  //                        FRIEND SYSTEM
  // ===================================================================

  async function loadFriends() {
    try {
      const res = await fetch("/api/friends/list?type=accepted");
      const data = await res.json();
      if (data.friends) setFriends(data.friends);
    } catch (e) {
      console.error("loadFriends error:", e);
    }
  }

  async function loadPendingRequests() {
    try {
      const res = await fetch("/api/friends/list?type=pending");
      const data = await res.json();
      if (data.friends) setPendingRequests(data.friends);
    } catch (e) {
      console.error("loadPendingRequests error:", e);
    }
  }

  async function sendFriendRequest() {
    if (!newFriendUsername.trim()) {
      showMessage("error", "Enter a username");
      return;
    }

    try {
      const res = await fetch("/api/friends/send-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friend_username: newFriendUsername.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.error || "Failed to send request");
        return;
      }

      showMessage("success", "Friend request sent!");
      setNewFriendUsername("");
      loadFriends();
    } catch {
      showMessage("error", "Error sending request");
    }
  }

  async function respondToRequest(friendshipId: string, action: "accept" | "reject") {
    try {
      const res = await fetch("/api/friends/respond", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendship_id: friendshipId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.error || "Failed to respond");
        return;
      }

      showMessage("success", `Request ${action}ed`);
      loadPendingRequests();
      loadFriends();
    } catch {
      showMessage("error", "Action failed");
    }
  }

  // ===================================================================
  //                FILTER POSTS & FILTER FRIENDS
  // ===================================================================

  const allTags = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return [...s].sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let arr = [...posts].sort((a, b) => b.createdAt - a.createdAt);

    if (filter === "liked") arr = arr.filter((p) => p.liked_by.includes(currentUserId ?? ""));
    if (filter === "mine") {
      arr = arr.filter((p) => p.user_id === currentUserId);
    }

    if (tagFilter) arr = arr.filter((p) => p.tags.includes(tagFilter));

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      arr = arr.filter(
        (p) =>
          p.text.toLowerCase().includes(q) ||
          p.user.toLowerCase().includes(q)
      );
    }

    // visibility filters: "friends" = posts from friends (and you), "public" = posts from non-friends
    const friendIds = friends.map((f) => f.friendInfo?.user_id).filter(Boolean) as string[];
    if (visibilityView === "friends") {
      arr = arr.filter((p) => (p.user_id && friendIds.includes(p.user_id)) || p.user_id === currentUserId);
    } else if (visibilityView === "public") {
      arr = arr.filter((p) => !(p.user_id && friendIds.includes(p.user_id)) && p.user_id !== currentUserId);
    }

    return arr;
  }, [posts, filter, tagFilter, query, visibilityView, friends, currentUserId]);

  const filteredFriends = useMemo(() => {
    let arr = [...friends].sort((a, b) =>
      (a.friendInfo?.social_username || "").localeCompare(
        b.friendInfo?.social_username || ""
      )
    );

    if (friendSearch.trim()) {
      const q = friendSearch.trim().toLowerCase();
      arr = arr.filter(
        (f) =>
          f.friendInfo?.social_username.toLowerCase().includes(q)
      );
    }

    return arr;
  }, [friends, friendSearch]);

  // ===================================================================
  //                           RENDER
  // ===================================================================

  return (
    <div className="relative min-h-screen w-full overflow-hidden ">

      {/* Toast */}
      {message && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 z-50 rounded-lg shadow-lg text-white 
          ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          {message.text}
        </div>
      )}

      {/* Background */}
      <PageBackground
        src={desert.src}
        alt={desert.name}
        wikiUrl={desert.wikiUrl}
      >

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex justify-between flex-col sm:flex-row gap-4 sm:items-end"
          >
            <div>
              <h1 className="text-4xl text-white font-semibold">Community</h1>
              <p className="text-white/85 mt-1">
                Share progress, connect with friends, and learn together
              </p>
            </div>

            <LinkAsButton
              href="/home"
              className="!cursor-pointer px-6 py-3 rounded-lg bg-white/20 text-white ring-1 ring-white/30 hover:bg-white/30 transition"
            >
              Back to Home
            </LinkAsButton>
          </motion.div>

          {/* Tabs */}
          <motion.div
            className="mt-6 flex gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setView("posts")}
              className={`cursor-pointer px-4 py-2 rounded-lg transition ${view === "posts"
                ? "bg-white text-gray-900"
                : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              Posts
            </button>

            <button
              onClick={() => setView("friends")}
              className={`cursor-pointer px-4 py-2 rounded-lg transition relative ${view === "friends"
                ? "bg-white text-gray-900"
                : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              Friends
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setView("templates")}
              className={`cursor-pointer px-4 py-2 rounded-lg transition ${view === "templates"
                ? "bg-white text-gray-900"
                : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              Activity
            </button>
          </motion.div>

          {/* POSTS TAB  */}
          {view === "posts" && (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5"
            >
              {/* Right column – Filters (TOP on mobile) */}
              <motion.div
                variants={item}
                className="space-y-5 order-1 lg:order-2"
              >
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-5 lg:sticky lg:top-24">
                  <Filters
                    filter={filter}
                    setFilter={setFilter}
                    tagFilter={tagFilter}
                    setTagFilter={setTagFilter}
                    allTags={allTags}
                    query={query}
                    setQuery={setQuery}
                    visibilityView={visibilityView}
                    setVisibilityView={setVisibilityView}
                  />
                </div>
              </motion.div>

              {/* Left column – Composer + Posts (BELOW on mobile) */}
              <motion.div
                variants={item}
                className="lg:col-span-2 order-2 lg:order-1"
              >
                {/* Composer */}
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-10 w-10 rounded-full ring-2 ring-white/60 shrink-0"
                      style={{ background: avatarGradient("me") }}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          className="w-full bg-white/80 text-gray-900 px-3 py-2 rounded-lg ring-1 ring-white/30"
                          placeholder="Share what you learned today…"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                        />
                        <button
                          onClick={createPost}
                          className="cursor-pointer inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-2 rounded-lg ring-1 ring-white/20 transition"
                        >
                          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                          Post
                        </button>
                      </div>

                      <input
                        className="mt-2 w-full bg-white/75 text-gray-900 px-3 py-1.5 rounded-lg ring-1 ring-white/30"
                        placeholder="Tags (comma-separated)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Posts feed */}
                <motion.div
                  className="mt-4 space-y-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filteredPosts.length ? (
                    filteredPosts.map((p) => (
                      <PostCard
                        key={p.id}
                        post={p}
                        currentUserId={currentUserId}
                        onToggleLike={() => toggleLike(p.id)}
                        onDelete={() => deletePost(p.id)}
                        canDelete={currentUserId !== null && currentUserId === p.user_id}
                        onComment={(txt) => addComment(p.id, txt)}
                      />
                    ))
                  ) : (
                    <motion.div
                      variants={item}
                      className="text-center p-6 bg-white/10 text-white rounded-xl"
                    >
                      No posts yet. Share something!
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          )}


          {/* FRIENDS TAB */}
          {view === "friends" && (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="mt-6 max-w-3xl mx-auto space-y-5"
            >
              {/* Add Friend */}
              <motion.div variants={item} className="rounded-2xl border border-white/20 bg-white/10 p-5">
                <h3 className="text-white font-semibold mb-3">Add Friend</h3>
                <div className="flex gap-2">
                  <input
                    placeholder="Enter username"
                    value={newFriendUsername}
                    onChange={(e) => setNewFriendUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendFriendRequest()}
                    className="flex-1 bg-white/80 text-gray-900 rounded-lg px-3 py-2 ring-1 ring-white/30"
                  />
                  <button
                    onClick={sendFriendRequest}
                    className="cursor-pointer bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-400 transition"
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                    Send
                  </button>
                </div>
              </motion.div>

              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <motion.div variants={item} className="rounded-2xl border border-white/20 bg-white/10 p-5">
                  <h3 className="text-white font-semibold mb-3">Pending Requests</h3>
                  {pendingRequests.map((req) => (
                    <div
                      key={req.friendship_id}
                      className="flex justify-between items-center p-3 bg-white/10 rounded-lg"
                    >
                      <span className="text-white">{req.friendInfo?.social_username}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToRequest(req.friendship_id, "accept")}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respondToRequest(req.friendship_id, "reject")}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Friends */}
              <motion.div variants={item} className="rounded-2xl border border-white/20 bg-white/10 p-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-semibold mb-3">Friends ({friends.length})</h3>
                  <div className="relative">
                    {/* <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70"
                  /> */}
                    {/* <input
                    placeholder="Search friends…"
                    value={friendSearch}
                    onChange={(e) => setFriendSearch(e.target.value)}
                    className="bg-white/10 text-white pl-7 pr-2 py-1.5 rounded-lg ring-1 ring-white/30 focus:outline-none"
                  /> */}
                  </div>
                </div>

                {filteredFriends.length ? (
                  filteredFriends.map((f) => (
                    <div
                      key={f.friendship_id}
                      className="flex items-center gap-3 p-3 bg-white/10 rounded-lg"
                    >
                      <div
                        className="h-10 w-10 rounded-full ring-2 ring-white/60"
                        style={{
                          background: avatarGradient(f.friendInfo?.social_username || ""),
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {f.friendInfo?.social_username}
                        </p>
                        <p className="text-xs text-white/60">
                          Friends since {new Date(f.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-white/60 py-8">No friends yet.</div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* TEMPLATE ACTIVITIES TAB */}
          {view === "templates" && (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="mt-6 max-w-3xl mx-auto space-y-5"
            >
              <motion.div variants={item} className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center">
                <h3 className="text-white text-2xl font-semibold mb-2">Template Activities</h3>
                <p className="text-white/70">Coming soon... Maybe.</p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </PageBackground>
    </div>
  );
}

// =====================================================================
//                              FILTERS
// =====================================================================

function Filters({
  filter,
  setFilter,
  tagFilter,
  setTagFilter,
  allTags,
  query,
  setQuery,
  visibilityView,
  setVisibilityView,
}: {
  filter: "all" | "liked" | "mine";
  setFilter: (v: "all" | "liked" | "mine") => void;
  tagFilter: string;
  setTagFilter: (v: string) => void;
  allTags: string[];
  query: string;
  setQuery: (v: string) => void;
  visibilityView: "all" | "public" | "friends";
  setVisibilityView: (v: "all" | "public" | "friends") => void;
}) {
  return (
    <div className="text-white">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full ring-1 ring-white/20">
          <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
          <span className="text-sm">Filters</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-white/70 text-sm">Visibility:</label>
          <select
            value={visibilityView}
            onChange={(e) => setVisibilityView(e.target.value as "all" | "public" | "friends")}
            className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm ring-1 ring-white/30"
          >
            <option value="all">Everyone</option>
            <option value="friends">Friends only</option>
            <option value="public">Public only</option>
          </select>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {(["all", "liked", "mine"] as const).map((f) => (
          <button
            key={f}
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
          className="col-span-2 bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm ring-1 ring-white/30 focus:outline-none"
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
            placeholder="Search…"
            className="w-full bg-white/10 pl-7 pr-2 py-1.5 rounded-lg text-sm text-white ring-1 ring-white/30 focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// =====================================================================
//                              POST CARD
// =====================================================================

function PostCard({
  post,
  currentUserId,
  onToggleLike,
  onDelete,
  canDelete,
  onComment,
}: {
  post: Post;
  currentUserId?: string | null;
  onToggleLike: () => void;
  onDelete: () => void;
  canDelete?: boolean;
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
          className="h-10 w-10 rounded-full ring-2 ring-white/60"
          style={{ background: avatarGradient(post.user) }}
        />

        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-white font-semibold">{post.user}</div>
              <div className="text-white/70 text-xs">{formatTime(post.createdAt)}</div>
            </div>

            {/* Delete button shown only when owner */}
            {canDelete && (
              <button
                onClick={onDelete}
                className="cursor-pointer bg-white/10 hover:bg-white/20 px-2 py-1 text-xs rounded ring-1 ring-white/30 text-white"
                title="Delete"
              >
                <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="mt-2 text-white">{post.text}</div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="bg-white/15 ring-1 ring-white/20 px-2 py-0.5 rounded-full text-[11px] text-white"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex gap-3 items-center">
            <button
              onClick={onToggleLike}
              className={[
                "cursor-pointer inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ring-1 transition",
                post.liked_by.includes(currentUserId ?? "")
                  ? "bg-rose-500 text-white ring-white/20"
                  : "bg-white/10 text-white hover:bg-white/20 ring-white/30",
              ].join(" ")}
            >
              <FontAwesomeIcon icon={faHeart} className="h-3 w-3" />
              <span>{post.likes}</span>
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-white/10 text-white hover:bg-white/20 px-2 py-1 text-xs ring-1 ring-white/30 transition"
            >
              <FontAwesomeIcon icon={faCommentDots} className="h-3 w-3" />
              <span>{post.comments.length}</span>
            </button>
          </div>

          {/* Comments */}
          {open && (
            <div className="mt-3 bg-white/90 p-3 rounded-xl ring-1 ring-white/30 shadow-sm">
              {/* Existing comments */}
              <div className="space-y-2">
                {post.comments.length ? (
                  post.comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <div
                        className="h-7 w-7 rounded-full ring-2 ring-white/60 shrink-0"
                        style={{ background: avatarGradient(c.user) }}
                      />
                      <div>
                        <div className="text-sm">
                          <span className="font-semibold">{c.user} </span>
                          <span className="text-gray-600">{c.text}</span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {formatTime(c.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-600">No comments yet.</div>
                )}

                {/* Write comment */}
                <div className="flex gap-2 items-center pt-1">
                  <input
                    className="flex-1 bg-white px-2 py-1 rounded-md border border-black/10 text-gray-800 text-sm focus:outline-none"
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
                    onClick={() => {
                      onComment(cmt);
                      setCmt("");
                    }}
                    className="cursor-pointer bg-indigo-500 hover:bg-indigo-400 text-white px-2 py-1 rounded-md text-xs ring-1 ring-white/20"
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
