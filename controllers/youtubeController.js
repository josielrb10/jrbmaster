import Fonte from '../models/Fonte.js';
import Premissa from '../models/Premissa.js';
import youtubeService from '../services/youtube/youtubeService.js';

// Controlador para gerenciar fontes do YouTube
export const adicionarFonteYoutube = async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validar URL do YouTube
    if (!url || !url.includes('youtube.com/')) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'URL inválida. Forneça uma URL válida de canal do YouTube.' 
      });
    }
    
    // Extrair ID do canal da URL
    let channelId = '';
    if (url.includes('/channel/')) {
      channelId = url.split('/channel/')[1].split('/')[0];
    } else if (url.includes('/c/') || url.includes('/@')) {
      // Para URLs personalizadas, precisamos fazer uma busca
      // Esta é uma simplificação, em um sistema real seria mais complexo
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Por favor, forneça a URL completa do canal no formato: https://www.youtube.com/channel/ID_DO_CANAL' 
      });
    } else {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Formato de URL não reconhecido.' 
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
    
    // Obter informações do canal
    const canalInfo = await youtubeService.getChannelInfo(channelId);
    
    // Criar nova fonte
    const novaFonte = new Fonte({
      tipo: 'youtube',
      url: canalInfo.url,
      nome: canalInfo.nome
    });
    
    await novaFonte.save();
    
    res.status(201).json({
      sucesso: true,
      mensagem: 'Canal do YouTube adicionado com sucesso.',
      fonte: novaFonte
    });
  } catch (error) {
    console.error(`Erro ao adicionar fonte do YouTube: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao adicionar fonte do YouTube.', 
      erro: error.message 
    });
  }
};

// Controlador para extrair dados de um canal do YouTube
export const extrairDadosYoutube = async (req, res) => {
  try {
    const { fonteId } = req.params;
    const { maxResults = 10, order = 'viewCount' } = req.query;
    
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
        mensagem: 'A fonte especificada não é um canal do YouTube.' 
      });
    }
    
    // Extrair ID do canal da URL
    const channelId = fonte.url.split('/channel/')[1].split('/')[0];
    
    // Obter vídeos do canal
    const videos = await youtubeService.getChannelVideos(channelId, maxResults, order);
    
    // Processar e salvar cada vídeo como uma premissa
    const premissasSalvas = [];
    
    for (const video of videos) {
      // Verificar se a premissa já existe
      const premissaExistente = await Premissa.findOne({ link: video.link });
      
      if (!premissaExistente) {
        // Gerar premissa em primeira pessoa
        const premissaPrimeiraPessoa = youtubeService.gerarPremissaPrimeiraPessoa(video.premissa);
        
        // Criar nova premissa
        const novaPremissa = new Premissa({
          fonte: {
            id: fonte._id,
            tipo: fonte.tipo,
            url: fonte.url,
            nome: fonte.nome
          },
          link: video.link,
          premissa: video.premissa,
          descricaoBreve: video.descricaoBreve,
          premissaPrimeiraPessoa,
          metadados: {
            data: video.metadados.data,
            likes: video.metadados.likes,
            comentarios: video.metadados.comentarios,
            visualizacoes: video.metadados.visualizacoes
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
    console.error(`Erro ao extrair dados do YouTube: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao extrair dados do YouTube.', 
      erro: error.message 
    });
  }
};

// Controlador para analisar um canal específico do YouTube
export const analisarCanalYoutube = async (req, res) => {
  try {
    const { url } = req.body;
    const { maxResults = 20, order = 'viewCount' } = req.query;
    
    // Validar URL do YouTube
    if (!url || !url.includes('youtube.com/')) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'URL inválida. Forneça uma URL válida de canal do YouTube.' 
      });
    }
    
    // Extrair ID do canal da URL
    let channelId = '';
    if (url.includes('/channel/')) {
      channelId = url.split('/channel/')[1].split('/')[0];
    } else if (url.includes('/c/') || url.includes('/@')) {
      // Para URLs personalizadas, precisamos fazer uma busca
      // Esta é uma simplificação, em um sistema real seria mais complexo
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Por favor, forneça a URL completa do canal no formato: https://www.youtube.com/channel/ID_DO_CANAL' 
      });
    } else {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Formato de URL não reconhecido.' 
      });
    }
    
    // Obter informações do canal
    const canalInfo = await youtubeService.getChannelInfo(channelId);
    
    // Obter vídeos do canal
    const videos = await youtubeService.getChannelVideos(channelId, maxResults, order);
    
    res.status(200).json({
      sucesso: true,
      canal: canalInfo,
      videos: videos
    });
  } catch (error) {
    console.error(`Erro ao analisar canal do YouTube: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao analisar canal do YouTube.', 
      erro: error.message 
    });
  }
};

export default {
  adicionarFonteYoutube,
  extrairDadosYoutube,
  analisarCanalYoutube
};
