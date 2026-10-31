
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

// Routes
const authRoutes = require('./routes/authRoutes')
const memberRoutes = require('./routes/memberRoutes')
const shgRoutes = require('./routes/shgRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/shg', shgRoutes)

// Error handler
app.use((err, req, res, next) => {
  console.error(err)

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  })
})

module.exports = app
