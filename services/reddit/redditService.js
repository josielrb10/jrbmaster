import axios from 'axios';
import cheerio from 'cheerio';

/**
 * Extrai dados de um subreddit do Reddit
 * @param {string} subredditUrl - URL do subreddit
 * @param {Object} options - Opções de extração
 * @returns {Promise<Object>} - Dados do subreddit e posts
 */
export const extrairDadosSubreddit = async (subredditUrl, options = {}) => {
  try {
    // Extrair nome do subreddit da URL
    let subredditName = '';
    
    if (subredditUrl.includes('/r/')) {
      subredditName = subredditUrl.split('/r/')[1].split('/')[0];
    } else {
      throw new Error('URL de subreddit inválida. Forneça uma URL válida do Reddit.');
    }
    
    // Definir ordenação e limite
    const sort = options.ordenarPor || 'hot'; // hot, new, top
    const limit = options.quantidade || 20;
    
    // Construir URL da API do Reddit (JSON)
    const apiUrl = `https://www.reddit.com/r/${subredditName}/${sort}.json?limit=${limit}`;
    
    // Fazer requisição para a API do Reddit
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.data || !response.data.data || !response.data.data.children) {
      throw new Error('Não foi possível obter os posts do subreddit.');
    }
    
    // Obter informações do subreddit
    const subredditInfoUrl = `https://www.reddit.com/r/${subredditName}/about.json`;
    const subredditInfoResponse = await axios.get(subredditInfoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!subredditInfoResponse.data || !subredditInfoResponse.data.data) {
      throw new Error('Não foi possível obter informações do subreddit.');
    }
    
    const subredditInfo = subredditInfoResponse.data.data;
    
    // Formatar dados do subreddit
    const subreddit = {
      id: subredditInfo.id,
      nome: subredditInfo.display_name,
      titulo: subredditInfo.title,
      descricao: subredditInfo.public_description,
      url: `https://www.reddit.com/r/${subredditInfo.display_name}`,
      inscritos: subredditInfo.subscribers,
      ativo: subredditInfo.active_user_count,
      dataCriacao: new Date(subredditInfo.created_utc * 1000).toISOString(),
      nsfw: subredditInfo.over18,
      icone: subredditInfo.icon_img || subredditInfo.community_icon
    };
    
    // Formatar dados dos posts
    const posts = response.data.data.children.map(post => {
      const postData = post.data;
      
      return {
        id: postData.id,
        link: `https://www.reddit.com${postData.permalink}`,
        premissa: postData.selftext,
        descricaoBreve: postData.selftext.substring(0, 150) + (postData.selftext.length > 150 ? '...' : ''),
        titulo: postData.title,
        autor: postData.author,
        subreddit: postData.subreddit,
        metadados: {
          data: new Date(postData.created_utc * 1000).toISOString(),
          likes: postData.ups,
          comentarios: postData.num_comments,
          ratio: postData.upvote_ratio
        },
        thumbnail: postData.thumbnail && postData.thumbnail !== 'self' ? postData.thumbnail : null,
        imagem: postData.url && (postData.url.endsWith('.jpg') || postData.url.endsWith('.png')) ? postData.url : null
      };
    });
    
    return {
      sucesso: true,
      subreddit,
      posts
    };
  } catch (error) {
    console.error('Erro ao extrair dados do subreddit do Reddit:', error);
    return {
      sucesso: false,
      mensagem: error.message || 'Erro ao extrair dados do subreddit do Reddit.'
    };
  }
};

/**
 * Extrai dados de um post específico do Reddit
 * @param {string} postUrl - URL do post do Reddit
 * @returns {Promise<Object>} - Dados do post
 */
export const extrairDadosPost = async (postUrl) => {
  try {
    // Verificar se a URL é válida
    if (!postUrl.includes('/comments/')) {
      throw new Error('URL de post inválida. Forneça uma URL válida do Reddit.');
    }
    
    // Construir URL da API do Reddit (JSON)
    const apiUrl = `${postUrl}.json`;
    
    // Fazer requisição para a API do Reddit
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.data || !response.data[0] || !response.data[0].data || !response.data[0].data.children || !response.data[0].data.children[0]) {
      throw new Error('Não foi possível obter os dados do post.');
    }
    
    const postData = response.data[0].data.children[0].data;
    
    // Formatar dados do post
    const post = {
      id: postData.id,
      link: `https://www.reddit.com${postData.permalink}`,
      premissa: postData.selftext,
      descricaoBreve: postData.selftext.substring(0, 150) + (postData.selftext.length > 150 ? '...' : ''),
      titulo: postData.title,
      autor: postData.author,
      subreddit: postData.subreddit,
      metadados: {
        data: new Date(postData.created_utc * 1000).toISOString(),
        likes: postData.ups,
        comentarios: postData.num_comments,
        ratio: postData.upvote_ratio
      },
      thumbnail: postData.thumbnail && postData.thumbnail !== 'self' ? postData.thumbnail : null,
      imagem: postData.url && (postData.url.endsWith('.jpg') || postData.url.endsWith('.png')) ? postData.url : null
    };
    
    return {
      sucesso: true,
      post
    };
  } catch (error) {
    console.error('Erro ao extrair dados do post do Reddit:', error);
    return {
      sucesso: false,
      mensagem: error.message || 'Erro ao extrair dados do post do Reddit.'
    };
  }
};

export default {
  extrairDadosSubreddit,
  extrairDadosPost
};
