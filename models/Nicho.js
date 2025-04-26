import mongoose from 'mongoose';

const NichoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true
  },
  subnichos: {
    type: [String],
    default: []
  }
});

const Nicho = mongoose.model('Nicho', NichoSchema);

export default Nicho;
