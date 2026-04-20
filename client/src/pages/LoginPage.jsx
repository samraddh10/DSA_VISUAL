import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, AlertCircle } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard.jsx'
import Button from '../components/ui/Button.jsx'
import useAuthStore from '../stores/authStore.js'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/profile'

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ identifier: identifier.trim(), password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <GlassCard className="p-8" glow>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Welcome back</h1>
              <p className="text-xs text-text-muted">Sign in to save your visualizations</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field
              label="Username or email"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <Field
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-neon-rose/10 border border-neon-rose/30 text-sm text-neon-rose">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full mt-2">
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="text-sm text-text-muted text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-neon-purple hover:text-neon-purple-light transition-colors">
              Create one
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-secondary tracking-wide uppercase">
        {label}
      </span>
      <input
        {...props}
        className="px-3 py-2.5 rounded-lg bg-white/5 border border-border-glass text-text-primary placeholder-text-muted
          focus:outline-none focus:border-neon-purple/60 focus:bg-white/10 transition-colors duration-200"
      />
    </label>
  )
}
