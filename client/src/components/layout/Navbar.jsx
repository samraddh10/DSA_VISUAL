import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Braces } from 'lucide-react'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Sorting', path: '/sorting' },
  { label: 'Searching', path: '/searching' },
  { label: 'Linked Lists', path: '/linked-list' },
  { label: 'Stacks & Queues', path: '/stack-queue' },
  { label: 'Trees', path: '/trees' },
  { label: 'Graphs', path: '/graphs' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="glass rounded-2xl max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-9 h-9 rounded-lg bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center glow-purple transition-all duration-200 group-hover:bg-neon-purple/30">
            <Braces className="w-5 h-5 text-neon-purple" />
          </div>
          <span className="text-lg font-bold text-text-primary tracking-tight">
            DSA<span className="text-neon-purple">Visual</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
