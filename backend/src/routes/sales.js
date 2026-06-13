import express from 'express'
import Sale from '../models/Sale.js'
import Product from '../models/Product.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { createdBy: req.user._id }
  const sales = await Sale.find(query)
    .populate('createdBy', 'name username role')
    .sort({ createdAt: -1 })

  res.json(sales)
})

router.post('/', async (req, res) => {
  const { productId, productName, quantitySold, price, paymentMethod, notes, date } = req.body
  if (!productId || !productName || quantitySold == null || price == null) {
    return res.status(400).json({ error: 'Product, quantity, and price are required.' })
  }

  const product = await Product.findById(productId)
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' })
  }

  if (quantitySold > product.quantity) {
    return res.status(400).json({ error: 'Not enough stock available.' })
  }

  product.quantity = Math.max(0, product.quantity - quantitySold)
  await product.save()

  const amount = quantitySold * price
  const sale = await Sale.create({
    productId,
    productName,
    quantitySold,
    price,
    amount,
    paymentMethod: paymentMethod || 'cash',
    date: date ? new Date(date) : new Date(),
    notes,
    createdBy: req.user._id,
  })

  const populated = await sale.populate('createdBy', 'name username role')
  req.io.emit('sale-created', populated)
  res.status(201).json(populated)
})

export default router
