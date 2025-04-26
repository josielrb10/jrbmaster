import Fonte from '../models/Fonte.js';
import Premissa from '../models/Premissa.js';
import redditService from '../services/reddit/redditService.js';

// Controlador para gerenciar fontes do Reddit
export const adicionarFonteReddit = async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validar URL do Reddit
    if (!url || !url.includes('reddit.com/r/')) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'URL inválida. Forneça uma URL válida de comunidade do Reddit.' 
      });
    }
    
    // Extrair nome do subreddit da URL
    const subredditName = url.split('/r/')[1].split('/')[0];
    
    // Verificar se a fonte já existe
    const fonteExistente = await Fonte.findOne({ 
      url: { $regex: new RegExp(`/r/${subredditName}`, 'i') } 
    });
    
    if (fonteExistente) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Esta comunidade já está cadastrada.' 
      });
    }
    
    // Obter informações do subreddit
    const subredditInfo = await redditService.getSubredditInfo(subredditName);
    
    // Criar nova fonte
    const novaFonte = new Fonte({
      tipo: 'reddit',
      url: subredditInfo.url,
      nome: subredditInfo.nome
    });
    
    await novaFonte.save();
    
    res.status(201).json({
      sucesso: true,
      mensagem: 'Comunidade do Reddit adicionada com sucesso.',
      fonte: novaFonte
    });
  } catch (error) {
    console.error(`Erro ao adicionar fonte do Reddit: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao adicionar fonte do Reddit.', 
      erro: error.message 
    });
  }
};

// Controlador para extrair dados de uma comunidade do Reddit
export const extrairDadosReddit = async (req, res) => {
  try {
    const { fonteId } = req.params;
    const { sortBy = 'hot', limit = 25 } = req.query;
    
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
        mensagem: 'A fonte especificada não é uma comunidade do Reddit.' 
      });
    }
    
    // Extrair nome do subreddit da URL
    const subredditName = fonte.url.split('/r/')[1].split('/')[0];
    
    // Obter posts do subreddit
    const posts = await redditService.getSubredditPosts(subredditName, sortBy, limit);
    
    // Processar e salvar cada post como uma premissa
    const premissasSalvas = [];
    
    for (const post of posts) {
      // Verificar se a premissa já existe
      const premissaExistente = await Premissa.findOne({ link: post.link });
      
      if (!premissaExistente) {
        // Gerar premissa em primeira pessoa
        const premissaPrimeiraPessoa = redditService.gerarPremissaPrimeiraPessoa(post.premissa, post.titulo);
        
        // Criar nova premissa
        const novaPremissa = new Premissa({
          fonte: {
            id: fonte._id,
            tipo: fonte.tipo,
            url: fonte.url,
            nome: fonte.nome
          },
          link: post.link,
          premissa: post.premissa || post.titulo,
          descricaoBreve: post.descricaoBreve || post.titulo,
          premissaPrimeiraPessoa,
          metadados: {
            data: post.metadados.data,
            likes: post.metadados.likes,
            comentarios: post.metadados.comentarios
          }
        });
        
        await novaPremissa.save();
        premissasSalvas.push(novaPremissa);
      }
    }
    
    // Atualizar data da última extração
    fonte.ultimaExtracao = new Date();
    await fonte.save();
    
    res.status(200).json({
      sucesso: true,
      mensagem: `Dados extraídos com sucesso. ${premissasSalvas.length} novas premissas salvas.`,
      premissas: premissasSalvas
    });
  } catch (error) {
    console.error(`Erro ao extrair dados do Reddit: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao extrair dados do Reddit.', 
      erro: error.message 
    });
  }
};

// Controlador para analisar uma comunidade específica do Reddit
export const analisarComunidadeReddit = async (req, res) => {
  try {
    const { url } = req.body;
    const { sortBy = 'hot', limit = 25 } = req.query;
    
    // Validar URL do Reddit
    if (!url || !url.includes('reddit.com/r/')) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'URL inválida. Forneça uma URL válida de comunidade do Reddit.' 
      });
    }
    
    // Extrair nome do subreddit da URL
    const subredditName = url.split('/r/')[1].split('/')[0];
    
    // Obter informações do subreddit
    const subredditInfo = await redditService.getSubredditInfo(subredditName);
    
    // Obter posts do subreddit
    const posts = await redditService.getSubredditPosts(subredditName, sortBy, limit);
    
    res.status(200).json({
      sucesso: true,
      comunidade: subredditInfo,
      posts: posts
    });
  } catch (error) {
    console.error(`Erro ao analisar comunidade do Reddit: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao analisar comunidade do Reddit.', 
      erro: error.message 
    });
  }
};

export default {
  adicionarFonteReddit,
  extrairDadosReddit,
  analisarComunidadeReddit
};
