import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { Server } from 'socket.io'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import salesRoutes from './routes/sales.js'
import productRoutes from './routes/products.js'
import { authMiddleware } from './middleware/auth.js'
import User from './models/User.js'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})

app.use(cors({ origin: true }))
app.use(express.json())
app.use((req, res, next) => {
  req.io = io
  next()
})

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/users', authMiddleware, userRoutes)
app.use('/api/sales', authMiddleware, salesRoutes)
app.use('/api/products', productRoutes)

io.on('connection', socket => {
  console.log('Socket connected:', socket.id)
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
  })
})

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  if (res.headersSent) return next(err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 4000

const seedAdmin = async () => {
  const userCount = await User.countDocuments()
  if (userCount === 0) {
    const hashed = await bcrypt.hash('admin123', 10)
    await User.create({ name: 'Administrator', username: 'admin', password: hashed, role: 'admin' })
    console.log('Created default admin account: admin / admin123')
  }
}

connectDB().then(seedAdmin).catch(error => {
  console.error('Failed to connect or seed database:', error.message)
  process.exit(1)
})

server.listen(PORT, () => {
  console.log(`Shop Tracker backend running on http://localhost:${PORT}`)
})

// Handle server listen errors (eg. EADDRINUSE) so nodemon restarts cleanly
server.on('error', err => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Ensure no other instance is running.`)
  } else {
    console.error('Server error:', err)
  }
  process.exit(1)
})
