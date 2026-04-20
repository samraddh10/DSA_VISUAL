import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Braces, User, LogOut } from 'lucide-react'
import useAuthStore from '../../stores/authStore.js'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Compare', path: '/compare' },
  { label: 'Quiz', path: '/quiz' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const logout = useAuthStore((s) => s.logout)

  const authReady = status !== 'idle' && status !== 'loading'

  async function handleLogout() {
    await logout()
    setIsOpen(false)
    navigate('/')
  }

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="glass rounded-2xl max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group shrink-0">
          <div className="w-9 h-9 rounded-lg bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center glow-purple transition-all duration-200 group-hover:bg-neon-purple/30">
            <Braces className="w-5 h-5 text-neon-purple" />
          </div>
          <span className="text-lg font-bold text-text-primary tracking-tight">
            DSA<span className="text-neon-purple">Visual</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer
                  ${isActive ? 'text-neon-purple' : 'text-text-secondary hover:text-text-primary'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-lg bg-neon-purple/10 border border-neon-purple/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {authReady && user && (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-text-primary bg-white/5 hover:bg-white/10 border border-border-glass transition-colors"
              >
                <User className="w-4 h-4 text-neon-purple" />
                <span className="max-w-[8rem] truncate">{user.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-neon-rose hover:bg-neon-rose/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
          {authReady && !user && (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-neon-purple hover:bg-neon-purple/80 text-white transition-colors glow-purple"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-2xl max-w-6xl mx-auto mt-2 p-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer
                      ${isActive ? 'text-neon-purple bg-neon-purple/10' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                  >
                    {link.label}
                  </Link>
                )
              })}

              <div className="h-px bg-border-glass my-2" />

              {authReady && user && (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-text-primary hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4 text-neon-purple" />
                    {user.username}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-neon-rose hover:bg-neon-rose/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </>
              )}
              {authReady && !user && (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium bg-neon-purple/20 text-neon-purple border border-neon-purple/40 transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
