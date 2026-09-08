# OT → web asset pipeline

Offline scripts that convert Open Tibia / PokeTfs assets into atlas PNG + TMX
files consumed by the React game world. Nothing from this pipeline runs at
runtime in the browser.

## Prerequisites

1. Clone or download [PokeTfs1.7](https://github.com/Strogman/PokeTfs1.7).
2. Copy into `tools/ot-source/` (gitignored):

| File | Source |
| --- | --- |
| `forgotten.otbm` | `Server/data/world/forgotten.otbm` |
| `items.otb` | `Server/data/items/items.otb` |
| `items.xml` | `Server/data/items/items.xml` (or reuse `tools/server-data/items/`) |
| `Tibia.dat` | OTClient `client/data/things/` (not in the GitHub repo) |
| `Tibia.spr` | OTClient `client/data/things/` (not in the GitHub repo) |

`Tibia.dat` / `Tibia.spr` are gitignored upstream under `client/data/things/`.
You must take them from a local client build that matches the server protocol.

## Commands

Recommended first-time flow (smaller atlas):

```bash
# 1. Discover item IDs used on floor 7 (writes tools/ot-pipeline/.cache/used-ids.json)
pnpm ot:map -- --scan

# 2. Extract only those sprites into the atlas
pnpm ot:extract -- --only-used

# 3. Build starter.tmx crop (auto-centered 64×64, or pass --x --y --w --h --z)
pnpm ot:map
```

Or extract everything (larger atlas):

```bash
pnpm ot:extract
pnpm ot:map

# Optional crop overrides
pnpm ot:map -- --x 320 --y 320 --w 64 --h 64 --z 7
```

Outputs land in `public/assets/world/`:

```
tilesets/overworld.png
tilesets/overworld.json
maps/overworld.tsx
maps/starter.tmx
```

## After the first export

Edit maps in **Tiled** against `maps/overworld.tsx`. Do not re-run OTBM
conversion for day-to-day furniture / layout edits.
