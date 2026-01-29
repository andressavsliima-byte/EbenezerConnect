# 🚀 Guia Rápido de Inicialização

## Pré-requisitos
- Node.js (v16 ou superior)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

## Instalação Rápida

### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Editar .env com suas credenciais MongoDB
# MONGODB_URI=mongodb://localhost:27017/ebenezer-connect
# JWT_SECRET=sua_chave_secreta_aqui

# Popular base de dados com dados de teste
npm run seed

# Iniciar servidor em modo desenvolvimento
npm run dev
```

**Credenciais de teste após seed:**
- Admin: `admin@ebenezer.com` / `admin123`
- Parceiro: `parceiro@empresa.com` / `partner123`

### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em: **http://localhost:3000**

## 🔌 Endpoints da API

### Autenticação
- `POST /api/users/login` - Fazer login
- `POST /api/users/register` - Criar novo usuário (admin only)

### Produtos
- `GET /api/products` - Listar produtos com filtros
- `GET /api/products/:id` - Detalhes de um produto
- `GET /api/products/categories` - Listar categorias
- `POST /api/products` - Criar produto (admin only)
- `PUT /api/products/:id` - Atualizar produto (admin only)
- `DELETE /api/products/:id` - Deletar produto (admin only)

### Pedidos
- `POST /api/orders` - Criar novo pedido
- `GET /api/orders/user/my-orders` - Meus pedidos
- `GET /api/orders` - Listar todos os pedidos (admin only)
- `GET /api/orders/:id` - Detalhes de um pedido
- `PUT /api/orders/:id` - Atualizar status (admin only)

### Mensagens
- `GET /api/messages` - Mensagens para admin
- `GET /api/messages/user/messages` - Mensagens do usuário
- `GET /api/messages/unread/count` - Contar não lidas
- `PUT /api/messages/:id/read` - Marcar como lida

### Usuários
- `GET /api/users` - Listar usuários (admin only)
- `GET /api/users/:id` - Detalhes do usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Desativar usuário (admin only)

## 📱 Fluxo de Uso

### Para Parceiros:
1. Login com credenciais
2. Acessar catálogo
3. Buscar/filtrar produtos
4. Adicionar ao carrinho
5. Confirmar pedido
6. Aguardar confirmação do admin
7. Ver histórico de pedidos

### Para Administradores:
1. Login com credenciais admin
2. Acessar dashboard
3. Gerenciar produtos (criar, editar, deletar)
4. Gerenciar usuários parceiros
5. Revisar pedidos pendentes
6. Confirmar ou rejeitar compras
7. Ver mensagens/notificações

## 🎨 Customização de Cores

As cores estão definidas em `frontend/tailwind.config.js`:

```javascript
colors: {
  ebenezer: {
    green: '#00A86B',   // Verde
    black: '#1F1F1F',   // Preto
    white: '#FFFFFF',   // Branco
  }
}
```

## 🐛 Troubleshooting

### MongoDB não conecta
- Verifique se MongoDB está rodando: `mongod`
- Verifique a URI em `.env`
- Para MongoDB Atlas, use string de conexão completa

### Porta já em uso
```bash
# Backend (porta 5000)
lsof -i :5000
kill -9 <PID>

# Frontend (porta 3000)
lsof -i :3000
kill -9 <PID>
```

### Erro de CORS
Verifique se backend está rodando em `http://localhost:5000`

### Token inválido
Limpe localStorage no navegador:
```javascript
localStorage.clear()
```

## 📦 Build para Produção

### Frontend
```bash
cd frontend
npm run build
# Arquivos estáticos em: frontend/dist
```

### Usando Docker
```bash
# Alterar MONGODB_URI em docker-compose.yml
# Construir e iniciar
docker-compose up -d
```

## 📖 Documentação Completa

Veja `README.md` para documentação completa do projeto.

---

Dúvidas? Entre em contato com o time de desenvolvimento!
