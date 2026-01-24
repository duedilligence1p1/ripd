# RIPD Manager 1pra1

Sistema Full Stack para gestão de Relatórios de Impacto à Proteção de Dados (RIPD), focado no setor de apostas online, baseado no Modelo 2.0 da SGD e na Lei 14.790/2023.

## 🚀 Tecnologias

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express
- **Banco de Dados:** PostgreSQL + Prisma ORM
- **PDF:** PDFKit

## 📋 Funcionalidades

- ✅ Stepper intuitivo com 5 etapas de preenchimento
- ✅ Matriz de riscos com cálculo automático (Impacto x Probabilidade)
- ✅ Sugestão de bases legais LGPD
- ✅ Dashboard com indicador de maturidade
- ✅ Alertas de retenção (COAF/SPA)
- ✅ Geração de PDF formatado

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL (ou conta no Neon.tech)

### Backend

```bash
cd backend
npm install
```

Configure o `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/ripd_db?sslmode=require"
JWT_SECRET="sua-chave-secreta-aqui"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

Inicialize o banco:
```bash
npm run db:generate
npm run db:push
npm run db:init
```

Execute:
```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Configure o `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Execute:
```bash
npm run dev
```

## 🔐 Credenciais de Teste

Após executar `npm run db:init` no backend:

| Usuário | Email | Senha |
|---------|-------|-------|
| Admin | admin@1pra1.com | admin123 |
| Teste | teste@1pra1.com | test123 |

## 📁 Estrutura do Projeto

```
RIPD/
├── backend/
│   ├── prisma/schema.prisma    # Modelos do banco
│   ├── src/
│   │   ├── routes/             # Endpoints da API
│   │   ├── services/           # Lógica de negócio
│   │   └── middleware/         # Autenticação JWT
│   └── scripts/init-db.js      # Seed inicial
│
└── frontend/
    └── src/
        ├── app/                # Páginas Next.js
        ├── components/         # Componentes React
        │   ├── Stepper.tsx
        │   └── Steps/          # Formulários por etapa
        ├── contexts/           # AuthContext
        └── services/api.ts     # Cliente Axios
```

## 📊 Matriz de Riscos

| Valor Crítico | Nível |
|---------------|-------|
| 1-6 | 🟢 Baixo |
| 8-12 | 🟡 Médio |
| 15-19 | 🟠 Alto |
| 20-25 | 🔴 Crítico |

## 🚀 Deploy

### Render (Backend)
1. Conecte ao repositório GitHub
2. Configure variáveis de ambiente
3. Build: `npm install && npm run db:generate`
4. Start: `npm start`

### Vercel (Frontend)
1. Importe do GitHub
2. Configure `NEXT_PUBLIC_API_URL` com URL do Render
3. Deploy automático

---

Desenvolvido para **1pra1** - Compliance em Apostas Online
