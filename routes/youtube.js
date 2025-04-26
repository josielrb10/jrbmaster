import express from 'express';
import { extrairDadosCanal, extrairDadosVideo } from '../services/youtube/youtubeService.js';
import Fonte from '../models/Fonte.js';
import Premissa from '../models/Premissa.js';

const router = express.Router();

// Analisar canal do YouTube
router.post('/analisar', async (req, res) => {
  try {
    const { url, ordenarPor, quantidade } = req.body;
    
    if (!url) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'URL do canal é obrigatória.'
      });
    }
    
    const options = {
      ordenarPor,
      quantidade
    };
    
    const resultado = await extrairDadosCanal(url, options);
    
    if (!resultado.sucesso) {
      return res.status(400).json(resultado);
    }
    
    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao analisar canal do YouTube:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao analisar canal do YouTube.'
    });
  }
});

// Extrair dados de um canal cadastrado
router.post('/extrair/:fonteId', async (req, res) => {
  try {
    const { fonteId } = req.params;
    
    // Buscar fonte no banco de dados
    const fonte = await Fonte.findById(fonteId);
    
    if (!fonte) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Fonte não encontrada.'
      });
    }
    
    if (fonte.tipo !== 'youtube') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'A fonte não é do tipo YouTube.'
      });
    }
    
    // Extrair dados do canal
    const resultado = await extrairDadosCanal(fonte.url);
    
    if (!resultado.sucesso) {
      return res.status(400).json(resultado);
    }
    
    // Salvar premissas no banco de dados
    const premissasSalvas = [];
    
    for (const video of resultado.videos) {
      // Verificar se a premissa já existe
      const premissaExistente = await Premissa.findOne({
        link: video.link
      });
      
      if (!premissaExistente) {
        const novaPremissa = new Premissa({
          fonte: fonte._id,
          tipo: 'youtube',
          link: video.link,
          premissa: video.premissa,
          descricaoBreve: video.descricaoBreve,
          titulo: video.titulo,
          autor: video.canal,
          metadados: video.metadados
        });
        
        await novaPremissa.save();
        premissasSalvas.push(novaPremissa);
      }
    }
    
    return res.json({
      sucesso: true,
      mensagem: `${premissasSalvas.length} novas premissas extraídas com sucesso.`,
      premissas: premissasSalvas
    });
  } catch (error) {
    console.error('Erro ao extrair dados do canal do YouTube:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao extrair dados do canal do YouTube.'
    });
  }
});

// Extrair dados de um vídeo específico
router.post('/video', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'URL do vídeo é obrigatória.'
      });
    }
    
    const resultado = await extrairDadosVideo(url);
    
    if (!resultado.sucesso) {
      return res.status(400).json(resultado);
    }
    
    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao extrair dados do vídeo do YouTube:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao extrair dados do vídeo do YouTube.'
    });
  }
});

export default router;
