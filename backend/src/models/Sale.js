import mongoose from 'mongoose'

const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantitySold: { type: Number, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'momo'], default: 'cash' },
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String },
}, {
  timestamps: true,
})

export default mongoose.model('Sale', saleSchema)
