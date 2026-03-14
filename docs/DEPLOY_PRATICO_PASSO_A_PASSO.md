# 🚀 Deploy Prático - ClimbDelivery.com.br

> **Guia passo a passo para deploy do seu sistema na Hetzner**
> 
> - **Domínio:** climbdelivery.com.br
> - **VM:** 37.27.219.39 (Hetzner)
> - **Infraestrutura:** Docker Swarm + Traefik + Portainer

---

## 📁 Sobre a Estrutura do Projeto

O ClimbDelivery tem **dois repositórios Git separados**:

- 🌐 **Frontend:** https://github.com/pazygor/climb-delivery-app
- 🔧 **Backend:** https://github.com/pazygor/climb-delivery-api

**Estrutura na VM (recomendada):**

```
/opt/
├── 📂 climb-delivery-app/              ← Frontend Angular
│   ├── 📄 Dockerfile
│   ├── 📄 nginx.conf
│   ├── 📄 package.json
│   ├── 📂 src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── ...
│   └── ...
│
└── 📂 climb-delivery-api/              ← Backend NestJS
    ├── 📄 Dockerfile
    ├── 📄 package.json
    ├── 📂 src/
    │   ├── main.ts
    │   ├── app.module.ts
    │   └── ...
    └── 📂 prisma/
        ├── schema.prisma
        └── migrations/
```

**🎯 Estratégia de Deploy:**
- Clonar os **dois repositórios** separadamente na VM
- Manter estrutura separada `/opt/climb-delivery-app/` e `/opt/climb-delivery-api/`
- Build de cada Dockerfile independentemente
- Portainer sobe os containers usando as imagens locais

---

## 📋 PARTE 1: Configurar DNS na Hostinger

### Passo 1.1: Comprar o domínio
1. Acesse [Hostinger](https://www.hostinger.com.br)
2. Compre o domínio: `climbdelivery.com.br`

### Passo 1.2: Configurar os registros DNS
1. No painel da Hostinger, vá em **Domínios → climbdelivery.com.br**
2. Clique em **Gerenciar DNS** ou **DNS Zone**
3. Adicione os seguintes registros:

```
Tipo: A
Nome: @
Valor: 37.27.219.39
TTL: 3600

Tipo: A
Nome: api
Valor: 37.27.219.39
TTL: 3600

Tipo: A
Nome: www
Valor: 37.27.219.39
TTL: 3600
```

**Resultado esperado:**
- `climbdelivery.com.br` → 37.27.219.39
- `api.climbdelivery.com.br` → 37.27.219.39
- `www.climbdelivery.com.br` → 37.27.219.39

> ⏱️ **IMPORTANTE:** A propagação DNS pode levar de 10 minutos a 48 horas.
> Use [whatsmydns.net](https://www.whatsmydns.net) para verificar.

---

## 📋 PARTE 2: Preparar o Código na VM

> **📁 IMPORTANTE - Dois Repositórios Separados:**
> 
> O projeto tem **dois repos Git independentes**:
> - 🌐 Frontend: https://github.com/pazygor/climb-delivery-app
> - 🔧 Backend: https://github.com/pazygor/climb-delivery-api
> 
> **Estrutura na VM:**
> ```
> /opt/
> ├── climb-delivery-app/     ← Frontend (repo 1)
> └── climb-delivery-api/     ← Backend (repo 2)
> ```

### Passo 2.1: Conectar na VM via SSH
```bash
ssh root@37.27.219.39
```

### Passo 2.2: Clonar os dois repositórios

**Método A: Via Git Clone (⭐ RECOMENDADO)**
```bash
# Na VM
cd /opt

# Clonar Frontend
git clone https://github.com/pazygor/climb-delivery-app.git

# Clonar Backend
git clone https://github.com/pazygor/climb-delivery-api.git
```

**Método B: Via SCP (do seu Windows)**
```powershell
# No PowerShell (seu PC)
# Enviar Frontend
scp -r C:\Users\user\Documents\climbcodes\development\climb-delivery root@37.27.219.39:/opt/climb-delivery-app

# Enviar Backend
scp -r C:\Users\user\Documents\climbcodes\development\climb-delivery\climb-delivery-api root@37.27.219.39:/opt/
```

**Método C: Via WinSCP**
1. Baixe [WinSCP](https://winscp.net/)
2. Conecte em 37.27.219.39
3. Crie pasta `/opt/climb-delivery-app/`
4. Arraste conteúdo da pasta local `climb-delivery/` para `/opt/climb-delivery-app/`
5. Crie pasta `/opt/climb-delivery-api/`
6. Arraste conteúdo da pasta local `climb-delivery/climb-delivery-api/` para `/opt/climb-delivery-api/`

### Passo 2.3: Verificar se os arquivos chegaram
```bash
# Verificar Frontend
ls -la /opt/climb-delivery-app
# Deve mostrar: Dockerfile, src/, package.json, nginx.conf, etc.

# Verificar Backend
ls -la /opt/climb-delivery-api
# Deve mostrar: Dockerfile, src/, prisma/, package.json, etc.
```

✅ **Estrutura correta na VM:**
```
/opt/
├── climb-delivery-app/       ← Frontend Angular
│   ├── Dockerfile
│   ├── src/
│   └── ...
└── climb-delivery-api/       ← Backend NestJS
    ├── Dockerfile
    ├── src/
    ├── prisma/
    └── ...
```

### Passo 2.4: Copiar arquivos de configuração

Os arquivos `docker-compose.portainer.yml` e `.env.portainer` estão na raiz do seu projeto local.  
Precisamos enviá-los para a VM:

```bash
# Na VM, criar pasta para configs
mkdir -p /opt/deploy-config
```

```powershell
# Do seu Windows (PowerShell)
scp C:\Users\user\Documents\climbcodes\development\climb-delivery\docker-compose.portainer.yml root@37.27.219.39:/opt/

scp C:\Users\user\Documents\climbcodes\development\climb-delivery\.env.portainer root@37.27.219.39:/opt/
```

**Ou copie manualmente via WinSCP:**
1. Arraste `docker-compose.portainer.yml` para `/opt/`
2. Arraste `.env.portainer` para `/opt/`

✅ **Estrutura final:**
```
/opt/
├── climb-delivery-app/              ← Repo frontend
├── climb-delivery-api/              ← Repo backend
├── docker-compose.portainer.yml     ← Config do Stack
└── .env.portainer                   ← Variáveis (referência)
```

---

---

## 📋 PARTE 3: Configurar Variáveis de Ambiente

### Passo 3.1: Criar arquivo .env.production
```bash
cd /opt/climb-delivery
nano .env.production
```

### Passo 3.2: Colar as seguintes variáveis:
```bash
# === DOMÍNIOS ===
WEB_DOMAIN=climbdelivery.com.br
API_DOMAIN=api.climbdelivery.com.br

# === BANCO DE DADOS ===
MYSQL_ROOT_PASSWORD=SenhaRootSuperSegura123!
MYSQL_DATABASE=climbdelivery
MYSQL_USER=climbdelivery_user
MYSQL_PASSWORD=SenhaMySQLSegura456!

# === BACKEND ===
DATABASE_URL=mysql://climbdelivery_user:SenhaMySQLSegura456!@mysql:3306/climbdelivery
JWT_SECRET=chave-jwt-super-secreta-aqui-mude-isso
JWT_EXPIRATION=7d

# === EMAIL (Configure com suas credenciais) ===
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-app-gmail
MAIL_FROM=noreply@climbdelivery.com.br

# === NODE ===
NODE_ENV=production
PORT=3000

# === FRONTEND ===
API_URL=https://api.climbdelivery.com.br
```

**Salvar:** `Ctrl+O` → Enter → `Ctrl+X`

> 🔑 **IMPORTANTE:** Troque as senhas! Use senhas fortes e diferentes.

---

## 📋 PARTE 4: Build das Imagens Docker

> **🔧 Build Manual (2 comandos):**
> 
> Como temos pastas separadas, vamos fazer build de cada Dockerfile:
> ```bash
> # 1. Build do Backend
> cd /opt/climb-delivery-api
> docker build -t climb-delivery-backend:latest .
> 
> # 2. Build do Frontend  
> cd /opt/climb-delivery-app
> docker build -t climb-delivery-frontend:latest .
> ```
> 
> **💡 Alternativa:** Use o script automatizado `build-separate.sh` (opcional)

### Passo 4.1: Build do Backend
```bash
cd /opt/climb-delivery-api
docker build -t climb-delivery-backend:latest .
```

**Aguarde 3-5 minutos...**

✅ **Sucesso se aparecer:**
```
=> [stage-1 6/6] EXPOSE 3000
=> exporting to image
=> => naming to docker.io/library/climb-delivery-backend:latest
```

### Passo 4.2: Build do Frontend
```bash
cd /opt/climb-delivery-app
docker build -t climb-delivery-frontend:latest .
```

**Aguarde 5-8 minutos...**

✅ **Sucesso se aparecer:**
```
=> [stage-2 3/3] COPY --from=builder /app/dist/climb-delivery/browser /usr/share/nginx/html
=> exporting to image
=> => naming to docker.io/library/climb-delivery-frontend:latest
```

### Passo 4.3: Verificar as imagens criadas
```bash
docker images | grep climb-delivery
```

✅ **Deve mostrar:**
```
climb-delivery-backend    latest    abc123    2 minutes ago     500MB
climb-delivery-frontend   latest    def456    1 minute ago      50MB
```

---

### 🚀 ALTERNATIVA: Script de Build Automatizado

Se preferir usar um script (em vez dos comandos manuais):

```bash
# Copiar script para VM
scp C:\Users\user\Documents\climbcodes\development\climb-delivery\build-separate.sh root@37.27.219.39:/opt/

# Na VM
chmod +x /opt/build-separate.sh
/opt/build-separate.sh
```

O script faz o build dos 2 Dockerfiles automaticamente! ✨

---

## 📋 PARTE 5: Deploy via Portainer

### Passo 5.1: Acessar Portainer
Abra no navegador: `https://SEU_PORTAINER_DOMAIN` (ou IP:9000)

### Passo 5.2: Criar nova Stack
1. No menu, clique em **Stacks**
2. Clique em **+ Add stack**
3. Nome: `climb-delivery`

### Passo 5.3: Colar o docker-compose
1. Escolha **Web editor**
2. Abra o arquivo `docker-compose.portainer.yml` do seu projeto
3. Copie TODO o conteúdo
4. Cole no editor do Portainer

### Passo 5.4: Configurar Environment Variables
Role até **Environment variables** e adicione:

```
WEB_DOMAIN=climbdelivery.com.br
API_DOMAIN=api.climbdelivery.com.br
MYSQL_ROOT_PASSWORD=SenhaRootSuperSegura123!
MYSQL_DATABASE=climbdelivery
MYSQL_USER=climbdelivery_user
MYSQL_PASSWORD=SenhaMySQLSegura456!
DATABASE_URL=mysql://climbdelivery_user:SenhaMySQLSegura456!@mysql:3306/climbdelivery
JWT_SECRET=chave-jwt-super-secreta-aqui-mude-isso
JWT_EXPIRATION=7d
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-app-gmail
MAIL_FROM=noreply@climbdelivery.com.br
NODE_ENV=production
PORT=3000
API_URL=https://api.climbdelivery.com.br
```

> ⚠️ **Use as MESMAS senhas que você configurou no Passo 3.2**

### Passo 5.5: Deploy!
1. Role até o final
2. Clique em **Deploy the stack**
3. Aguarde 1-2 minutos...

✅ **Sucesso:** Containers aparecem como "running" (verde)

---

## 📋 PARTE 6: Executar Migrations do Banco

### Passo 6.1: Verificar o nome do container backend
```bash
docker ps | grep backend
```

Copie o nome do container (ex: `climb-delivery_backend_1`)

### Passo 6.2: Executar migrations
```bash
docker exec climb-delivery_backend_1 npx prisma migrate deploy
```

✅ **Sucesso se aparecer:**
```
✅ All migrations have been successfully applied.
```

### Passo 6.3: (OPCIONAL) Popular banco com dados de teste
```bash
docker exec climb-delivery_backend_1 npx prisma db seed
```

---

## 📋 PARTE 7: Testar o Sistema

### Passo 7.1: Verificar SSL (Traefik)
```bash
# Ver logs do Traefik
docker logs traefik --tail 50

# Procure por linhas como:
# "Generating ACME Certificate for climbdelivery.com.br"
```

> ⏱️ O SSL pode levar 2-5 minutos para ser gerado

### Passo 7.2: Acessar o frontend
Abra no navegador: `https://climbdelivery.com.br`

✅ **Deve carregar:** Tela de login do ClimbDelivery

### Passo 7.3: Testar o backend
Abra: `https://api.climbdelivery.com.br/health`

✅ **Deve retornar:** `{"status":"ok"}`

### Passo 7.4: Fazer login
Use as credenciais padrão:
- **Email:** admin@climbdelivery.com
- **Senha:** 123456

---

## 🔧 Troubleshooting

### ❌ Problema: DNS não resolve
```bash
# Verificar propagação
nslookup climbdelivery.com.br
# Deve retornar: 37.27.219.39
```
**Solução:** Aguarde propagação (até 48h)

### ❌ Problema: SSL não funciona (ERR_SSL_PROTOCOL_ERROR)
```bash
# Ver logs do Traefik
docker logs traefik --tail 100

# Verificar se portas estão abertas
netstat -tulpn | grep -E '80|443'
```
**Solução:** 
- Verifique se DNS está propagado
- Portas 80 e 443 devem estar abertas no firewall
- Aguarde 5 minutos para Traefik gerar certificado

### ❌ Problema: Containers não sobem
```bash
# Ver logs do container específico
docker logs climb-delivery_backend_1 --tail 50
docker logs climb-delivery_frontend_1 --tail 50
docker logs climb-delivery_mysql_1 --tail 50
```
**Solução:** Verifique se as variáveis de ambiente estão corretas

### ❌ Problema: Backend não conecta no MySQL
```bash
# Entrar no container backend
docker exec -it climb-delivery_backend_1 sh

# Testar conexão
nc -zv mysql 3306
# Deve retornar: succeeded!
```
**Solução:** Verifique a variável `DATABASE_URL`

### ❌ Problema: Frontend retorna 404
```bash
# Ver logs do Nginx (frontend)
docker logs climb-delivery_frontend_1 --tail 50
```
**Solução:** Verifique se o build foi feito corretamente

---

## 📊 Verificação Final - Checklist

- [ ] DNS propagado (climbdelivery.com.br → 37.27.219.39)
- [ ] Código copiado para `/opt/climb-delivery`
- [ ] Imagens Docker criadas (`docker images`)
- [ ] Stack "climb-delivery" running no Portainer
- [ ] 3 containers running (mysql, backend, frontend)
- [ ] Migrations executadas
- [ ] SSL funcionando (cadeado verde)
- [ ] Frontend acessível em `https://climbdelivery.com.br`
- [ ] Backend acessível em `https://api.climbdelivery.com.br/health`
- [ ] Login funcionando

---

## 🎯 Resumo dos Comandos Importantes

```bash
# SSH na VM
ssh root@37.27.219.39

# Clonar repositórios (na VM)
cd /opt
git clone https://github.com/pazygor/climb-delivery-app.git
git clone https://github.com/pazygor/climb-delivery-api.git

# Ou enviar código via SCP (do seu PC Windows)
scp -r C:\Users\user\Documents\climbcodes\development\climb-delivery root@37.27.219.39:/opt/climb-delivery-app
scp -r C:\Users\user\Documents\climbcodes\development\climb-delivery\climb-delivery-api root@37.27.219.39:/opt/

# Copiar arquivos de configuração (do seu PC)
scp C:\Users\user\Documents\climbcodes\development\climb-delivery\docker-compose.portainer.yml root@37.27.219.39:/opt/
scp C:\Users\user\Documents\climbcodes\development\climb-delivery\.env.portainer root@37.27.219.39:/opt/

# Build das imagens (na VM)
cd /opt/climb-delivery-api
docker build -t climb-delivery-backend:latest .
cd /opt/climb-delivery-app
docker build -t climb-delivery-frontend:latest .

# Executar migrations (na VM)
docker exec climb-delivery_backend_1 npx prisma migrate deploy

# Atualizar código via Git (na VM)
cd /opt/climb-delivery-app && git pull
cd /opt/climb-delivery-api && git pull

# Ver logs dos containers
docker logs climb-delivery_backend_1 --tail 50
docker logs climb-delivery_frontend_1 --tail 50
docker logs climb-delivery_mysql_1 --tail 50

# Reiniciar stack (Via Portainer UI é mais fácil)

# Ver status
docker ps
docker stats
```

---

## 📞 Próximos Passos Após Deploy

1. **Trocar senhas padrão** no sistema
2. **Configurar backup automático** do MySQL
3. **Monitorar logs** nos primeiros dias
4. **Criar usuários reais** no sistema
5. **Testar fluxo completo** de pedidos

---

## 🎉 Pronto!

Seu sistema está no ar em:
- 🌐 **Frontend:** https://climbdelivery.com.br
- 🔧 **API:** https://api.climbdelivery.com.br
- 🔒 **SSL:** Automático via Let's Encrypt
- 📊 **Monitoramento:** Via Portainer

**Tempo estimado total:** 30-45 minutos (+ tempo de propagação DNS)

---

**Dúvidas?** Consulte os outros guias em `/docs/`
