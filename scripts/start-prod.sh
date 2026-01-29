#!/usr/bin/env bash
set -euo pipefail

echo "[start-prod] Iniciando build + backend em modo produção" 
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR/frontend"

if [ ! -d node_modules ]; then
  echo "[start-prod] Instalando dependências frontend" 
  npm install --no-audit --no-fund
fi

echo "[start-prod] Build frontend"
npm run build

cd "$ROOT_DIR/backend"
if [ ! -d node_modules ]; then
  echo "[start-prod] Instalando dependências backend" 
  npm install --no-audit --no-fund
fi

export NODE_ENV=production
export PORT=5000
export MONGODB_URI="mongodb://admin:admin123@localhost:27017/ebenezer-connect?authSource=admin"

echo "[start-prod] Subindo MongoDB..."
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d mongodb

echo "[start-prod] Garantindo admin ativo..."
npm run ensure:admin || true

echo "[start-prod] Iniciando backend na porta $PORT"
npm run start
