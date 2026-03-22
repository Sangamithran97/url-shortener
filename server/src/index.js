import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import urlRoutes from './routes/urlRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/urls', urlRoutes)
app.use('/api/analytics', analyticsRoutes)

// Redirect route (this handles the short URL clicks)
app.get('/:shortCode', async (req, res) => {
  const { redirectUrl } = await import('./controllers/urlController.js')
  redirectUrl(req, res)
})

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'URL Shortener API is running!' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})