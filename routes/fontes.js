import express from 'express';
import Fonte from '../models/Fonte.js';

const router = express.Router();

// Listar todas as fontes
router.get('/', async (req, res) => {
  try {
    const fontes = await Fonte.find().sort({ createdAt: -1 });
    
    return res.json({
      sucesso: true,
      fontes
    });
  } catch (error) {
    console.error('Erro ao listar fontes:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar fontes.'
    });
  }
});

// Adicionar nova fonte do YouTube
router.post('/youtube', async (req, res) => {
  try {
    const { url, nome } = req.body;
    
    if (!url) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'URL é obrigatória.'
      });
    }
    
    // Verificar se a fonte já existe
    const fonteExistente = await Fonte.findOne({ url });
    
    if (fonteExistente) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Esta fonte já está cadastrada.'
      });
    }
    
    // Criar nova fonte
    const novaFonte = new Fonte({
      tipo: 'youtube',
      url,
      nome: nome || url
    });
    
    await novaFonte.save();
    
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Fonte adicionada com sucesso.',
      fonte: novaFonte
    });
  } catch (error) {
    console.error('Erro ao adicionar fonte do YouTube:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao adicionar fonte do YouTube.'
    });
  }
});

// Adicionar nova fonte do Reddit
router.post('/reddit', async (req, res) => {
  try {
    const { url, nome } = req.body;
    
    if (!url) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'URL é obrigatória.'
      });
    }
    
    // Verificar se a fonte já existe
    const fonteExistente = await Fonte.findOne({ url });
    
    if (fonteExistente) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Esta fonte já está cadastrada.'
      });
    }
    
    // Criar nova fonte
    const novaFonte = new Fonte({
      tipo: 'reddit',
      url,
      nome: nome || url
    });
    
    await novaFonte.save();
    
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Fonte adicionada com sucesso.',
      fonte: novaFonte
    });
  } catch (error) {
    console.error('Erro ao adicionar fonte do Reddit:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao adicionar fonte do Reddit.'
    });
  }
});

// Adicionar nova fonte do TikTok
router.post('/tiktok', async (req, res) => {
  try {
    const { url, nome } = req.body;
    
    if (!url) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'URL é obrigatória.'
      });
    }
    
    // Verificar se a fonte já existe
    const fonteExistente = await Fonte.findOne({ url });
    
    if (fonteExistente) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Esta fonte já está cadastrada.'
      });
    }
    
    // Criar nova fonte
    const novaFonte = new Fonte({
      tipo: 'tiktok',
      url,
      nome: nome || url
    });
    
    await novaFonte.save();
    
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Fonte adicionada com sucesso.',
      fonte: novaFonte
    });
  } catch (error) {
    console.error('Erro ao adicionar fonte do TikTok:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao adicionar fonte do TikTok.'
    });
  }
});

// Remover fonte
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const fonte = await Fonte.findById(id);
    
    if (!fonte) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Fonte não encontrada.'
      });
    }
    
    await fonte.remove();
    
    return res.json({
      sucesso: true,
      mensagem: 'Fonte removida com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao remover fonte:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao remover fonte.'
    });
  }
});

export default router;
