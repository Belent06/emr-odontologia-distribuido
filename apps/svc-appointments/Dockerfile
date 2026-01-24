FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY nx.json ./
COPY apps/svc-appointments ./apps/svc-appointments
COPY libs ./libs

RUN npm ci --legacy-peer-deps
RUN npx nx build svc-appointments --prod

FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist/apps/svc-appointments ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main.js"]