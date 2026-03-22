#!/usr/bin/env bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

# ── Preflight checks ─────────────────────────────────────────────

preflight() {
  if [ ! -d node_modules ]; then
    fail "node_modules not found. Run ./setup.sh first."
  fi
  if [ ! -f .env.local ]; then
    warn "No .env.local found. The app may not connect to Firebase."
    warn "Run ./setup.sh or copy .env.example to .env.local"
  fi
}

# ── Commands ──────────────────────────────────────────────────────

cmd_dev() {
  preflight
  echo ""
  info "Starting emulators + dev server..."
  echo ""
  echo -e "  ${CYAN}App:${NC}          http://localhost:5173"
  echo -e "  ${CYAN}Emulator UI:${NC}  http://localhost:4000"
  echo -e "  ${CYAN}Firestore:${NC}    http://localhost:8080"
  echo -e "  ${CYAN}Auth:${NC}         http://localhost:9099"
  echo ""
  npm run dev:emulators
}

cmd_app() {
  preflight
  info "Starting Vite dev server only..."
  echo -e "  ${CYAN}App:${NC}  http://localhost:5173"
  echo ""
  npm run dev
}

cmd_emulators() {
  preflight
  info "Starting Firebase emulators only..."
  echo -e "  ${CYAN}Emulator UI:${NC}  http://localhost:4000"
  echo ""
  npm run emulators
}

cmd_seed() {
  preflight
  info "Seeding case definitions..."
  npm run seed:cases
  echo ""
  info "Seeding sample reports..."
  npm run seed:reports
  echo ""
  echo -e "${GREEN}Seeding complete!${NC}"
}

cmd_test() {
  preflight
  info "Running tests..."
  npm run test:run
}

cmd_build() {
  preflight
  info "Building for production..."
  npm run build
}

cmd_help() {
  echo ""
  echo -e "${BLUE}Saha-Care Run Script${NC}"
  echo ""
  echo "Usage: ./run.sh [command]"
  echo ""
  echo "Commands:"
  echo "  dev        Start emulators + Vite dev server (default)"
  echo "  app        Start only the Vite dev server"
  echo "  emulators  Start only Firebase emulators"
  echo "  seed       Seed case definitions + sample reports to emulator"
  echo "  test       Run tests (single run)"
  echo "  build      Production build"
  echo "  help       Show this help message"
  echo ""
}

# ── Main ──────────────────────────────────────────────────────────

COMMAND="${1:-dev}"

case "$COMMAND" in
  dev)       cmd_dev ;;
  app)       cmd_app ;;
  emulators) cmd_emulators ;;
  seed)      cmd_seed ;;
  test)      cmd_test ;;
  build)     cmd_build ;;
  help|-h|--help) cmd_help ;;
  *)
    echo -e "${RED}Unknown command:${NC} $COMMAND"
    cmd_help
    exit 1
    ;;
esac
