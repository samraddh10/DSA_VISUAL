import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Trash2, ExternalLink, Calendar } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard.jsx'
import Button from '../components/ui/Button.jsx'
import useAuthStore from '../stores/authStore.js'

const categoryLabels = {
  sorting: 'Sorting',
  searching: 'Searching',
  'linked-list': 'Linked List',
  'stack-queue': 'Stack & Queue',
  trees: 'Trees',
  heaps: 'Heaps',
  graphs: 'Graphs',
  dp: 'Dynamic Programming',
}

function categoryPath(category) {
  return `/${category}`
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/visualizations', { credentials: 'include' })
        if (!res.ok) throw new Error(`Failed to load (${res.status})`)
        const data = await res.json()
        if (!cancelled) setItems(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleDelete(shareId) {
    const prev = items
    setItems((list) => list.filter((i) => i.shareId !== shareId))
    try {
      const res = await fetch(`/api/visualizations/${shareId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Delete failed (${res.status})`)
    } catch (err) {
      setItems(prev)
      setError(err.message)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <GlassCard className="p-6 mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center glow-purple">
              <User className="w-7 h-7 text-neon-purple" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{user.username}</h1>
              <p className="text-sm text-text-muted">{user.email}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={logout}>
            Log out
          </Button>
        </div>
      </GlassCard>

      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Saved visualizations</h2>
        <span className="text-xs text-text-muted">{items.length} saved</span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <GlassCard className="p-6 text-center text-neon-rose">{error}</GlassCard>
      )}

      {!loading && !error && items.length === 0 && (
        <GlassCard className="p-8 text-center">
          <p className="text-text-secondary">No saved visualizations yet.</p>
          <p className="text-sm text-text-muted mt-1">
            Open a visualizer and save one to see it here.
          </p>
        </GlassCard>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.shareId}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard className="p-5 flex flex-col gap-3 h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{item.title}</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {categoryLabels[item.category] || item.category} · {item.algorithmId}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 border border-border-glass text-text-muted shrink-0">
                    {item.shareId}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2 mt-auto pt-2">
                  <Link
                    to={categoryPath(item.category)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-border-glass text-sm text-text-primary transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open
                  </Link>
                  <button
                    onClick={() => handleDelete(item.shareId)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-neon-rose/10 hover:bg-neon-rose/20 border border-neon-rose/30 text-neon-rose transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
