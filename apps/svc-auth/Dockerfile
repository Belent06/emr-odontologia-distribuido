# apps/svc-auth/Dockerfile

# 1. IMAGEN BASE (Node.js ligero)
FROM node:18-alpine As development

# 2. DIRECTORIO DE TRABAJO
WORKDIR /usr/src/app

# 3. COPIAR ARCHIVOS DE DEPENDENCIAS (Desde la raíz del monorepo)
# Necesitamos el package.json raíz y el lock file
COPY package*.json ./

# 4. INSTALAR DEPENDENCIAS
RUN npm install

# 5. COPIAR EL RESTO DEL CÓDIGO
COPY . .

# 6. CONSTRUIR EL PROYECTO (Solo svc-auth)
RUN npx nx build svc-auth --prod

# --- ETAPA DE PRODUCCIÓN (Para que la imagen pese poco) ---
FROM node:18-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

# Copiamos solo el compilado (dist) de la etapa anterior
COPY --from=development /usr/src/app/dist/apps/svc-auth ./dist

# 7. COMANDO DE ARRANQUE
CMD ["node", "dist/main"]