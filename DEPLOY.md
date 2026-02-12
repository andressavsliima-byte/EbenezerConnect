# Deploy rápido (Vercel + Render)

## Backend (Render)
1) Conecte o repositório no Render e escolha "New Web Service".
2) Root: `backend`
3) Build Command: `npm install`
4) Start Command: `npm start` (Render injeta a variável `PORT`).
5) Environment: Node
6) Variáveis de ambiente (exemplos, ajuste para sua conta):
   - `MONGODB_URI`: string de conexão Mongo Atlas ou outro Mongo.
   - `JWT_SECRET`: chave forte (32+ chars).
   - `UPLOAD_DIR`: `/tmp/uploads` (opcional, já default).
   - `MAX_UPLOAD_SIZE`: `20000000` (opcional, 20 MB).
   - (Recomendado) Cloudinary: configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (ou `CLOUDINARY_URL`) para persistir imagens.
7) Deploy e guarde a URL, ex: `https://seu-backend.onrender.com`.

### Variáveis prontas para copiar (Render)

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/ebenezer-connect?retryWrites=true&w=majority
JWT_SECRET=COLOQUE_UMA_CHAVE_FORTE_COM_32_OU_MAIS_CARACTERES
MAX_UPLOAD_SIZE=20000000
UPLOAD_DIR=/tmp/uploads

# Cloudinary (recomendado para persistir imagens)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
# opcional em vez das 3 linhas acima:
# CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

## Frontend (Vercel)
1) Em `frontend/.env.production` defina:
   - `VITE_API_URL=https://seu-backend.onrender.com`
2) No dashboard da Vercel: New Project → Import GitHub → Root `frontend`.
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Framework: Vite
   - Environment Variables (Production/Preview): mesma `VITE_API_URL`.
3) Deploy. Teste no domínio `.vercel.app`.

### Variáveis prontas para copiar (Vercel)

```env
VITE_API_URL=https://seu-backend.onrender.com/api
```

## Testes locais
- Backend: `cd backend && npm install && npm start:workspace` (usa Mongo local de exemplo) ou configure `MONGODB_URI` e rode `npm start`.
- Frontend: `cd frontend && npm install && npm run dev -- --host --port 3000`.
- Build frontend: `npm run build` e preview: `npm run preview -- --host --port 3000`.

## Arquivos úteis
- `render.yaml`: blueprint para Render (já com comandos e vars). O Render usa esse arquivo se você quiser blueprint deploy.
- `frontend/.env.production.example`: modelo para a Vercel; copie para `.env.production` com sua URL de backend.

## CORS
- O backend está com `origin: '*'` no CORS. Se quiser restringir, ajuste para o domínio da Vercel.

## Logs e saúde
- Endpoint de saúde: `GET /api/health`
- Uploads: usa Cloudinary quando configurado; sem Cloudinary faz fallback para `/uploads` (armazenados em `UPLOAD_DIR`, default `/tmp/uploads` em produção)
