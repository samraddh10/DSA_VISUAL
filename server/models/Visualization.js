import mongoose from 'mongoose'

const visualizationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    algorithmId: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    inputData: { type: mongoose.Schema.Types.Mixed, required: true },
    shareId: { type: String, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Visualization', visualizationSchema)
