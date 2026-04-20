import { Router } from 'express'
import crypto from 'crypto'
import Visualization from '../models/Visualization.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'

const router = Router()

// GET all visualizations for the current user (requires auth)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { category } = req.query
    const filter = { userId: req.user._id }
    if (category) filter.category = category
    const visualizations = await Visualization.find(filter)
      .sort({ createdAt: -1 })
      .lean()
    res.json(visualizations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single by shareId (public — anyone with the link can view)
router.get('/:shareId', optionalAuth, async (req, res) => {
  try {
    const viz = await Visualization.findOne({ shareId: req.params.shareId }).lean()
    if (!viz) return res.status(404).json({ error: 'Not found' })
    res.json(viz)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create (requires auth — owned by current user)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, algorithmId, category, inputData } = req.body
    const shareId = crypto.randomBytes(6).toString('hex')
    const viz = await Visualization.create({
      title,
      algorithmId,
      category,
      inputData,
      shareId,
      userId: req.user._id,
    })
    res.status(201).json(viz)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE (requires auth — only the owner can delete)
router.delete('/:shareId', requireAuth, async (req, res) => {
  try {
    const viz = await Visualization.findOneAndDelete({
      shareId: req.params.shareId,
      userId: req.user._id,
    })
    if (!viz) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
