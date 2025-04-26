import express from 'express';
import { extrairDadosSubreddit, extrairDadosPost } from '../services/reddit/redditService.js';
import Fonte from '../models/Fonte.js';
import Premissa from '../models/Premissa.js';

const router = express.Router();

// Analisar subreddit do Reddit
router.post('/analisar', async (req, res) => {
  try {
    const { url, ordenarPor, quantidade } = req.body;
    
    if (!url) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'URL do subreddit é obrigatória.'
      });
    }
    
    const options = {
      ordenarPor,
      quantidade
    };
    
    const resultado = await extrairDadosSubreddit(url, options);
    
    if (!resultado.sucesso) {
      return res.status(400).json(resultado);
    }
    
    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao analisar subreddit do Reddit:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao analisar subreddit do Reddit.'
    });
  }
});

// Extrair dados de um subreddit cadastrado
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
    
    if (fonte.tipo !== 'reddit') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'A fonte não é do tipo Reddit.'
      });
    }
    
    // Extrair dados do subreddit
    const resultado = await extrairDadosSubreddit(fonte.url);
    
    if (!resultado.sucesso) {
      return res.status(400).json(resultado);
    }
    
    // Salvar premissas no banco de dados
    const premissasSalvas = [];
    
    for (const post of resultado.posts) {
      // Verificar se a premissa já existe
      const premissaExistente = await Premissa.findOne({
        link: post.link
      });
      
      if (!premissaExistente) {
        const novaPremissa = new Premissa({
          fonte: fonte._id,
          tipo: 'reddit',
          link: post.link,
          premissa: post.premissa,
          descricaoBreve: post.descricaoBreve,
          titulo: post.titulo,
          autor: post.autor,
          metadados: post.metadados
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
    console.error('Erro ao extrair dados do subreddit do Reddit:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao extrair dados do subreddit do Reddit.'
    });
  }
});

// Extrair dados de um post específico
router.post('/post', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'URL do post é obrigatória.'
      });
    }
    
    const resultado = await extrairDadosPost(url);
    
    if (!resultado.sucesso) {
      return res.status(400).json(resultado);
    }
    
    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao extrair dados do post do Reddit:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao extrair dados do post do Reddit.'
    });
  }
});

export default router;
