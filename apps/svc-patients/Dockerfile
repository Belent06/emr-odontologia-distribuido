# apps/svc-patients/Dockerfile

# --- ETAPA 1: BUILD ---
FROM node:18-alpine As development

WORKDIR /usr/src/app

# Copiamos los package.json de la RAÍZ (Contexto del monorepo)
COPY package*.json ./

# Instalamos todas las dependencias (incluyendo devDependencies para compilar)
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Construimos ESPECÍFICAMENTE svc-patients
# Nx sabe dónde buscarlo y lo dejará en dist/apps/svc-patients
RUN npx nx build svc-patients --prod

# --- ETAPA 2: PRODUCCIÓN (Imagen ligera) ---
FROM node:18-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

# Instalamos solo dependencias necesarias para correr (ahorramos espacio)
RUN npm install --only=production

# Copiamos el compilado desde la etapa anterior
# 👇 OJO AQUÍ: La ruta dist/apps/svc-patients es clave en Nx
COPY --from=development /usr/src/app/dist/apps/svc-patients ./dist

# Comando de arranque
CMD ["node", "dist/main"]