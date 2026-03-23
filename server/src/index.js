import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRoutes from './routes/authRoutes.js'
import urlRoutes from './routes/urlRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://url-short-webapp.vercel.app'],
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
