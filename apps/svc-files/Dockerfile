# apps/svc-files/Dockerfile

# --- ETAPA 1: BUILD ---
FROM node:18-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Construimos ESPECÍFICAMENTE svc-files
RUN npx nx build svc-files --prod

# --- ETAPA 2: PRODUCCIÓN ---
FROM node:18-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

# Copiamos el compilado
COPY --from=development /usr/src/app/dist/apps/svc-files ./dist

CMD ["node", "dist/main"]