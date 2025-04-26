import axios from 'axios';
import { google } from 'googleapis';
import cheerio from 'cheerio';

// Configuração da API do YouTube
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

/**
 * Extrai dados de um canal do YouTube
 * @param {string} canalUrl - URL do canal do YouTube
 * @param {Object} options - Opções de extração
 * @returns {Promise<Object>} - Dados do canal e vídeos
 */
export const extrairDadosCanal = async (canalUrl, options = {}) => {
  try {
    // Extrair ID do canal da URL
    let canalId = '';
    
    if (canalUrl.includes('/channel/')) {
      canalId = canalUrl.split('/channel/')[1].split('/')[0];
    } else if (canalUrl.includes('/c/') || canalUrl.includes('/@')) {
      // Para URLs com nome personalizado, primeiro precisamos obter o ID do canal
      const response = await axios.get(canalUrl);
      const $ = cheerio.load(response.data);
      const canonicalUrl = $('link[rel="canonical"]').attr('href');
      
      if (canonicalUrl && canonicalUrl.includes('/channel/')) {
        canalId = canonicalUrl.split('/channel/')[1].split('/')[0];
      } else {
        throw new Error('Não foi possível extrair o ID do canal a partir da URL fornecida.');
      }
    } else {
      throw new Error('URL de canal inválida. Forneça uma URL válida do YouTube.');
    }
    
    // Obter informações do canal
    const canalResponse = await youtube.channels.list({
      part: 'snippet,statistics,contentDetails',
      id: canalId
    });
    
    if (!canalResponse.data.items || canalResponse.data.items.length === 0) {
      throw new Error('Canal não encontrado.');
    }
    
    const canalInfo = canalResponse.data.items[0];
    
    // Obter vídeos do canal
    const maxResults = options.quantidade || 20;
    const order = options.ordenarPor || 'viewCount'; // viewCount, date, rating, relevance
    
    const videosResponse = await youtube.search.list({
      part: 'snippet',
      channelId: canalId,
      maxResults,
      order,
      type: 'video'
    });
    
    if (!videosResponse.data.items) {
      throw new Error('Não foi possível obter os vídeos do canal.');
    }
    
    // Obter detalhes dos vídeos (estatísticas)
    const videoIds = videosResponse.data.items.map(item => item.id.videoId);
    
    const videosDetalhesResponse = await youtube.videos.list({
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(',')
    });
    
    // Formatar dados do canal
    const canal = {
      id: canalInfo.id,
      nome: canalInfo.snippet.title,
      descricao: canalInfo.snippet.description,
      url: `https://www.youtube.com/channel/${canalInfo.id}`,
      inscritos: parseInt(canalInfo.statistics.subscriberCount),
      totalViews: parseInt(canalInfo.statistics.viewCount),
      totalVideos: parseInt(canalInfo.statistics.videoCount),
      thumbnail: canalInfo.snippet.thumbnails.high.url
    };
    
    // Formatar dados dos vídeos
    const videos = videosDetalhesResponse.data.items.map(video => {
      return {
        id: video.id,
        link: `https://www.youtube.com/watch?v=${video.id}`,
        premissa: video.snippet.description,
        descricaoBreve: video.snippet.description.substring(0, 150) + (video.snippet.description.length > 150 ? '...' : ''),
        titulo: video.snippet.title,
        canal: video.snippet.channelTitle,
        canalId: video.snippet.channelId,
        metadados: {
          data: video.snippet.publishedAt,
          visualizacoes: parseInt(video.statistics.viewCount),
          likes: parseInt(video.statistics.likeCount),
          comentarios: parseInt(video.statistics.commentCount)
        },
        thumbnails: video.snippet.thumbnails
      };
    });
    
    return {
      sucesso: true,
      canal,
      videos
    };
  } catch (error) {
    console.error('Erro ao extrair dados do canal do YouTube:', error);
    return {
      sucesso: false,
      mensagem: error.message || 'Erro ao extrair dados do canal do YouTube.'
    };
  }
};

/**
 * Extrai dados de um vídeo específico do YouTube
 * @param {string} videoUrl - URL do vídeo do YouTube
 * @returns {Promise<Object>} - Dados do vídeo
 */
export const extrairDadosVideo = async (videoUrl) => {
  try {
    // Extrair ID do vídeo da URL
    let videoId = '';
    
    if (videoUrl.includes('watch?v=')) {
      videoId = videoUrl.split('watch?v=')[1].split('&')[0];
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    } else {
      throw new Error('URL de vídeo inválida. Forneça uma URL válida do YouTube.');
    }
    
    // Obter detalhes do vídeo
    const videoResponse = await youtube.videos.list({
      part: 'snippet,statistics,contentDetails',
      id: videoId
    });
    
    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      throw new Error('Vídeo não encontrado.');
    }
    
    const videoInfo = videoResponse.data.items[0];
    
    // Formatar dados do vídeo
    const video = {
      id: videoInfo.id,
      link: `https://www.youtube.com/watch?v=${videoInfo.id}`,
      premissa: videoInfo.snippet.description,
      descricaoBreve: videoInfo.snippet.description.substring(0, 150) + (videoInfo.snippet.description.length > 150 ? '...' : ''),
      titulo: videoInfo.snippet.title,
      canal: videoInfo.snippet.channelTitle,
      canalId: videoInfo.snippet.channelId,
      metadados: {
        data: videoInfo.snippet.publishedAt,
        visualizacoes: parseInt(videoInfo.statistics.viewCount),
        likes: parseInt(videoInfo.statistics.likeCount),
        comentarios: parseInt(videoInfo.statistics.commentCount)
      },
      thumbnails: videoInfo.snippet.thumbnails
    };
    
    return {
      sucesso: true,
      video
    };
  } catch (error) {
    console.error('Erro ao extrair dados do vídeo do YouTube:', error);
    return {
      sucesso: false,
      mensagem: error.message || 'Erro ao extrair dados do vídeo do YouTube.'
    };
  }
};

export default {
  extrairDadosCanal,
  extrairDadosVideo
};
