FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración del monorepo
COPY package*.json ./
COPY tsconfig.base.json ./
COPY nx.json ./

# Copiar el servicio específico y libs compartidas
COPY apps/api-gateway ./apps/api-gateway
COPY libs ./libs

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Build del servicio
RUN npx nx build api-gateway --prod

# Etapa de producción
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copiar solo lo necesario
COPY --from=builder /app/dist/apps/api-gateway ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main.js"]