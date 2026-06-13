import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing.' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET not defined')
    const payload = jwt.verify(token, secret)
    const user = await User.findById(payload.id).select('-password')
    if (!user) return res.status(401).json({ error: 'User not found.' })
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' })
  }
  next()
}
