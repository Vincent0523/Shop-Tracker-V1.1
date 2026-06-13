import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI
    if (!uri) throw new Error('MONGO_URI is not defined in .env')
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  }
}
