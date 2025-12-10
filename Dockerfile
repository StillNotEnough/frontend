# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# Копируем зависимости сначала (кэш)
COPY package.json package-lock.json ./
RUN npm ci

# Копируем код и cобираем билд
COPY . .
RUN npm run build

# Stage 2: Production с Nginx
FROM nginx:1.25-alpine

# Копируем билд
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]