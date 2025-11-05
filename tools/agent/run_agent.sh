#!/usr/bin/env bash
set -euo pipefail
TASK=${1:-bootstrap}
echo "Running agent task: $TASK"
case "$TASK" in
  bootstrap)
    echo "Bootstrap task: Setting up environment..."
    cp -n .env.example .env || true
    pnpm install
    echo "✓ Dependencies installed"
    echo "To start services: make up"
    echo "To run migrations: make migrate"
    echo "To run tests: make test"
    ;;
  *)
    echo "No direct runner for $TASK. Implement your agent to read tasks/*.yaml"
    exit 2
    ;;
esac
