SHELL := /bin/bash

.PHONY: up down logs api web db test e2e seed migrate codegen agent hr-sim

up:
	docker compose up -d --build

down:
	docker compose down -v

logs:
	docker compose logs -f

db:
	pnpm db:reset

migrate:
	pnpm db:migrate

codegen:
	pnpm codegen

test:
	pnpm test

e2e:
	pnpm e2e

hr-sim:
	cd tools/hr-sim && pnpm install && pnpm start

agent:
	bash tools/agent/run_agent.sh
