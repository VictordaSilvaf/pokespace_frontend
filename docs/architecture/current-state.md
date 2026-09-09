# PokeSpace frontend — Current State

> **World Engine SoT:** [`pokespace_backend/docs/architecture/current-state.md`](../../../pokespace_backend/docs/architecture/current-state.md)  
> This repo is the **web client + offline import tools**. Do not grow a second world runtime.

---

## Stack

- TanStack Start + Vite 8 + Nitro (port **3001**)
- React 19, Tailwind 4, Paraglide i18n, Sentry
- Dev proxy `/api/v1` → Nest (`API_URL`, default `:3000`); SSR via `src/lib/server/proxy.ts`
- `socket.io-client` for Nest `/world` (optional `VITE_WS_URL`)

## Features

| Feature | Role |
| --- | --- |
| `auth` / `lib/auth` | Session + Nest auth API |
| `characters` | Create/list/select against Nest (`pokespace.activeCharacterId`) |
| `game-data` | Catalog + `PokemonVisual` / creature sheets |
| `game-world` | TMX canvas + `realtime/` Socket.IO |
| `game-hud` / `pokedex` | HUD shell |

## Game world (client)

- Prefers `public/assets/world/maps/starter.tmx` (PokeTibia OTBM crop, 32px)
- Kenney kept only as offline fallback (`starter-kenney.tmx` / sampleMap)
- **Offline:** local WASD + TMX collision
- **Online (auth + character):** server MOVE, remote entities, encounter → battle HUD (`battle.started` / `BATTLE_ACTION`)

## Tools

| Path | Role |
| --- | --- |
| `tools/catalog` | XML → `src/features/game-data/generated/` |
| `tools/client-assets` | DAT/SPR → manifest/PNG (`assets:discover|extract|validate`) |
| `tools/ot-pipeline` | OTBM crop + `ot:world` PokeSpace export + `world:validate` |
| `tools/ot-source` | Local `Tibia.dat`/`Tibia.spr` (gitignored) |
| `tools/server-data` | PokeGypt/TFS data dump (not served) |

## Roadmap gaps (FE)

| Phase | Status |
| --- | --- |
| F1–4 client-assets | Done (tools; needs local DAT/SPR for real extract) |
| F5–6 PokemonVisual contract | Done (`pokemon-visual.ts` + export) |
| F13–15 Socket.IO + Lab MVP | Partial (wired; live two-browser QA remaining) |
| F18–19 battle FX | Partial (missile keys on moves; PNG FX when manifest extracted) |

## Pointers

- Backend WS/REST: `pokespace_backend/docs/API_ROUTES.md`
- Battle WS: `pokespace_backend/docs/BATTLE_MODULE.md`
- OT pipeline: `tools/ot-pipeline/README.md`
- Client assets: `tools/client-assets/README.md`
