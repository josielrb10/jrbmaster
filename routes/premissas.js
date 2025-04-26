import express from 'express';
import Premissa from '../models/Premissa.js';

const router = express.Router();

// Listar premissas com filtros
router.get('/', async (req, res) => {
  try {
    const {
      fonte,
      tipo,
      nicho,
      subnicho,
      utilizada,
      dataInicio,
      dataFim,
      minLikes,
      minComentarios,
      minVisualizacoes,
      ordenarPor,
      ordem,
      pagina = 1,
      limite = 20
    } = req.query;
    
    // Construir filtro
    const filtro = {};
    
    if (fonte) filtro.fonte = fonte;
    if (tipo) filtro.tipo = tipo;
    if (nicho) filtro.nicho = nicho;
    if (subnicho) filtro.subnicho = subnicho;
    
    if (utilizada !== undefined) {
      filtro.utilizada = utilizada === 'true';
    }
    
    // Filtros de data
    if (dataInicio || dataFim) {
      filtro['metadados.data'] = {};
      
      if (dataInicio) {
        filtro['metadados.data'].$gte = new Date(dataInicio);
      }
      
      if (dataFim) {
        filtro['metadados.data'].$lte = new Date(dataFim);
      }
    }
    
    // Filtros de métricas
    if (minLikes) {
      filtro['metadados.likes'] = { $gte: parseInt(minLikes) };
    }
    
    if (minComentarios) {
      filtro['metadados.comentarios'] = { $gte: parseInt(minComentarios) };
    }
    
    if (minVisualizacoes) {
      filtro['metadados.visualizacoes'] = { $gte: parseInt(minVisualizacoes) };
    }
    
    // Opções de ordenação
    const options = {
      skip: (parseInt(pagina) - 1) * parseInt(limite),
      limit: parseInt(limite)
    };
    
    if (ordenarPor) {
      const sortOrder = ordem === 'desc' ? -1 : 1;
      
      if (ordenarPor === 'data') {
        options.sort = { 'metadados.data': sortOrder };
      } else if (ordenarPor === 'likes') {
        options.sort = { 'metadados.likes': sortOrder };
      } else if (ordenarPor === 'comentarios') {
        options.sort = { 'metadados.comentarios': sortOrder };
      } else if (ordenarPor === 'visualizacoes') {
        options.sort = { 'metadados.visualizacoes': sortOrder };
      } else {
        options.sort = { createdAt: -1 };
      }
    } else {
      options.sort = { createdAt: -1 };
    }
    
    // Buscar premissas
    const premissas = await Premissa.find(filtro, null, options).populate('fonte').populate('nicho');
    
    // Contar total de premissas
    const total = await Premissa.countDocuments(filtro);
    
    return res.json({
      sucesso: true,
      premissas,
      total,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      totalPaginas: Math.ceil(total / parseInt(limite))
    });
  } catch (error) {
    console.error('Erro ao listar premissas:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar premissas.'
    });
  }
});

// Marcar premissa como utilizada/não utilizada
router.patch('/:id/utilizada', async (req, res) => {
  try {
    const { id } = req.params;
    const { utilizada } = req.body;
    
    if (utilizada === undefined) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O campo "utilizada" é obrigatório.'
      });
    }
    
    const premissa = await Premissa.findById(id);
    
    if (!premissa) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Premissa não encontrada.'
      });
    }
    
    premissa.utilizada = utilizada;
    await premissa.save();
    
    return res.json({
      sucesso: true,
      mensagem: `Premissa marcada como ${utilizada ? 'utilizada' : 'não utilizada'}.`,
      premissa
    });
  } catch (error) {
    console.error('Erro ao atualizar premissa:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar premissa.'
    });
  }
});

// Atualizar nicho da premissa
router.patch('/:id/nicho', async (req, res) => {
  try {
    const { id } = req.params;
    const { nicho, subnicho } = req.body;
    
    const premissa = await Premissa.findById(id);
    
    if (!premissa) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Premissa não encontrada.'
      });
    }
    
    if (nicho) {
      premissa.nicho = nicho;
    }
    
    if (subnicho) {
      premissa.subnicho = subnicho;
    }
    
    await premissa.save();
    
    return res.json({
      sucesso: true,
      mensagem: 'Nicho da premissa atualizado com sucesso.',
      premissa
    });
  } catch (error) {
    console.error('Erro ao atualizar nicho da premissa:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar nicho da premissa.'
    });
  }
});

// Gerar premissa em primeira pessoa
router.get('/:id/primeira-pessoa', async (req, res) => {
  try {
    const { id } = req.params;
    
    const premissa = await Premissa.findById(id);
    
    if (!premissa) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Premissa não encontrada.'
      });
    }
    
    // Converter para primeira pessoa
    let texto = premissa.premissa.trim();
    
    // Remover pontuação final se existir
    if (texto.endsWith('.') || texto.endsWith('!') || texto.endsWith('?')) {
      texto = texto.slice(0, -1);
    }
    
    // Converter para primeira pessoa
    const primeiraLetra = texto.charAt(0).toLowerCase();
    const restante = texto.slice(1);
    
    const primeiraPessoa = `Eu ${primeiraLetra}${restante}.`;
    
    return res.json({
      sucesso: true,
      premissa: premissa.premissa,
      primeiraPessoa
    });
  } catch (error) {
    console.error('Erro ao gerar premissa em primeira pessoa:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao gerar premissa em primeira pessoa.'
    });
  }
});

export default router;
