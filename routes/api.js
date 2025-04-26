import express from 'express';
import fonteRoutes from './fontes.js';
import premissaRoutes from './premissas.js';
import nichoRoutes from './nichos.js';
import youtubeRoutes from './youtube.js';
import redditRoutes from './reddit.js';
import tiktokRoutes from './tiktok.js';

const router = express.Router();

// Rotas para fontes
router.use('/fontes', fonteRoutes);

// Rotas para premissas
router.use('/premissas', premissaRoutes);

// Rotas para nichos
router.use('/nichos', nichoRoutes);

// Rotas para YouTube
router.use('/youtube', youtubeRoutes);

// Rotas para Reddit
router.use('/reddit', redditRoutes);

// Rotas para TikTok
router.use('/tiktok', tiktokRoutes);

export default router;
