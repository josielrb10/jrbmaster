import Fonte from '../models/Fonte.js';
import Premissa from '../models/Premissa.js';
import tiktokService from '../services/tiktok/tiktokService.js';

// Controlador para gerenciar fontes do TikTok
export const adicionarFonteTikTok = async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validar URL do TikTok
    if (!url || !url.includes('tiktok.com/@')) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'URL inválida. Forneça uma URL válida de perfil do TikTok.' 
      });
    }
    
    // Extrair nome de usuário da URL
    const username = url.split('@')[1].split('/')[0].split('?')[0];
    
    // Verificar se a fonte já existe
    const fonteExistente = await Fonte.findOne({ 
      url: { $regex: new RegExp(`@${username}`, 'i') } 
    });
    
    if (fonteExistente) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Este perfil já está cadastrado.' 
      });
    }
    
    // Obter informações do perfil
    const perfilInfo = await tiktokService.getProfileInfo(username);
    
    // Criar nova fonte
    const novaFonte = new Fonte({
      tipo: 'tiktok',
      url: perfilInfo.url,
      nome: perfilInfo.nome || username
    });
    
    await novaFonte.save();
    
    res.status(201).json({
      sucesso: true,
      mensagem: 'Perfil do TikTok adicionado com sucesso.',
      fonte: novaFonte
    });
  } catch (error) {
    console.error(`Erro ao adicionar fonte do TikTok: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao adicionar fonte do TikTok.', 
      erro: error.message 
    });
  }
};

// Controlador para extrair dados de um perfil do TikTok
export const extrairDadosTikTok = async (req, res) => {
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
    
    if (fonte.tipo !== 'tiktok') {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'A fonte especificada não é um perfil do TikTok.' 
      });
    }
    
    // Extrair nome de usuário da URL
    const username = fonte.url.split('@')[1].split('/')[0].split('?')[0];
    
    // Obter vídeos do perfil
    const videos = await tiktokService.getProfileVideos(username);
    
    // Processar e salvar cada vídeo como uma premissa
    const premissasSalvas = [];
    
    for (const video of videos) {
      // Verificar se a premissa já existe
      const premissaExistente = await Premissa.findOne({ link: video.link });
      
      if (!premissaExistente) {
        // Gerar premissa em primeira pessoa
        const premissaPrimeiraPessoa = tiktokService.gerarPremissaPrimeiraPessoa(video.premissa);
        
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
            data: video.metadados.data || new Date(),
            likes: video.metadados.likes,
            comentarios: video.metadados.comentarios
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
    console.error(`Erro ao extrair dados do TikTok: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao extrair dados do TikTok.', 
      erro: error.message 
    });
  }
};

// Controlador para analisar um perfil específico do TikTok
export const analisarPerfilTikTok = async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validar URL do TikTok
    if (!url || !url.includes('tiktok.com/@')) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'URL inválida. Forneça uma URL válida de perfil do TikTok.' 
      });
    }
    
    // Extrair nome de usuário da URL
    const username = url.split('@')[1].split('/')[0].split('?')[0];
    
    // Obter informações do perfil
    const perfilInfo = await tiktokService.getProfileInfo(username);
    
    // Obter vídeos do perfil
    const videos = await tiktokService.getProfileVideos(username);
    
    res.status(200).json({
      sucesso: true,
      perfil: perfilInfo,
      videos: videos
    });
  } catch (error) {
    console.error(`Erro ao analisar perfil do TikTok: ${error.message}`);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao analisar perfil do TikTok.', 
      erro: error.message 
    });
  }
};

export default {
  adicionarFonteTikTok,
  extrairDadosTikTok,
  analisarPerfilTikTok
};
