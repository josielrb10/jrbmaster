import mongoose from 'mongoose';

const FonteSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['youtube', 'reddit', 'tiktok']
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  nome: {
    type: String,
    required: true
  },
  dataCadastro: {
    type: Date,
    default: Date.now
  },
  ultimaExtracao: {
    type: Date,
    default: null
  }
});

const Fonte = mongoose.model('Fonte', FonteSchema);

export default Fonte;
