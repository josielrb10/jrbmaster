import Fonte from '../models/Fonte.js';
import Premissa from '../models/Premissa.js';
import Nicho from '../models/Nicho.js';

// Controlador para gerenciar fontes
export const listarFontes = async (req, res) => {
  try {
    const fontes = await Fonte.find().sort({ dataCadastro: -1 });
    
    res.status(200).json({
      sucesso: true,
      fontes
    });
  } catch (error) {
    console.error(`Erro ao listar fontes: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao listar fontes.', 
      erro: error.message 
    });
  }
};

export const obterFonte = async (req, res) => {
  try {
    const { id } = req.params;
    
    const fonte = await Fonte.findById(id);
    if (!fonte) {
      return res.status(404).json({ 
        sucesso: false, 
        mensagem: 'Fonte não encontrada.' 
      });
    }
    
    res.status(200).json({
      sucesso: true,
      fonte
    });
  } catch (error) {
    console.error(`Erro ao obter fonte: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao obter fonte.', 
      erro: error.message 
    });
  }
};

export const removerFonte = async (req, res) => {
  try {
    const { id } = req.params;
    
    const fonte = await Fonte.findById(id);
    if (!fonte) {
      return res.status(404).json({ 
        sucesso: false, 
        mensagem: 'Fonte não encontrada.' 
      });
    }
    
    // Remover premissas associadas a esta fonte
    await Premissa.deleteMany({ 'fonte.id': id });
    
    // Remover a fonte
    await Fonte.findByIdAndDelete(id);
    
    res.status(200).json({
      sucesso: true,
      mensagem: 'Fonte removida com sucesso.'
    });
  } catch (error) {
    console.error(`Erro ao remover fonte: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao remover fonte.', 
      erro: error.message 
    });
  }
};

// Controlador para gerenciar premissas
export const listarPremissas = async (req, res) => {
  try {
    const { 
      fonte, 
      nicho, 
      subnicho, 
      dataInicio, 
      dataFim, 
      likesMin, 
      likesMax, 
      comentariosMin, 
      comentariosMax, 
      visualizacoesMin, 
      visualizacoesMax,
      utilizada,
      pagina = 1,
      limite = 20,
      ordenarPor = 'dataAtualizacao',
      ordem = 'desc'
    } = req.query;
    
    // Construir filtro
    const filtro = {};
    
    if (fonte) {
      filtro['fonte.id'] = fonte;
    }
    
    if (nicho) {
      filtro.nicho = nicho;
    }
    
    if (subnicho) {
      filtro.subnicho = subnicho;
    }
    
    // Filtro de data
    if (dataInicio || dataFim) {
      filtro['metadados.data'] = {};
      
      if (dataInicio) {
        filtro['metadados.data'].$gte = new Date(dataInicio);
      }
      
      if (dataFim) {
        filtro['metadados.data'].$lte = new Date(dataFim);
      }
    }
    
    // Filtro de likes
    if (likesMin || likesMax) {
      filtro['metadados.likes'] = {};
      
      if (likesMin) {
        filtro['metadados.likes'].$gte = parseInt(likesMin);
      }
      
      if (likesMax) {
        filtro['metadados.likes'].$lte = parseInt(likesMax);
      }
    }
    
    // Filtro de comentários
    if (comentariosMin || comentariosMax) {
      filtro['metadados.comentarios'] = {};
      
      if (comentariosMin) {
        filtro['metadados.comentarios'].$gte = parseInt(comentariosMin);
      }
      
      if (comentariosMax) {
        filtro['metadados.comentarios'].$lte = parseInt(comentariosMax);
      }
    }
    
    // Filtro de visualizações
    if (visualizacoesMin || visualizacoesMax) {
      filtro['metadados.visualizacoes'] = {};
      
      if (visualizacoesMin) {
        filtro['metadados.visualizacoes'].$gte = parseInt(visualizacoesMin);
      }
      
      if (visualizacoesMax) {
        filtro['metadados.visualizacoes'].$lte = parseInt(visualizacoesMax);
      }
    }
    
    // Filtro de utilizada
    if (utilizada !== undefined) {
      filtro.utilizada = utilizada === 'true';
    }
    
    // Configurar ordenação
    const ordenacao = {};
    ordenacao[ordenarPor] = ordem === 'asc' ? 1 : -1;
    
    // Calcular paginação
    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    
    // Buscar premissas
    const premissas = await Premissa.find(filtro)
      .sort(ordenacao)
      .skip(skip)
      .limit(parseInt(limite));
    
    // Contar total de premissas
    const total = await Premissa.countDocuments(filtro);
    
    res.status(200).json({
      sucesso: true,
      premissas,
      paginacao: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(total / parseInt(limite))
      }
    });
  } catch (error) {
    console.error(`Erro ao listar premissas: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao listar premissas.', 
      erro: error.message 
    });
  }
};

export const obterPremissa = async (req, res) => {
  try {
    const { id } = req.params;
    
    const premissa = await Premissa.findById(id);
    if (!premissa) {
      return res.status(404).json({ 
        sucesso: false, 
        mensagem: 'Premissa não encontrada.' 
      });
    }
    
    res.status(200).json({
      sucesso: true,
      premissa
    });
  } catch (error) {
    console.error(`Erro ao obter premissa: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao obter premissa.', 
      erro: error.message 
    });
  }
};

export const marcarPremissaUtilizada = async (req, res) => {
  try {
    const { id } = req.params;
    const { utilizada } = req.body;
    
    const premissa = await Premissa.findById(id);
    if (!premissa) {
      return res.status(404).json({ 
        sucesso: false, 
        mensagem: 'Premissa não encontrada.' 
      });
    }
    
    premissa.utilizada = utilizada;
    premissa.dataAtualizacao = new Date();
    
    await premissa.save();
    
    res.status(200).json({
      sucesso: true,
      mensagem: `Premissa marcada como ${utilizada ? 'utilizada' : 'não utilizada'}.`,
      premissa
    });
  } catch (error) {
    console.error(`Erro ao marcar premissa: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao marcar premissa.', 
      erro: error.message 
    });
  }
};

export const atualizarNichoPremissa = async (req, res) => {
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
    
    premissa.nicho = nicho;
    premissa.subnicho = subnicho;
    premissa.dataAtualizacao = new Date();
    
    await premissa.save();
    
    res.status(200).json({
      sucesso: true,
      mensagem: 'Nicho da premissa atualizado com sucesso.',
      premissa
    });
  } catch (error) {
    console.error(`Erro ao atualizar nicho da premissa: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao atualizar nicho da premissa.', 
      erro: error.message 
    });
  }
};

// Controlador para gerenciar nichos
export const listarNichos = async (req, res) => {
  try {
    const nichos = await Nicho.find().sort({ nome: 1 });
    
    res.status(200).json({
      sucesso: true,
      nichos
    });
  } catch (error) {
    console.error(`Erro ao listar nichos: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao listar nichos.', 
      erro: error.message 
    });
  }
};

export const adicionarNicho = async (req, res) => {
  try {
    const { nome, subnichos } = req.body;
    
    // Verificar se o nicho já existe
    const nichoExistente = await Nicho.findOne({ nome });
    if (nichoExistente) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Este nicho já existe.' 
      });
    }
    
    // Criar novo nicho
    const novoNicho = new Nicho({
      nome,
      subnichos: subnichos || []
    });
    
    await novoNicho.save();
    
    res.status(201).json({
      sucesso: true,
      mensagem: 'Nicho adicionado com sucesso.',
      nicho: novoNicho
    });
  } catch (error) {
    console.error(`Erro ao adicionar nicho: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao adicionar nicho.', 
      erro: error.message 
    });
  }
};

export const atualizarNicho = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, subnichos } = req.body;
    
    const nicho = await Nicho.findById(id);
    if (!nicho) {
      return res.status(404).json({ 
        sucesso: false, 
        mensagem: 'Nicho não encontrado.' 
      });
    }
    
    // Atualizar nicho
    nicho.nome = nome || nicho.nome;
    nicho.subnichos = subnichos || nicho.subnichos;
    
    await nicho.save();
    
    res.status(200).json({
      sucesso: true,
      mensagem: 'Nicho atualizado com sucesso.',
      nicho
    });
  } catch (error) {
    console.error(`Erro ao atualizar nicho: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao atualizar nicho.', 
      erro: error.message 
    });
  }
};

export const removerNicho = async (req, res) => {
  try {
    const { id } = req.params;
    
    const nicho = await Nicho.findById(id);
    if (!nicho) {
      return res.status(404).json({ 
        sucesso: false, 
        mensagem: 'Nicho não encontrado.' 
      });
    }
    
    await Nicho.findByIdAndDelete(id);
    
    res.status(200).json({
      sucesso: true,
      mensagem: 'Nicho removido com sucesso.'
    });
  } catch (error) {
    console.error(`Erro ao remover nicho: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao remover nicho.', 
      erro: error.message 
    });
  }
};

export default {
  listarFontes,
  obterFonte,
  removerFonte,
  listarPremissas,
  obterPremissa,
  marcarPremissaUtilizada,
  atualizarNichoPremissa,
  listarNichos,
  adicionarNicho,
  atualizarNicho,
  removerNicho
};
