import { Router } from 'express'
import crypto from 'crypto'
import Visualization from '../models/Visualization.js'

const router = Router()

// GET all visualizations
router.get('/', async (req, res) => {
  try {
    const { category } = req.query
    const filter = category ? { category } : {}
    const visualizations = await Visualization.find(filter)
      .sort({ createdAt: -1 })
      .lean()
    res.json(visualizations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single by shareId
router.get('/:shareId', async (req, res) => {
  try {
    const viz = await Visualization.findOne({ shareId: req.params.shareId }).lean()
    if (!viz) return res.status(404).json({ error: 'Not found' })
    res.json(viz)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create
router.post('/', async (req, res) => {
  try {
    const { title, algorithmId, category, inputData } = req.body
    const shareId = crypto.randomBytes(6).toString('hex')
    const viz = await Visualization.create({
      title,
      algorithmId,
      category,
      inputData,
      shareId,
    })
    res.status(201).json(viz)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE
router.delete('/:shareId', async (req, res) => {
  try {
    const viz = await Visualization.findOneAndDelete({ shareId: req.params.shareId })
    if (!viz) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
