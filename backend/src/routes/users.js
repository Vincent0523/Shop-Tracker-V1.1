import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import { adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/', adminOnly, async (req, res) => {
  const users = await User.find().select('-password')
  res.json(users)
})

router.post('/', adminOnly, async (req, res) => {
  const { name, username, password, role } = req.body
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Name, username, and password are required.' })
  }

  const existing = await User.findOne({ username })
  if (existing) {
    return res.status(409).json({ error: 'Username already exists.' })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({ name, username, password: hashed, role: role || 'staff' })
  res.status(201).json({ id: user._id, name: user.name, username: user.username, role: user.role })
})

router.put('/:id', async (req, res) => {
  const targetId = req.params.id
  const requesterId = req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isAdmin && requesterId !== targetId) {
    return res.status(403).json({ error: 'Permission denied.' })
  }

  const { name, username, password, role, currentPassword } = req.body
  const updates = {}
  if (name !== undefined) updates.name = name
  if (username !== undefined) updates.username = username
  if (role !== undefined && isAdmin) updates.role = role

  if (password) {
    const targetUser = await User.findById(targetId).select('password')
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' })
    }

    if (!isAdmin) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required.' })
      }
      const valid = await bcrypt.compare(currentPassword, targetUser.password)
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect.' })
      }
    }
    updates.password = await bcrypt.hash(password, 10)
  }

  const user = await User.findByIdAndUpdate(targetId, updates, { new: true }).select('-password')
  if (!user) {
    return res.status(404).json({ error: 'User not found.' })
  }
  res.json({ id: user._id, name: user.name, username: user.username, role: user.role })
})

router.delete('/:id', adminOnly, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found.' })
  }
  res.status(204).end()
})

router.get('/me', async (req, res) => {
  res.json(req.user)
})

export default router
