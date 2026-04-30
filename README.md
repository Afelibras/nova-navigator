# Atlas — Indoor Wayfinding System

Sistema de navegação interna ultra-moderno com mapa SVG interativo, rotas otimizadas em tempo real, autenticação e painel administrativo.

## Stack

- **Frontend:** React 19 + TypeScript + TanStack Router + TanStack Start
- **Styling:** TailwindCSS v4 + shadcn/ui + Glassmorphism
- **Build:** Vite 7
- **Deploy:** Cloudflare Workers
- **Backend:** TanStack Server Functions + In-Memory Store
- **Validação:** Zod

## Requisitos

- [Node.js](https://nodejs.org/) >= 20 ou [Bun](https://bun.sh/) >= 1.0

## Instalação

```bash
cd nova-navigator
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O servidor inicia em `http://localhost:3000` (ou porta configurada).

## Build

```bash
npm run build          # produção
npm run build:dev      # desenvolvimento
npm run preview        # preview do build
```

## Deploy

```bash
npm run build          # gera o build de produção
npx wrangler deploy    # deploy no Cloudflare Workers
```

## Rotas da Aplicação

| Rota | Descrição |
|------|-----------|
| `/` | Página principal — mapa interativo com navegação |
| `/auth/login` | Login de usuários |
| `/auth/register` | Registro de novos usuários |
| `/admin` | Painel administrativo (requer role: admin) |

## Credenciais de Demo

```
Email: admin@localiza.com
Senha: admin123
```

## Funcionalidades

### Navegação (Wayfinding)
- Mapa SVG interativo com zoom, pan e seletor de andares (1-6)
- ~200+ POIs (salas, elevadores, escadas, banheiros, entradas, saídas, café)
- Cálculo de rotas otimizadas pelo corredor do edifício
- Rotas multi-andar com troca automática por elevador
- Distância em metros e tempo estimado
- Passos de navegação turn-by-turn
- Ponto de referência mais próximo do destino
- Rotas favoritas (localStorage ou cloud se logado)

### Backend — Server Functions

#### POIs (`src/server/pois.server.ts`)
- `getAllPois()` — lista todos os pontos de interesse
- `getPoiById(id)` — busca POI por ID
- `getPoisByFloor(floor)` — POIs de um andar específico
- `getPoisByType(type)` — filtra por tipo (room, elevator, stairs, etc.)
- `getPoisByFloorAndType(floor, type)` — filtra por andar e tipo
- `searchPois(query)` — busca por nome ou ID
- `createPoiServer(poi, adminToken)` — cria novo POI (admin)
- `updatePoiServer(id, updates, adminToken)` — atualiza POI (admin)
- `deletePoiServer(id, adminToken)` — remove POI (admin)

#### Rotas (`src/server/routing.server.ts`)
- `planRouteServer(originId, destinationId)` — planeja rota otimizada
- `getNearestElevator(poiId)` — encontra elevador mais próximo
- `findNearestPoi(poiId, excludeId?)` — encontra sala mais próxima
- `buildRouteServer(fromId, toId)` — constrói rota simples

#### Autenticação (`src/server/auth.server.ts`)
- `loginServer(email, password)` — autentica usuário
- `registerServer(email, password, name)` — registra novo usuário
- `logoutServer(token)` — encerra sessão
- `getCurrentUser(token)` — dados do usuário logado
- `validateToken(token)` — valida token de sessão

#### Favoritos (`src/server/favorites.server.ts`)
- `getFavorites(userId, token)` — lista favoritos do usuário
- `addFavorite(userId, token, fav)` — salva rota como favorita
- `removeFavoriteServer(id, userId, token)` — remove favorito
- `isFavoriteServer(userId, token, originId, destinationId)` — verifica se é favorito
- `toggleFavorite(userId, token, originId, destinationId, label)` — adiciona ou remove

#### Analytics (`src/server/analytics.server.ts`)
- `trackRouteRequest(userId, originId, destinationId, distance, duration)` — registra uso
- `getPopularRoutes(limit)` — rotas mais usadas
- `getRecentRoutes(limit)` — rotas recentes
- `getStats()` — estatísticas gerais

### Painel Admin (`/admin`)
- Dashboard com stats (POIs, usuários, favoritos, rotas planejadas)
- Top 10 rotas mais populares
- Visualização de andares com contagem de POIs
- Tabela de POIs com filtro por tipo
- CRUD de POIs (criar, editar, deletar)
- Apenas acessível para usuários com role `admin`

### Autenticação
- Login com email e senha
- Registro com nome, email e senha
- Sessões com token e expiração de 7 dias
- Hash de senha simples (substituível por bcrypt em produção)
- Persistência de token no localStorage
- Favoritos sincronizados na nuvem quando logado
- Fallback para localStorage quando não logado

## Arquitetura

```
src/
├── components/
│   ├── ui/                    # 33 componentes shadcn/ui
│   └── wayfinding/            # Componentes do domínio
│       ├── BottomSheet.tsx    # Painel mobile
│       ├── ControlPanel.tsx   # Seleção origem/destino
│       ├── MapCanvas.tsx      # Mapa SVG interativo
│       ├── ReferenceBanner.tsx # Ponto de referência
│       ├── RouteSteps.tsx     # Passos de navegação
│       └── types.ts           # Modelos + algoritmos de rota
├── hooks/
│   ├── use-auth.tsx           # Autenticação
│   ├── use-favorites.tsx      # Favoritos (cloud/local)
│   ├── use-mobile.tsx         # Responsive breakpoint
│   ├── use-pois.tsx           # Busca de POIs
│   └── use-route-plan.tsx     # Planejamento de rotas
├── routes/
│   ├── __root.tsx             # Root layout
│   ├── index.tsx              # Página principal
│   ├── auth/
│   │   ├── login.tsx          # Login
│   │   └── register.tsx       # Registro
│   └── admin/
│       └── index.tsx          # Painel admin
├── server/
│   ├── store.ts               # In-Memory Store
│   ├── pois.server.ts         # Server Functions — POIs
│   ├── routing.server.ts      # Server Functions — Rotas
│   ├── auth.server.ts         # Server Functions — Auth
│   ├── favorites.server.ts    # Server Functions — Favoritos
│   ├── analytics.server.ts    # Server Functions — Analytics
│   └── index.ts               # Barrel export
└── shared/
    └── types.ts               # Tipos + schemas Zod compartilhados
```

## Dados em Memória

O `MemoryStore` (`src/server/store.ts`) persiste dados em memória e inicializa com:

- ~200+ POIs gerados proceduralmente para 6 andares
- 1 usuário admin pré-configurado
- Estruturas vazias para favoritos, sessões e analytics

**Nota:** Em produção, substitua o `MemoryStore` por um banco de dados real (Cloudflare D1, PostgreSQL, etc.) mantendo a mesma interface.

## Algoritmo de Rota

As rotas são calculadas seguindo a rede de corredores do edifício:

1. POI origem → porta do corredor mais próximo
2. Corredor horizontal → corredor vertical (se necessário)
3. Corredor horizontal do destino → porta → POI destino
4. Multi-andar: origem → elevador mais próximo → elevador destino → destino

Velocidade de caminhada: 1.3 m/s | Espera de elevador: 25s | Escalar: 8s/andar

## Licença

MIT
