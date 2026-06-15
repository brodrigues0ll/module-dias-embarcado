import mongoose from 'mongoose'

const PessoaEmbarcadaSchema = new mongoose.Schema({
  nome:           { type: String, required: true, trim: true },
  diasEmbarcado:  { type: Number, required: true, min: 1 },
  ultimoEmbarque: { type: Date,   required: true },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

PessoaEmbarcadaSchema.index({ createdBy: 1 })
PessoaEmbarcadaSchema.index({ ultimoEmbarque: 1 })

export default mongoose.models['dias-embarcado_items']
  || mongoose.model('dias-embarcado_items', PessoaEmbarcadaSchema)
