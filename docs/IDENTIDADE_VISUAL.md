# Identidade Visual - ClimbCodes

## Paleta de Cores

### Cores Principais

#### Verde ClimbCodes - Principal
- **Hex:** `#91DB24`
- **Uso:** Botões primários, links, destaques, elementos interativos
- **Variante Escura (Hover):** `#7BC41F`

#### Cinza ClimbCodes - Secundário
- **Hex:** `#505050`
- **Uso:** Texto secundário, ícones, elementos de interface não prioritários

#### Branco - Base
- **Hex:** `#FFFFFF`
- **Uso:** Fundo de cards, superfícies principais, texto sobre fundos escuros

---

## Variáveis CSS Globais

Todas as cores estão disponíveis como variáveis CSS em `src/styles.scss`:

```scss
:root {
  // Cores principais da identidade visual
  --primary-color: #91DB24;          // Verde ClimbCodes
  --primary-dark: #7BC41F;           // Verde escuro para hover
  --secondary-color: #505050;        // Cinza ClimbCodes
  --light-bg: #FFFFFF;               // Branco
  
  // Cores de superfície
  --surface-ground: #F8F9FA;         // Fundo claro
  --surface-card: #FFFFFF;           // Cards brancos
  --surface-hover: #F1F3F4;          // Hover sutil
  --surface-border: #E5E7EB;         // Bordas
  
  // Cores de texto
  --text-color: #2D2D2D;             // Texto principal
  --text-color-secondary: #505050;   // Texto secundário
  --text-color-muted: #9CA3AF;       // Texto desabilitado
  --text-on-primary: #FFFFFF;        // Texto sobre verde
  
  // Cores de feedback
  --success-color: #91DB24;
  --error-color: #EF4444;
  --warning-color: #F59E0B;
  --info-color: #3B82F6;
}
```

---

## Aplicação das Cores

### Elementos Interativos

**Botões Primários:**
- Background: `#91DB24`
- Texto: `#FFFFFF`
- Hover: `#7BC41F`

**Links:**
- Normal: `#91DB24`
- Hover: `#7BC41F`

### Layout

**Sidebar:**
- Header: Gradiente de `#505050` para `#2D2D2D` com borda inferior verde `#91DB24`
- Item Ativo: Background `#91DB24` com borda esquerda `#7BC41F`
- Fundo: `#FFFFFF`

**Header:**
- Fundo: `#FFFFFF`
- Borda: `#E5E7EB`
- Avatar: Gradiente verde com borda cinza clara

**Cards:**
- Fundo: `#FFFFFF`
- Borda: `#E5E7EB`
- Hover: Sombra verde suave `rgba(145, 219, 36, 0.15)`

### Textos

**Hierarquia:**
1. Texto Principal: `#2D2D2D` (mais escuro para contraste)
2. Texto Secundário: `#505050` (cinza ClimbCodes)
3. Texto Desabilitado: `#9CA3AF` (cinza claro)
4. Texto sobre Verde: `#FFFFFF`

---

## Backgrounds e Gradientes

### Páginas de Autenticação
```scss
background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
```

### Elementos de Destaque
```scss
background: linear-gradient(135deg, #91DB24 0%, #7BC41F 100%);
```

### Sidebar Header
```scss
background: linear-gradient(135deg, #505050 0%, #2D2D2D 100%);
border-bottom: 3px solid #91DB24;
```

---

## Scrollbars

Todas as scrollbars da aplicação usam o verde ClimbCodes:

```scss
::-webkit-scrollbar-thumb {
  background: #91DB24;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #7BC41F;
}
```

---

## Filosofia de Design

### Site ClimbCodes (climbcodes.com.br)
- **Tom:** Corporativo, profissional
- **Cores:** Tons mais escuros, preto dominante
- **Objetivo:** Transmitir seriedade e expertise

### Plataforma Climb Delivery
- **Tom:** Moderno, clean, acessível
- **Cores:** Verde e branco dominantes, cinza como apoio
- **Objetivo:** Interface clara e intuitiva para operação diária

---

## Componentes Atualizados

### ✅ Arquivos Modificados

1. **`src/styles.scss`** - Variáveis globais e estilos base
2. **`src/app/features/auth/login/login.component.scss`** - Tela de login
3. **`src/app/features/auth/forgot-password/forgot-password.component.scss`** - Recuperação de senha
4. **`src/app/features/auth/reset-password/reset-password.component.scss`** - Redefinir senha
5. **`src/app/layout/sidebar/sidebar.component.scss`** - Sidebar principal
6. **`src/app/layout/header/header.component.scss`** - Header principal
7. **`src/app/features/dashboard/orders/orders.component.scss`** - Tela de pedidos

---

## Próximos Passos

Para garantir consistência completa da identidade visual:

1. ✅ Variáveis CSS globais definidas
2. ✅ Componentes de autenticação atualizados
3. ✅ Layout principal atualizado
4. ✅ Componentes de dashboard iniciados
5. 🔄 Revisar todos os componentes PrimeNG
6. 🔄 Atualizar modais e diálogos
7. 🔄 Verificar responsividade com nova paleta
8. 🔄 Testar contraste e acessibilidade (WCAG)

---

## Dicas para Desenvolvimento

### Usando as Variáveis CSS

```scss
// ✅ Recomendado
.my-component {
  color: var(--primary-color);
  background: var(--surface-card);
}

// ❌ Evitar
.my-component {
  color: #91DB24; // Use a variável!
  background: #FFFFFF; // Use a variável!
}
```

### Efeito Hover Padrão

```scss
.interactive-element {
  background: var(--primary-color);
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--primary-dark);
    box-shadow: 0 4px 12px rgba(145, 219, 36, 0.15);
  }
}
```

### Sombras com Verde

Para elementos que precisam destaque sutil:
```scss
box-shadow: 0 4px 12px rgba(145, 219, 36, 0.15);
```

---

*Última atualização: 27 de dezembro de 2025*
