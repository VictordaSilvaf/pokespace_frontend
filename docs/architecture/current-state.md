# PokeSpace frontend — Current State

> **World Engine SoT:** [`pokespace_backend/docs/architecture/current-state.md`](../../../pokespace_backend/docs/architecture/current-state.md)  
> **Game assets SoT:** `./client` + `./server` only (not third-party packs).

---

## Stack

- TanStack Start + Vite 8 + Nitro (port **3001**)
- React 19, Tailwind 4, Paraglide i18n, Sentry
- Dev proxy `/api/v1` → Nest; Socket.IO `/world` via `socket.io-client`

## Official asset sources

| Path | Role |
| --- | --- |
| `client/data/things/` | `things.dat` / `things.spr` / `things.otfi` |
| `server/data/monster/` | Pokémon XML + `monsters.xml` |
| `server/data/items/` | items.xml / items.otb |
| `server/data/world/DarkXPoke.otbm` | World map |

## Tools (converters only)

| Path | Role |
| --- | --- |
| `tools/catalog` | `server/data` → `src/features/game-data/generated/` |
| `tools/client-assets` | DAT/SPR discover + SPR→`public/assets/sprites` |
| `tools/ot-pipeline` | OTBM crop → `starter.tmx` + atlas |

Removed: `tools/server-data`, `tools/ot-source`, padventures/Kenney as SoT.

## Game world

- Default map: `public/assets/world/maps/starter.tmx` (crop of `DarkXPoke.otbm`)
- Pokémon visuals: `dexId` → `lookType` (creature SPR) from catalog
- Note: extended DAT is not fully parsed by `@v0rt4c/dat`; SPR extract uses lookType/itemId ↔ spriteId heuristic until a 10.x DAT reader lands

## Commands

```bash
pnpm catalog:build
pnpm ot:map -- --scan --x 1234 --y 844 --w 96 --h 96 --z 7
pnpm assets:extract:public
# rebuild atlas (see ot-pipeline README) then:
pnpm ot:map -- --x 1234 --y 844 --w 96 --h 96 --z 7
pnpm world:validate
```
