import express from 'express'
import Product from '../models/Product.js'
import { authMiddleware, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  const products = await Product.find().sort('name')
  res.json(products)
})

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { name, category, price, quantity } = req.body
  if (!name || price == null || quantity == null) {
    return res.status(400).json({ error: 'Name, price, and quantity are required.' })
  }

  const product = await Product.create({
    name,
    category: category || '',
    price,
    quantity,
  })

  res.status(201).json(product)
})

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const updates = {}
  const { name, category, price, quantity } = req.body
  if (name !== undefined) updates.name = name
  if (category !== undefined) updates.category = category
  if (price !== undefined) updates.price = price
  if (quantity !== undefined) updates.quantity = quantity

  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true })
  if (!product) return res.status(404).json({ error: 'Product not found.' })
  res.json(product)
})

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) return res.status(404).json({ error: 'Product not found.' })
  res.status(204).end()
})

export default router
