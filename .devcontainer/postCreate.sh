#!/usr/bin/env bash
set -e
corepack enable
cp -n .env.example .env || true
pnpm install
