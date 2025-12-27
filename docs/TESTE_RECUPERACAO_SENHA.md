# Teste do Fluxo de Recuperação de Senha

## ✅ Implementações Realizadas

### Backend (NestJS)

#### 1. DTOs Criados
- ✅ `forgot-password.dto.ts` - Validação do email para recuperação
- ✅ `reset-password.dto.ts` - Validação do token e nova senha

#### 2. Schema Prisma Atualizado
Adicionados campos na tabela `usuario`:
- `resetToken` - Token único para recuperação
- `resetTokenExpiry` - Data de expiração do token (1 hora)

#### 3. AuthService Backend
Métodos implementados:
- ✅ `forgotPassword()` - Gera token e salva no banco
- ✅ `resetPassword()` - Valida token e atualiza senha

#### 4. AuthController
Rotas criadas:
- ✅ `POST /auth/forgot-password` - Solicita recuperação
- ✅ `POST /auth/reset-password` - Redefine senha

#### 5. Migration
- ✅ Migration `20251227050948_add_reset_password_fields` aplicada

### Frontend (Angular)

#### 1. Rotas Configuradas
No arquivo `auth.routes.ts`:
- ✅ `/login` - Tela de login
- ✅ `/login/forgot-password` - Tela de recuperação
- ✅ `/login/reset-password/:token` - Tela de redefinição

#### 2. AuthService Frontend
- ✅ Métodos `forgotPassword()` e `resetPassword()` agora chamam a API real
- ✅ Tratamento de erros implementado

#### 3. Componentes
- ✅ `ForgotPasswordComponent` - Formulário de recuperação
- ✅ `ResetPasswordComponent` - Formulário de redefinição

## 🧪 Como Testar

### 1. Iniciar o Backend
```bash
cd climb-delivery-api
npm run start:dev
```

### 2. Iniciar o Frontend
```bash
npm start
```

### 3. Fluxo de Teste

#### Passo 1: Solicitar Recuperação
1. Acesse: `http://localhost:4200/login`
2. Clique em "Esqueceu a senha?"
3. Digite um email cadastrado
4. Clique em "Enviar Link de Redefinição"
5. **Verifique o console do backend** - O token será exibido lá

#### Passo 2: Redefinir Senha
1. Copie o token do console
2. Acesse: `http://localhost:4200/login/reset-password/[TOKEN_COPIADO]`
3. Digite a nova senha (mínimo 6 caracteres)
4. Confirme a senha
5. Clique em "Redefinir Senha"

#### Passo 3: Fazer Login com Nova Senha
1. Volte para `/login`
2. Faça login com o email e a nova senha

## 📝 Endpoints da API

### POST /auth/forgot-password
**Body:**
```json
{
  "email": "usuario@email.com"
}
```

**Response (200):**
```json
{
  "message": "Se o email existir em nossa base, você receberá um link de recuperação"
}
```

### POST /auth/reset-password
**Body:**
```json
{
  "token": "token-gerado-pelo-sistema",
  "novaSenha": "novaSenha123"
}
```

**Response (200):**
```json
{
  "message": "Senha redefinida com sucesso"
}
```

**Response (400) - Token inválido/expirado:**
```json
{
  "statusCode": 400,
  "message": "Token inválido ou expirado"
}
```

## ⚠️ Importante

### 1. Envio de Email
Atualmente, o token é exibido no console do backend. Para produção:
- Implementar serviço de email (ex: SendGrid, Nodemailer)
- Enviar link: `${FRONTEND_URL}/login/reset-password/${token}`
- Remover log do console

### 2. Segurança
- ✅ Token expira em 1 hora
- ✅ Token único por solicitação
- ✅ Senha é hasheada com bcrypt
- ✅ Não revela se email existe no banco (segurança)

### 3. Validações
- Email deve ser válido
- Nova senha deve ter mínimo 6 caracteres
- Token é único e expira após uso

## 🔧 Próximas Melhorias

1. **Serviço de Email**
   - Integrar com provedor de email
   - Template HTML para email de recuperação
   - Configurar variáveis de ambiente

2. **UI/UX**
   - Adicionar loading states
   - Melhorar mensagens de feedback
   - Adicionar timer de expiração visual

3. **Segurança**
   - Rate limiting nas rotas de auth
   - Captcha na tela de recuperação
   - Log de tentativas de recuperação

## 📂 Arquivos Modificados

### Backend
- `climb-delivery-api/src/auth/auth.controller.ts`
- `climb-delivery-api/src/auth/auth.service.ts`
- `climb-delivery-api/src/auth/dto/forgot-password.dto.ts` (novo)
- `climb-delivery-api/src/auth/dto/reset-password.dto.ts` (novo)
- `climb-delivery-api/prisma/schema.prisma`
- `climb-delivery-api/prisma/migrations/20251227050948_add_reset_password_fields/` (nova)

### Frontend
- `src/app/core/services/auth.service.ts`
- `src/app/features/auth/auth.routes.ts` (já existia)
- `src/app/features/auth/forgot-password/` (já existia)
- `src/app/features/auth/reset-password/` (já existia)
