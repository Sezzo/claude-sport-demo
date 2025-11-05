FROM node:20-alpine
WORKDIR /app
RUN npm i -g pnpm@9
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/
RUN pnpm install --filter @app/web... --prefer-offline || pnpm install --filter @app/web...
COPY . .
EXPOSE 3000
CMD ["pnpm","--filter","@app/web","dev"]
