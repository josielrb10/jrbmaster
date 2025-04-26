import express from 'express';
import Nicho from '../models/Nicho.js';

const router = express.Router();

// Listar todos os nichos
router.get('/', async (req, res) => {
  try {
    const nichos = await Nicho.find().sort({ nome: 1 });
    
    return res.json({
      sucesso: true,
      nichos
    });
  } catch (error) {
    console.error('Erro ao listar nichos:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar nichos.'
    });
  }
});

// Adicionar novo nicho
router.post('/', async (req, res) => {
  try {
    const { nome, subnichos } = req.body;
    
    if (!nome) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome do nicho é obrigatório.'
      });
    }
    
    // Verificar se o nicho já existe
    const nichoExistente = await Nicho.findOne({ nome });
    
    if (nichoExistente) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Este nicho já está cadastrado.'
      });
    }
    
    // Criar novo nicho
    const novoNicho = new Nicho({
      nome,
      subnichos: subnichos || []
    });
    
    await novoNicho.save();
    
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Nicho adicionado com sucesso.',
      nicho: novoNicho
    });
  } catch (error) {
    console.error('Erro ao adicionar nicho:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao adicionar nicho.'
    });
  }
});

// Adicionar subnicho a um nicho existente
router.post('/:id/subnichos', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    
    if (!nome) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome do subnicho é obrigatório.'
      });
    }
    
    const nicho = await Nicho.findById(id);
    
    if (!nicho) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Nicho não encontrado.'
      });
    }
    
    // Verificar se o subnicho já existe
    if (nicho.subnichos.includes(nome)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Este subnicho já está cadastrado neste nicho.'
      });
    }
    
    // Adicionar subnicho
    nicho.subnichos.push(nome);
    await nicho.save();
    
    return res.json({
      sucesso: true,
      mensagem: 'Subnicho adicionado com sucesso.',
      nicho
    });
  } catch (error) {
    console.error('Erro ao adicionar subnicho:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao adicionar subnicho.'
    });
  }
});

// Remover nicho
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const nicho = await Nicho.findById(id);
    
    if (!nicho) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Nicho não encontrado.'
      });
    }
    
    await nicho.remove();
    
    return res.json({
      sucesso: true,
      mensagem: 'Nicho removido com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao remover nicho:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao remover nicho.'
    });
  }
});

export default router;
