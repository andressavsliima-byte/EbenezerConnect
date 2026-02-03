#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[dev] Subindo MongoDB..."
docker compose up -d mongodb

# Ajuste conforme seu ambiente, esta URI é compatível com o docker-compose local
export MONGODB_URI="mongodb://admin:admin123@localhost:27017/ebenezer-connect?authSource=admin"
export PORT=5000
export JWT_SECRET="sua_chave_secreta_muito_segura_aqui"
export VITE_PORT=3000

echo "[dev] Garantindo admin ativo..."
npm --prefix backend run ensure:admin || true

echo "[dev] Iniciando backend (porta $PORT)..."
npm --prefix backend run dev &
BACK_PID=$!

cleanup() {
  echo "\n[dev] Encerrando..."
  kill $BACK_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "[dev] Iniciando frontend (Vite) na porta $VITE_PORT..."
cd "$ROOT_DIR/frontend"
npm run dev
