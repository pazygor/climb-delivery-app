# 📁 Estruturas de Deploy - ClimbDelivery

## 🎯 Contexto do Projeto

O ClimbDelivery tem **dois repositórios Git separados**:

- 🌐 **Frontend:** https://github.com/pazygor/climb-delivery-app
- 🔧 **Backend:** https://github.com/pazygor/climb-delivery-api

**Localmente (dev):** Você organiza em uma pasta (monorepo)  
**No Git:** São dois repos independentes  
**Na VM (produção):** ⭐ **Recomendado separar** `/opt/climb-delivery-app/` e `/opt/climb-delivery-api/`

---

## 🎯 Duas Opções Disponíveis

### Opção 1️⃣: Estrutura Separada (⭐ RECOMENDADO)

**Estrutura:**
```
/opt/
├── climb-delivery-app/                 ← Frontend (repo 1)
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/                            ← Código Angular
│
└── climb-delivery-api/                 ← Backend (repo 2)
    ├── Dockerfile
    ├── package.json
    ├── src/                            ← Código NestJS
    └── prisma/
```

**✅ Vantagens:**
- Alinhado com a estrutura Git (2 repos)
- `git pull` independente em cada pasta
- Fácil de atualizar só frontend OU só backend
- Mais organizado visualmente
- Deploy seletivo (atualizar apenas um serviço)

**Como clonar:**
```bash
# Na VM
cd /opt
git clone https://github.com/pazygor/climb-delivery-app.git
git clone https://github.com/pazygor/climb-delivery-api.git
```

**Como fazer build:**
```bash
# Backend
cd /opt/climb-delivery-api
docker build -t climb-delivery-backend:latest .

# Frontend
cd /opt/climb-delivery-app
docker build -t climb-delivery-frontend:latest .
```

---

### Opção 2️⃣: Monorepo Local

**Estrutura:**
```
/opt/climb-delivery/                    ← Raiz
├── Dockerfile                          ← Frontend
├── build.sh
├── src/                                ← Angular
└── climb-delivery-api/                 ← Backend (subpasta)
    ├── Dockerfile
    ├── src/                            ← NestJS
    └── prisma/
```

**✅ Vantagens:**
- Espelha sua organização local de dev
- Script `build.sh` pronto

**❌ Desvantagens:**
- Não alinha com estrutura Git (2 repos)
- Precisa fazer `git pull` em 2 lugares mesmo assim
- Mais confuso para atualizar via Git

**Como copiar:**
```powershell
# Do Windows (PowerShell)
scp -r C:\Users\user\Documents\climbcodes\development\climb-delivery root@37.27.219.39:/opt/
```

---

## 🎯 Qual escolher?

| Critério | Separado | Monorepo |
|----------|----------|----------|
| **Facilidade** | ★★★★★ | ★★★ |
| **Alinha com Git** | ✅ 2 repos | ⚠️ Não alinha |
| **Deploy seletivo** | ✅ Sim | ❌ Não |
| **Organização visual** | ★★★★★ | ★★★ |
| **Atualização Git** | ✅ `git pull` independente | ⚠️ 2 pulls mesmo assim |
| **Scripts prontos** | ⚠️ Build manual | ✅ `build.sh` |

---

## 📊 Recomendação Final

### Use **ESTRUTURA SEPARADA** se: (⭐ RECOMENDADO PARA VOCÊ)
- ✅ Você tem **2 repositórios Git separados** (seu caso!)
- ✅ Quer atualizar frontend e backend independentemente
- ✅ Prefere organização clara e alinhada com Git
- ✅ Facilita rollback de apenas um serviço

### Use **MONOREPO** se:
- ✅ Você tem 1 único repositório Git
- ✅ Frontend e backend sempre atualizam juntos
- ✅ Prefere usar scripts automatizados

---

## 🚀 Guia Rápido por Opção

### ⭐ Se escolheu SEPARADO (RECOMENDADO):
1. Siga o guia: [DEPLOY_PRATICO_PASSO_A_PASSO.md](./DEPLOY_PRATICO_PASSO_A_PASSO.md)
2. Clone os 2 repos: 
   ```bash
   git clone https://github.com/pazygor/climb-delivery-app.git
   git clone https://github.com/pazygor/climb-delivery-api.git
   ```
3. Build manual (2 comandos)
4. Estrutura: `/opt/climb-delivery-app/` e `/opt/climb-delivery-api/`

### Se escolheu MONOREPO:
1. Copie a pasta local completa via SCP
2. Use o script: `build.sh`
3. Estrutura: `/opt/climb-delivery/`

---

**💡 Recomendação para produção:** Use **SEPARADO** alinhado com seus 2 repositórios Git! 🎯
