# Configuração para implantação no Render

Este repositório contém o backend para o Site de Extração de Dados, que fornece APIs para extração de descrições/premissas do YouTube, Reddit e TikTok.

## Implantação

O backend está configurado para implantação na plataforma Render usando o arquivo `render.yaml`.

### Pré-requisitos

- Conta no [Render](https://render.com/)
- Repositório Git com o código do backend

### Passos para implantação

1. Faça login na sua conta do Render
2. Vá para o Dashboard e clique em "New" > "Blueprint"
3. Conecte seu repositório Git
4. O Render detectará automaticamente o arquivo `render.yaml` e configurará os serviços
5. Revise as configurações e clique em "Apply"

### Variáveis de ambiente

As seguintes variáveis de ambiente precisam ser configuradas no Render:

- `YOUTUBE_API_KEY`: Chave de API do YouTube
- `REDDIT_CLIENT_ID`: ID do cliente Reddit (opcional)
- `REDDIT_CLIENT_SECRET`: Segredo do cliente Reddit (opcional)
- `CORS_ORIGIN`: URL do frontend (https://fuoejkrq.manus.space)

## Estrutura do Backend

- `app.js`: Ponto de entrada da aplicação
- `config/`: Configurações do banco de dados e outras configurações
- `controllers/`: Controladores para manipulação de requisições
- `models/`: Modelos de dados para MongoDB
- `routes/`: Rotas da API
- `services/`: Serviços para extração de dados
  - `youtube/`: Serviço para extração de dados do YouTube
  - `reddit/`: Serviço para extração de dados do Reddit
  - `tiktok/`: Serviço para extração de dados do TikTok
- `utils/`: Utilitários diversos

## Endpoints da API

### YouTube

- `GET /api/youtube/canal?url={url}`: Analisa um canal do YouTube
- `GET /api/youtube/video?url={url}`: Extrai dados de um vídeo específico

### Reddit

- `GET /api/reddit/subreddit?url={url}`: Analisa um subreddit do Reddit
- `GET /api/reddit/post?url={url}`: Extrai dados de um post específico

### TikTok

- `GET /api/tiktok/perfil?url={url}`: Analisa um perfil do TikTok
- `GET /api/tiktok/video?url={url}`: Extrai dados de um vídeo específico

### Fontes

- `GET /api/fontes`: Lista todas as fontes cadastradas
- `POST /api/fontes`: Adiciona uma nova fonte
- `DELETE /api/fontes/{id}`: Remove uma fonte

### Premissas

- `GET /api/premissas`: Lista todas as premissas extraídas
- `PATCH /api/premissas/{id}/utilizada`: Marca uma premissa como utilizada/não utilizada
- `PATCH /api/premissas/{id}/nicho`: Atualiza o nicho de uma premissa

### Nichos

- `GET /api/nichos`: Lista todos os nichos cadastrados
- `POST /api/nichos`: Adiciona um novo nicho
