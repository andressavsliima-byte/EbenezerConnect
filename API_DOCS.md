# Documentação da API

## Base URL
`http://localhost:5000/api`

## Autenticação
Todas as requisições (exceto login/register) devem incluir:
```
Authorization: Bearer <token>
```

---

## 🔐 Autenticação

### Login
```http
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "role": "partner",
    "company": "Empresa XYZ"
  }
}
```

### Register (Admin Only)
```http
POST /users/register
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Novo Usuário",
  "email": "novo@empresa.com",
  "password": "senha123",
  "company": "Empresa ABC",
  "phone": "11999999999",
  "role": "partner"
}
```

---

## 📦 Produtos

### Listar Produtos
```http
GET /products?search=motor&category=Motores&minPrice=100&maxPrice=1000
Authorization: Bearer <token>
```

**Query Parameters:**
- `search` (opcional) - Busca em nome, descrição e marca
- `category` (opcional) - Filtrar por categoria
- `minPrice` (opcional) - Preço mínimo
- `maxPrice` (opcional) - Preço máximo

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Motor Elétrico 1HP",
    "description": "Motor de alta performance",
    "brand": "WEG",
    "price": 450.00,
    "stock": 25,
    "category": "Motores",
    "sku": "MOT-001",
    "image": "https://...",
    "specifications": {
      "Potência": "1 HP",
      "Voltagem": "220V"
    },
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

### Obter Produto por ID
```http
GET /products/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

### Listar Categorias
```http
GET /products/categories
Authorization: Bearer <token>
```

**Response (200):**
```json
["Motores", "Correntes", "Rolamentos", "Polias"]
```

### Criar Produto (Admin Only)
```http
POST /products
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Novo Produto",
  "description": "Descrição do produto",
  "brand": "Marca",
  "price": 99.90,
  "stock": 50,
  "category": "Categoria",
  "sku": "PRD-001",
  "image": "https://...",
  "specifications": {
    "Especificação": "Valor"
  }
}
```

### Atualizar Produto (Admin Only)
```http
PUT /products/507f1f77bcf86cd799439011
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Nome Atualizado",
  "price": 109.90,
  "stock": 45
}
```

### Deletar Produto (Admin Only)
```http
DELETE /products/507f1f77bcf86cd799439011
Authorization: Bearer <admin_token>
```

---

## 🛒 Pedidos

### Criar Pedido
```http
POST /orders
Content-Type: application/json
Authorization: Bearer <partner_token>

{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "price": 450.00,
      "name": "Motor Elétrico",
      "brand": "WEG"
    }
  ],
  "notes": "Entregar na segunda-feira"
}
```

**Response (201):**
```json
{
  "message": "Pedido criado com sucesso",
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "items": [...],
    "totalAmount": 900.00,
    "status": "pending",
    "notes": "Entregar na segunda-feira",
    "createdAt": "2024-01-15T14:20:00Z",
    "updatedAt": "2024-01-15T14:20:00Z"
  }
}
```

### Meus Pedidos
```http
GET /orders/user/my-orders
Authorization: Bearer <partner_token>
```

### Listar Todos os Pedidos (Admin Only)
```http
GET /orders?status=pending
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (opcional) - pending, confirmed, rejected

### Obter Pedido por ID
```http
GET /orders/507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

### Atualizar Status do Pedido (Admin Only)
```http
PUT /orders/507f1f77bcf86cd799439012
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "status": "confirmed",
  "adminNotes": "Pedido confirmado e será enviado amanhã"
}
```

**Status aceitos:** `pending`, `confirmed`, `rejected`

---

## 💬 Mensagens

### Mensagens do Admin
```http
GET /messages
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "senderId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "company": "Empresa XYZ"
    },
    "recipientId": "507f1f77bcf86cd799439010",
    "orderId": "507f1f77bcf86cd799439012",
    "subject": "Nova compra de Empresa XYZ",
    "content": "Uma nova compra foi realizada...",
    "isRead": false,
    "createdAt": "2024-01-15T14:20:00Z"
  }
]
```

### Mensagens do Usuário
```http
GET /messages/user/messages
Authorization: Bearer <partner_token>
```

### Contar Não Lidas
```http
GET /messages/unread/count
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "unreadCount": 3
}
```

### Marcar como Lida
```http
PUT /messages/507f1f77bcf86cd799439013/read
Authorization: Bearer <token>
```

---

## 👥 Usuários

### Listar Usuários (Admin Only)
```http
GET /users
Authorization: Bearer <admin_token>
```

### Obter Usuário
```http
GET /users/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

### Atualizar Usuário
```http
PUT /users/507f1f77bcf86cd799439011
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Nome Atualizado",
  "phone": "11988888888",
  "company": "Empresa Atualizada"
}
```

### Desativar Usuário (Admin Only)
```http
DELETE /users/507f1f77bcf86cd799439011
Authorization: Bearer <admin_token>
```

---

## ⚠️ Tratamento de Erros

### Erro 400 - Bad Request
```json
{
  "message": "Email já cadastrado"
}
```

### Erro 401 - Unauthorized
```json
{
  "message": "Token não fornecido"
}
```

### Erro 403 - Forbidden
```json
{
  "message": "Acesso negado. Apenas administradores."
}
```

### Erro 404 - Not Found
```json
{
  "message": "Produto não encontrado"
}
```

### Erro 500 - Server Error
```json
{
  "message": "Erro ao processar requisição",
  "error": "Detalhes do erro"
}
```

---

## 📊 Exemplos de Fluxo Completo

### 1. Login de Parceiro
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parceiro@empresa.com",
    "password": "partner123"
  }'
```

### 2. Listar Produtos
```bash
curl -X GET 'http://localhost:5000/api/products?category=Motores' \
  -H "Authorization: Bearer <token>"
```

### 3. Criar Pedido
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [{
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 1,
      "price": 450.00,
      "name": "Motor Elétrico",
      "brand": "WEG"
    }],
    "notes": "Entregar segunda"
  }'
```

### 4. Admin Confirma Pedido
```bash
curl -X PUT http://localhost:5000/api/orders/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "status": "confirmed",
    "adminNotes": "Pedido confirmado"
  }'
```

---

**Última atualização:** Janeiro 2024
