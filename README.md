# Ebenezer Connect - Catálogo de Peças

Uma plataforma profissional de catálogo de peças para empresas parceiras com sistema de autenticação, carrinho de compras e gerenciamento administrativo.

## 🎯 Características Principais

### Para Parceiros:
- ✅ Login seguro com autenticação JWT
- ✅ Catálogo completo de peças com busca avançada
- ✅ Filtros por categoria, preço e busca de texto
- ✅ Carrinho de compras com gestão de quantidade
- ✅ Visualização detalhada de produtos
- ✅ Histórico de pedidos e status
- ✅ Perfil de usuário
- ✅ Sistema de notificações para confirmação de compras

### Para Administradores:
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento completo de produtos (CRUD)
- ✅ Gestão de usuários parceiros
- ✅ Sistema de caixa de mensagens
- ✅ Confirmação ou rejeição de pedidos
- ✅ Visualização de todas as transações

## 🛠️ Stack Tecnológico

**Backend:**
- Node.js com Express
- MongoDB
- JWT para autenticação
- Bcrypt para criptografia de senhas

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Lucide React (ícones)

## 📦 Instalação

### Backend

```bash
cd backend
npm install
```

Criar arquivo `.env` baseado em `.env.example`:
```bash
cp .env.example .env
```

Configurar as variáveis:
```
MONGODB_URI=mongodb://localhost:27017/ebenezer-connect
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
PORT=5000
NODE_ENV=development
```

### Frontend

```bash
cd frontend
npm install
```

## 🚀 Iniciando a Aplicação

### Backend

```bash
cd backend
npm run dev
```

O servidor estará rodando em `http://localhost:5000`

### Frontend

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🌐 Deploy na Vercel

1. Conecte o repositório à Vercel (o arquivo `vercel.json` já está configurado para monorepo: frontend estático e API Express em função serverless).
2. Em *Project Settings → Environment Variables*, configure pelo menos:
  - `MONGODB_URI` (use MongoDB Atlas ou outro cluster acessível pela internet)
  - `JWT_SECRET`
  - `NODE_ENV=production`
  - `UPLOAD_DIR=/tmp/uploads` (ephemeral; para persistir imagens use um bucket externo e adapte os uploads)
  - `MAX_UPLOAD_SIZE` (opcional, em bytes)
  - `FORMULA_WORKBOOK_PATH` (opcional, caminho absoluto para a planilha se precisar sobrescrever a padrão)
3. Deploy: basta clicar em *Deploy*; o build roda `npm run build` no `frontend` e publica o handler da API em `/api`.
4. Observação sobre uploads: o filesystem da Vercel é temporário. Para persistência real, direcione os uploads para S3/Cloudflare R2 ou similar; `UPLOAD_DIR=/tmp/uploads` serve apenas para testes/artefatos temporários.

## 📚 Estrutura do Projeto

```
EbenezerConnect/
├── backend/
│   ├── src/
│   │   ├── models/          # Modelos de dados (User, Product, Order, Message)
│   │   ├── controllers/     # Lógica de negócios
│   │   ├── routes/          # Definição de rotas
│   │   ├── middleware/      # Middlewares (autenticação)
│   │   └── index.js         # Arquivo principal
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/      # Componentes reutilizáveis
    │   ├── pages/          # Páginas da aplicação
    │   ├── styles/         # Estilos CSS
    │   ├── api.js          # Cliente HTTP
    │   ├── App.jsx         # Componente raiz
    │   └── main.jsx        # Entrada da aplicação
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🔐 Autenticação

A autenticação é feita via JWT. O token é armazenado no localStorage do navegador e enviado no header de cada requisição:

```
Authorization: Bearer <token>
```

## 🎨 Cores da Marca

- Verde: `#00A86B` (ebenezer-green)
- Preto: `#1F1F1F` (ebenezer-black)
- Branco: `#FFFFFF` (ebenezer-white)

## 📖 Exemplos de Uso

### Login

**POST** `/api/users/login`

```json
{
  "email": "usuario@empresa.com",
  "password": "senha123"
}
```

### Criar Pedido

**POST** `/api/orders`

```json
{
  "items": [
    {
      "productId": "produto_id",
      "quantity": 2,
      "price": 99.90,
      "name": "Peça ABC",
      "brand": "Marca X"
    }
  ],
  "notes": "Entregar segunda-feira"
}
```

### Buscar Produtos

**GET** `/api/products?search=peça&category=motor&minPrice=10&maxPrice=500`

## 🔄 Fluxo de Compra

1. **Login**: Parceiro faz login com email e senha
2. **Catálogo**: Visualiza produtos disponíveis
3. **Carrinho**: Adiciona produtos ao carrinho
4. **Pedido**: Confirma o pedido com observações
5. **Notificação**: Admin recebe notificação
6. **Confirmação**: Admin confirma ou rejeita a compra
7. **Histórico**: Parceiro vê o status na seção de pedidos

## 🚦 Status de Pedido

- **Pending**: Aguardando confirmação do admin
- **Confirmed**: Pedido confirmado
- **Rejected**: Pedido rejeitado

## 📊 Modelos de Dados

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  company: String,
  role: 'partner' | 'admin',
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```javascript
{
  name: String,
  description: String,
  brand: String,
  price: Number,
  stock: Number,
  category: String,
  image: String (URL),
  specifications: Map,
  sku: String (unique),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number,
    name: String,
    brand: String
  }],
  totalAmount: Number,
  status: 'pending' | 'confirmed' | 'rejected',
  notes: String,
  adminNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  senderId: ObjectId (ref: User),
  recipientId: ObjectId (ref: User),
  orderId: ObjectId (ref: Order),
  subject: String,
  content: String,
  isRead: Boolean,
  createdAt: Date
}
```

## 🤝 Contribuindo

Para contribuir com o projeto, faça um fork e abra uma pull request.

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato com o time de desenvolvimento.

---

**Desenvolvido com ❤️ para Ebenezer Connect**
