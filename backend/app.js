import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Conectar ao banco de dados
connectDB();

// Rotas
app.use('/api', apiRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'API do Site de Extração de Dados funcionando!',
    version: '1.0.0',
    endpoints: {
      youtube: '/api/youtube',
      fontes: '/api/fontes',
      premissas: '/api/premissas',
      nichos: '/api/nichos'
      // Removidas as referências ao Reddit e TikTok
    }
  });
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
