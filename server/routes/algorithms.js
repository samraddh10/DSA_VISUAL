import { Router } from 'express'
import AlgorithmMeta from '../models/AlgorithmMeta.js'

const router = Router()

// GET all algorithms (optionally filtered by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query
    const filter = category ? { category } : {}
    const algorithms = await AlgorithmMeta.find(filter).lean()
    res.json(algorithms)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single algorithm by algorithmId
router.get('/:algorithmId', async (req, res) => {
  try {
    const algo = await AlgorithmMeta.findOne({ algorithmId: req.params.algorithmId }).lean()
    if (!algo) return res.status(404).json({ error: 'Not found' })
    res.json(algo)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
