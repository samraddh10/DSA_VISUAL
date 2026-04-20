import { Router } from 'express'
import User from '../models/User.js'
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body || {}
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    }).lean()
    if (existing) {
      const conflict = existing.email === email.toLowerCase() ? 'email' : 'username'
      return res.status(409).json({ error: `That ${conflict} is already in use` })
    }

    const passwordHash = await User.hashPassword(password)
    const user = await User.create({ username, email, passwordHash })
    const token = signToken(user._id)
    setAuthCookie(res, token)
    res.status(201).json({ user: user.toPublicJSON() })
  } catch (err) {
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body || {}
    if (!identifier || !password) {
      return res.status(400).json({ error: 'identifier and password are required' })
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = signToken(user._id)
    setAuthCookie(res, token)
    res.json({ user: user.toPublicJSON() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/logout', (req, res) => {
  clearAuthCookie(res)
  res.json({ message: 'Logged out' })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toPublicJSON() })
})

export default router
