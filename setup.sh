#!/usr/bin/env bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Saha-Care Project Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ── 1. Check prerequisites ────────────────────────────────────────

info "Checking prerequisites..."

# Node.js
if ! command -v node &>/dev/null; then
  fail "Node.js is not installed. Install it from https://nodejs.org (v20.x recommended)"
fi
NODE_VERSION=$(node -v)
ok "Node.js ${NODE_VERSION}"
if [[ ! "$NODE_VERSION" =~ ^v20\. ]]; then
  warn "Cloud Functions require Node 20. Current: ${NODE_VERSION}"
  warn "Consider using nvm: nvm install 20 && nvm use 20"
fi

# npm
if ! command -v npm &>/dev/null; then
  fail "npm is not installed."
fi
ok "npm $(npm -v)"

# Firebase CLI
if ! command -v firebase &>/dev/null; then
  warn "Firebase CLI not found. Install it with: npm install -g firebase-tools"
  warn "You'll need it to run emulators and deploy."
else
  ok "Firebase CLI $(firebase --version)"
fi

echo ""

# ── 2. Install root dependencies ──────────────────────────────────

info "Installing root dependencies..."
npm install
ok "Root dependencies installed"

echo ""

# ── 3. Install and build Cloud Functions ──────────────────────────

info "Installing Cloud Functions dependencies..."
(cd functions && npm install)
ok "Cloud Functions dependencies installed"

info "Building Cloud Functions..."
(cd functions && npm run build)
ok "Cloud Functions built"

echo ""

# ── 4. Environment file ──────────────────────────────────────────

if [ ! -f .env.local ]; then
  warn "No .env.local found — creating from .env.example"
  cp .env.example .env.local
  warn "Edit .env.local with your Firebase project credentials before running the app."
else
  ok ".env.local exists"
fi

echo ""

# ── 5. Generate PWA icons ────────────────────────────────────────

info "Generating PWA icons..."
npm run generate:icons
ok "PWA icons generated"

echo ""

# ── Done ─────────────────────────────────────────────────────────

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  Next steps:"
echo "    1. Ensure .env.local has your Firebase credentials"
echo "    2. Run the app:  ./run.sh"
echo "    3. Seed data:    ./run.sh seed"
echo "    4. Run tests:    ./run.sh test"
echo ""
