# Pokespace Frontend

Cliente web do **Pokespace** (TanStack Start + Vite + React 19). Roda na porta **3001** e conversa com o NestJS em `pokespace_backend` (porta **3000**).

Fontes oficiais de assets OT: pastas `./client` e `./server` (não use packs de terceiros como SoT).

---

## Pré-requisitos

Instale tudo abaixo **antes** do clone/install:

| Ferramenta | Versão sugerida | Para quê |
| --- | --- | --- |
| **Node.js** | 22+ (LTS) | Runtime |
| **pnpm** | 11.25+ (ver `packageManager` no `package.json`) | Dependências |
| **Git** | 2.x | Clone |
| **Git LFS** | 3.x | Binários grandes (`things.spr`, mapas `.otbm`, sons `.ogg`) |
| **Backend** (opcional no mock) | repo `pokespace_backend` | Auth real + World Engine / Socket.IO |

### Instalar pnpm

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
# ou: npm install -g pnpm@11
```

### Instalar Git LFS

**Linux (Debian/Ubuntu):**

```bash
sudo apt-get update && sudo apt-get install -y git-lfs
git lfs install
```

**macOS:**

```bash
brew install git-lfs
git lfs install
```

**Windows:** baixe o instalador em [git-lfs.com](https://git-lfs.com), depois:

```bash
git lfs install
```

Sem o Git LFS, o clone sobe, mas arquivos como `client/data/things/things.spr` (~145 MB) vêm só como ponteiros de texto e a extração de sprites/mapa quebra.

---

## 1. Clonar o repositório

```bash
git clone https://github.com/VictordaSilvaf/pokespace_frontend.git
cd pokespace_frontend
```

Garanta que os binários LFS baixaram:

```bash
git lfs pull
git lfs ls-files
```

Você deve ver pelo menos:

- `client/data/things/things.spr`
- `server/data/world/DarkXPoke.otbm`
- `client/data/sounds/startup.ogg`

Confira o tamanho real do SPR (deve ser ~145 MB, não uns poucos KB):

```bash
ls -lh client/data/things/things.spr
```

Se o arquivo for minúsculo, rode de novo `git lfs install && git lfs pull`.

---

## 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` conforme o cenário:

| Variável | Onde | Padrão / exemplo | Função |
| --- | --- | --- | --- |
| `API_URL` | server / proxy | `http://localhost:3000` | Origem do Nest (proxy Vite, SSR, health) |
| `VITE_API_URL` | client | *(vazio)* | Base direta da API; deixe vazio para usar o proxy `/api/v1` |
| `VITE_AUTH_MOCK` | client | `false` | `true` = login demo local (qualquer usuário/senha) sem Nest |
| `VITE_WS_URL` | client | *(opcional)* | URL do Socket.IO do world; se vazio, deriva de `VITE_API_URL` / origem |
| `VITE_SENTRY_DSN` | client/server | *(vazio)* | DSN do Sentry |
| `VITE_APP_TITLE` | client | `Pokespace` | Título da app |

### Modo demo (só frontend)

```env
VITE_AUTH_MOCK=true
API_URL=http://localhost:3000
VITE_API_URL=
```

### Com backend local

1. Suba o Nest em `http://localhost:3000` (repo `pokespace_backend`).
2. No frontend:

```env
VITE_AUTH_MOCK=false
API_URL=http://localhost:3000
VITE_API_URL=
```

O Vite faz proxy de `/api/v1` → `API_URL`. Em produção (Vercel), a mesma origem é usada via rota de proxy no server; defina `API_URL` para o backend deployado.

---

## 3. Instalar dependências e rodar

```bash
pnpm install
pnpm dev
```

Abra **http://localhost:3001**.

Outros scripts úteis:

```bash
pnpm build          # build de produção
pnpm start          # sobe o output Nitro (.output)
pnpm preview        # preview Vite
pnpm lint
pnpm check          # Prettier check
pnpm check:i18n     # checagem Paraglide
```

---

## 4. Assets e dados de jogo (já versionados)

No clone completo (com LFS) você já deve ter:

| Caminho | Papel |
| --- | --- |
| `client/data/things/` | `things.dat` / `things.spr` / `things.otfi` |
| `server/data/monster/` | XMLs de Pokémon + `monsters.xml` |
| `server/data/items/` | `items.xml` / `items.otb` |
| `server/data/world/DarkXPoke.otbm` | Mapa mundo |
| `public/assets/world/maps/starter.tmx` | Crop padrão usado pelo runtime |
| `src/features/game-data/generated/` | Catálogo gerado (Pokémon, visuals, etc.) |

Em geral **não precisa regenerar** nada só para rodar o app. Regenerar só se alterar `client/` / `server/` ou quiser outro crop do mapa.

### Pipeline opcional (rebuild)

```bash
# Catálogo a partir de server/data
pnpm catalog:build

# Sprites → public/assets/sprites (heurística lookType/itemId ↔ SPR id)
pnpm assets:extract:public
pnpm assets:validate

# Crop do OTBM → starter.tmx (+ atlas de tiles usados)
pnpm ot:map -- --x 1234 --y 844 --w 96 --h 96 --z 7
pnpm world:validate
```

Detalhes: [`docs/architecture/current-state.md`](docs/architecture/current-state.md).

---

## 5. Backend (World Engine / auth real)

O frontend espera o Nest em `/api/v1` e o namespace Socket.IO de mundo quando o mock está desligado.

Fluxo típico em duas pastas irmãs:

```text
pokespace/
  pokespace_frontend/   # este repo (porta 3001)
  pokespace_backend/    # Nest (porta 3000)
```

1. Clone e suba o backend conforme o README dele.
2. Confirme health em `http://localhost:3000` (ou a rota de health que o backend expõe).
3. No frontend: `VITE_AUTH_MOCK=false` e `API_URL=http://localhost:3000`.
4. `pnpm dev` de novo.

Se o WebSocket não conectar, defina explicitamente, por exemplo:

```env
VITE_WS_URL=http://localhost:3000
```

---

## 6. Produção / Vercel

```bash
pnpm build
pnpm start
```

Na Vercel:

- Framework: TanStack Start / Nitro (detecção automática costuma bastar).
- Defina `API_URL` para a origem do backend deployado.
- `VITE_AUTH_MOCK=false` em produção.
- Opcional: `VITE_SENTRY_DSN`, `VITE_APP_TITLE`, `VITE_WS_URL`.

---

## Estrutura rápida

```text
client/                 # OTClient data (SoT de sprites/things)
server/                 # TFS/PokeAlpha data (monsters, items, world)
public/assets/          # Assets prontos para o browser (map, sprites, tilesets)
src/                    # App TanStack Start
tools/catalog/          # server/data → generated JSON
tools/client-assets/    # DAT/SPR → public
tools/ot-pipeline/      # OTBM → TMX / world export
docs/architecture/      # Estado atual da arquitetura
```

Arquivos grandes versionados via **Git LFS** (ver `.gitattributes`): `*.spr`, `*.otbm`, `*.ogg`.

---

## Troubleshooting

| Problema | O que fazer |
| --- | --- |
| `things.spr` com poucos KB / extract falha | `git lfs install && git lfs pull` |
| Push rejeitado (>100 MB) | Não commite `.spr`/`.otbm` fora do LFS; confira `.gitattributes` |
| Login falha sem backend | `VITE_AUTH_MOCK=true` em `.env.local` |
| API 404 / CORS | Deixe `VITE_API_URL` vazio e use o proxy; confira `API_URL` |
| Porta 3001 ocupada | Pare o outro `pnpm dev` ou mude a porta no script `dev` |
| `pnpm` versão errada | `corepack prepare pnpm@11.25.0 --activate` |
| World socket offline | Backend no ar + `VITE_AUTH_MOCK=false` + `VITE_WS_URL` se necessário |

---

## Auth em resumo

- Proxy local: `/api/v1` → `API_URL` (default `http://localhost:3000`).
- Mock: `VITE_AUTH_MOCK=true` — qualquer trainer/senha no demo.
- Produção: mock off + `API_URL` apontando para o Nest deployado.
