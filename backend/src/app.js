const express = require('express')
const cors = require('cors')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Self Help Group Management System backend is running',
  })
})

/*
 * Routes
 *
 * Keep the existing route files from your project.
 * These are loaded only when the corresponding files exist.
 */

try {
  const authRoutes = require('./src/routes/authRoutes')
  app.use('/api/auth', authRoutes)
} catch (error) {
  console.log('Auth routes not loaded:', error.message)
}

try {
  const memberRoutes = require('./src/routes/memberRoutes')
  app.use('/api/members', memberRoutes)
} catch (error) {
  console.log('Member routes not loaded:', error.message)
}

try {
  const shgRoutes = require('./src/routes/shgRoutes')
  app.use('/api/shg', shgRoutes)
} catch (error) {
  console.log('SHG routes not loaded:', error.message)
}

app.use((err, req, res, next) => {
  console.error(err)

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  })
})

module.exports = app