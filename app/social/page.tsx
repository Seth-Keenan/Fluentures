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
} from "@fortawesome/free-solid-svg-icons";
import { LinkAsButton } from "@/app/components/LinkAsButton";

type Post = {
  id: string;
  user: string;
  text: string;
  tags: string[];
  createdAt: number; // ms
  likes: number;
  liked?: boolean;
  comments: { id: string; user: string; text: string; createdAt: number }[];
};

type Friend = {
  id: string;
  name: string;
  status: "Online" | "Away" | "Offline";
  note?: string;
};

const POSTS_KEY = "fluentures.community.posts.v1";
const FRIENDS_KEY = "fluentures.community.friends.v1";

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
function saveFriends(friends: Friend[]) {
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}
function loadFriends(): Friend[] {
  try {
    const raw = localStorage.getItem(FRIENDS_KEY);
    return raw ? (JSON.parse(raw) as Friend[]) : [];
  } catch {
    return [];
  }
}
function formatTime(ts: number) {
  const d = new Date(ts);
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

  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "liked" | "mine">("all");
  const [tagFilter, setTagFilter] = useState<string>("");

  const [text, setText] = useState("");
  const [tags, setTags] = useState("");

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<Friend["status"]>("Online");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    setPosts(loadPosts());
    setFriends(loadFriends());
  }, []);

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
    let arr = friends.slice().sort((a, b) => a.name.localeCompare(b.name));
    if (friendSearch.trim()) {
      const q = friendSearch.trim().toLowerCase();
      arr = arr.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.note || "").toLowerCase().includes(q) ||
          f.status.toLowerCase().includes(q)
      );
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

  function addFriend() {
    if (!newName.trim()) return;
    const f: Friend = {
      id: uid(),
      name: newName.trim(),
      status: newStatus,
      note: newNote.trim() || undefined,
    };
    const next = [...friends, f];
    setFriends(next);
    saveFriends(next);
    setNewName("");
    setNewStatus("Online");
    setNewNote("");
    setAdding(false);
  }
  function updateFriend(updated: Friend) {
    const next = friends.map((f) => (f.id === updated.id ? updated : f));
    setFriends(next);
    saveFriends(next);
  }
  function deleteFriend(id: string) {
    const next = friends.filter((f) => f.id !== id);
    setFriends(next);
    saveFriends(next);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
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
              Share progress, cheer friends, and keep your learning circle close
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

        {/* Main grid */}
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
                {/* avatar */}
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

            {/* Filters (mobile) */}
            <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-4 lg:hidden">
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

          {/* Right: Filters + Friends Manager */}
          <motion.div variants={item} className="space-y-5">
            {/* Filters */}
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

            {/* Friends Manager */}
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20 text-white/95">
                  👥 <span className="text-sm font-medium">Friends</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAdding((v) => !v)}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 ring-1 ring-white/20 transition px-3 py-1.5 text-sm"
                >
                  <FontAwesomeIcon icon={adding ? faXmark : faPlus} className="h-4 w-4" />
                  {adding ? "Cancel" : "Add"}
                </button>
              </div>

              {/* Add Friend Form */}
              {adding && (
                <div className="mt-3 rounded-xl bg-white/90 p-3 ring-1 ring-white/30 shadow-sm">
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none"
                      placeholder="Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                    <select
                      className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm text-gray-800 focus:outline-none"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as Friend["status"])}
                    >
                      <option>Online</option>
                      <option>Away</option>
                      <option>Offline</option>
                    </select>
                    <input
                      className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none"
                      placeholder="Note (optional)"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setAdding(false);
                          setNewName("");
                          setNewStatus("Online");
                          setNewNote("");
                        }}
                        className="cursor-pointer rounded-md bg-white/60 hover:bg-white px-3 py-1 text-sm ring-1 ring-black/10 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addFriend}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1 text-sm ring-1 ring-white/20 transition"
                      >
                        <FontAwesomeIcon icon={faFloppyDisk} className="h-4 w-4" />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="mt-3 relative">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70"
                />
                <input
                  className="w-full rounded-lg bg-white/10 pl-7 pr-2 py-1.5 text-sm text-white ring-1 ring-white/30 placeholder:text-white/60 focus:outline-none"
                  placeholder="Search friends…"
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                />
              </div>

              {/* Friends List */}
              <div className="mt-3 space-y-2">
                {filteredFriends.length ? (
                  filteredFriends.map((f) => (
                    <FriendRow
                      key={f.id}
                      friend={f}
                      onSave={updateFriend}
                      onDelete={() => deleteFriend(f.id)}
                    />
                  ))
                ) : (
                  <div className="rounded-xl bg-white/10 text-white p-4 text-center ring-1 ring-white/20">
                    No friends yet. Add one!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

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

function FriendRow({
  friend,
  onSave,
  onDelete,
}: {
  friend: Friend;
  onSave: (f: Friend) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(friend.name);
  const [status, setStatus] = useState<Friend["status"]>(friend.status);
  const [note, setNote] = useState(friend.note || "");

  const statusDot =
    status === "Online" ? "bg-emerald-500" : status === "Away" ? "bg-amber-400" : "bg-gray-400";

  return (
    <div className="flex items-start justify-between rounded-xl bg-white/90 p-3 text-gray-900 ring-1 ring-white/30 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="relative">
          <div
            className="h-9 w-9 rounded-full ring-2 ring-white/80"
            style={{ background: avatarGradient(friend.name) }}
          />
          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${statusDot}`} />
        </div>

        {!editing ? (
          <div>
            <div className="font-semibold">{friend.name}</div>
            <div className="text-[11px] text-gray-600">{friend.status}</div>
            {friend.note ? <div className="text-sm text-gray-700 mt-1">{friend.note}</div> : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            <input
              className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select
              className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm text-gray-800 focus:outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value as Friend["status"])}
            >
              <option>Online</option>
              <option>Away</option>
              <option>Offline</option>
            </select>
            <input
              className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!editing ? (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-white/60 hover:bg-white px-2 py-1 text-xs ring-1 ring-black/10 transition"
              title="Edit"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-rose-500 hover:bg-rose-400 text-white px-2 py-1 text-xs ring-1 ring-white/20 transition"
              title="Delete"
            >
              <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                onSave({ id: friend.id, name: name.trim() || friend.name, status, note: note.trim() || undefined });
                setEditing(false);
              }}
              className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white px-2 py-1 text-xs ring-1 ring-white/20 transition"
              title="Save"
            >
              <FontAwesomeIcon icon={faFloppyDisk} className="h-3 w-3" />
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setName(friend.name);
                setStatus(friend.status);
                setNote(friend.note || "");
              }}
              className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-white/60 hover:bg-white px-2 py-1 text-xs ring-1 ring-black/10 transition"
              title="Cancel"
            >
              <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
