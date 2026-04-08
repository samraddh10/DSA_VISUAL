import mongoose from 'mongoose'

const algorithmMetaSchema = new mongoose.Schema({
  algorithmId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true, index: true },
  description: { type: String },
  timeComplexity: { type: String },
  spaceComplexity: { type: String },
  bestCase: { type: String },
  worstCase: { type: String },
  stable: { type: Boolean },
  code: [{ type: String }],
})

export default mongoose.model('AlgorithmMeta', algorithmMetaSchema)
