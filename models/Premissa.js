import mongoose from 'mongoose';

const PremissaSchema = new mongoose.Schema({
  fonte: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fonte',
      required: true
    },
    tipo: {
      type: String,
      required: true,
      enum: ['youtube', 'reddit', 'tiktok']
    },
    url: {
      type: String,
      required: true
    },
    nome: {
      type: String,
      required: true
    }
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  premissa: {
    type: String,
    required: true
  },
  descricaoBreve: {
    type: String,
    required: true
  },
  premissaPrimeiraPessoa: {
    type: String,
    default: ''
  },
  metadados: {
    data: {
      type: Date,
      required: true
    },
    likes: {
      type: Number,
      default: 0
    },
    comentarios: {
      type: Number,
      default: 0
    },
    visualizacoes: {
      type: Number,
      default: 0
    }
  },
  nicho: {
    type: String,
    default: ''
  },
  subnicho: {
    type: String,
    default: ''
  },
  utilizada: {
    type: Boolean,
    default: false
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  dataAtualizacao: {
    type: Date,
    default: Date.now
  }
});

const Premissa = mongoose.model('Premissa', PremissaSchema);

export default Premissa;
