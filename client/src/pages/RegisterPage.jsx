import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, AlertCircle } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard.jsx'
import Button from '../components/ui/Button.jsx'
import useAuthStore from '../stores/authStore.js'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
      setError('Username must be 3–24 chars, letters/numbers/underscore only')
      return
    }

    setSubmitting(true)
    try {
      await register({ username: username.trim(), email: email.trim(), password })
      navigate('/profile', { replace: true })
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
              <UserPlus className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Create account</h1>
              <p className="text-xs text-text-muted">Save and share your visualizations</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field
              label="Username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={24}
              required
            />
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Field
              label="Password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <Field
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
            />

            {error && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-neon-rose/10 border border-neon-rose/30 text-sm text-neon-rose">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full mt-2">
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="text-sm text-text-muted text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-neon-purple hover:text-neon-purple-light transition-colors">
              Sign in
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
