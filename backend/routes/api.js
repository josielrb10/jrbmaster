import express from 'express';
import fonteRoutes from './fontes.js';
import premissaRoutes from './premissas.js';
import nichoRoutes from './nichos.js';
import youtubeRoutes from './youtube.js';
// Removendo importações do Reddit e TikTok
// import redditRoutes from './reddit.js';
// import tiktokRoutes from './tiktok.js';

const router = express.Router();

// Rotas para fontes
router.use('/fontes', fonteRoutes);

// Rotas para premissas
router.use('/premissas', premissaRoutes);

// Rotas para nichos
router.use('/nichos', nichoRoutes);

// Rotas para YouTube
router.use('/youtube', youtubeRoutes);

// Desativando rotas para Reddit e TikTok
// router.use('/reddit', redditRoutes);
// router.use('/tiktok', tiktokRoutes);

// Adicionando rotas de fallback para Reddit e TikTok
router.use('/reddit', (req, res) => {
  res.status(503).json({
    message: 'Funcionalidade do Reddit temporariamente desativada',
    status: 'maintenance'
  });
});

router.use('/tiktok', (req, res) => {
  res.status(503).json({
    message: 'Funcionalidade do TikTok temporariamente desativada',
    status: 'maintenance'
  });
});

export default router;
