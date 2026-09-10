# Client assets (DAT/SPR)

Offline tools that turn the **local** OTClient under `./client` into a PokeSpace
asset manifest and PNG extract for CDN upload.

## Source (required)

| Path | Role |
| --- | --- |
| `client/data/things/things.dat` | Thing metadata (OTC extended DAT) |
| `client/data/things/things.spr` | Sprite pixels (U32 + alpha) |
| `client/data/things/things.otfi` | Extended DAT/SPR flags |

No automatic download. Also accepts `Tibia.dat` / `Tibia.spr` naming if present.

## DAT reader

`parser/dat/parse-dat.mjs` is a minimal OTC reader aligned with `things.otfi`
(`extended`, `transparency`, U32 sprite ids, flags until `0xFF`). Creature
things are **looktypes** (`thing.id` = lookType).

DarkXPoke DAT id boundaries can still desync on some packs; see public extract
below for how creature PNGs are produced for the Pokédex/CDN.

## Public extract → CDN

```bash
pnpm assets:extract:public
pnpm --dir ../pokespace_backend assets:upload-r2
```

`extract-to-public.mjs` writes `public/assets/sprites/creature/{lookType}.png`:

1. **Primary:** National Dex PNG (PokeAPI) by `dexId` from `pokemon.json`, so
   species art is recognizable (smoke: lookTypes **376** Bulbasaur, **410** Pikachu).
2. **Fallback:** compose outfit frame from DAT lookType → `spriteIds[]` → SPR
   (trainers 510/511 and API misses).
3. **Gate:** abort if creature miss rate exceeds 5% — do not upload garbage.

There is **no** lookType === SPR id heuristic for creatures.

Env (no trailing slash):

- FE: `VITE_ASSETS_BASE_URL=https://assets.pokenaut.victorsf.com`
- Backend: `S3_PUBLIC_BASE_URL=https://assets.pokenaut.victorsf.com`

## Other commands

```bash
pnpm assets:discover
pnpm assets:extract
pnpm assets:validate
pnpm assets:export-visuals
```

Options:

- `--input <dir>` — folder with `things.dat` + `things.spr` (default `client/data/things`)
- `--max <n>` — limit per category (discover/extract)
