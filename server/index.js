import 'dotenv/config'
import express from 'express'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import { fileURLToPath } from 'url'
import path from 'path'
import connectDB from './config/db.js'
import visualizationsRouter from './routes/visualizations.js'
import algorithmsRouter from './routes/algorithms.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(compression())
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors())
app.use(express.json())

// API routes
app.use('/api/visualizations', visualizationsRouter)
app.use('/api/algorithms', algorithmsRouter)

// Serve static client build in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(clientDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
