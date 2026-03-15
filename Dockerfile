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

# Criar diretórios e permissões para usuário nginx não-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx && \
    mkdir -p /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    chown -R nginx:nginx /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp

# Mudar para usuário nginx
USER nginx

# Expor porta
EXPOSE 8080

# Health check - usar 127.0.0.1 ao invés de localhost (problema IPv6)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/health || exit 1

# Comando para rodar nginx
CMD ["nginx", "-g", "daemon off;"]
