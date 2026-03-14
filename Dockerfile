# ==================================
# BUILD STAGE
# ==================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build do Angular (SSR)
RUN npm run build

# ==================================
# PRODUCTION STAGE
# ==================================
FROM nginx:1.25-alpine

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar build do Angular
COPY --from=builder /app/dist/climb-delivery/browser /usr/share/nginx/html

# Criar usuário nginx não-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Mudar para usuário nginx
USER nginx

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Comando para rodar nginx
CMD ["nginx", "-g", "daemon off;"]
