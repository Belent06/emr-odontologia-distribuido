FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY nx.json ./
COPY apps/emr-frontend ./apps/emr-frontend
COPY libs ./libs

RUN npm ci --legacy-peer-deps
RUN npx nx build emr-frontend --prod

FROM nginx:alpine AS production

COPY --from=builder /app/dist/apps/emr-frontend /usr/share/nginx/html
COPY apps/emr-frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]