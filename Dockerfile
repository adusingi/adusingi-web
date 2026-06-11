# --- Build stage ---
FROM node:22-alpine AS build
RUN npm install -g pnpm@10
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# --- Runtime stage ---
FROM node:22-alpine AS runtime
RUN npm install -g pnpm@10
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
COPY server ./server
COPY api ./api
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["pnpm", "exec", "tsx", "server/index.ts"]
