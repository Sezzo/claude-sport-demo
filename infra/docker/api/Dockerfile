FROM node:20-alpine
WORKDIR /app
RUN npm i -g pnpm@9
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY services/api/package.json services/api/
COPY libs/shared-types/package.json* libs/shared-types/ 2>/dev/null || true
COPY prisma/ prisma/
RUN pnpm install --filter @svc/api... --prefer-offline || pnpm install --filter @svc/api...
COPY . .
EXPOSE 8080
CMD ["pnpm","--filter","@svc/api","start"]
