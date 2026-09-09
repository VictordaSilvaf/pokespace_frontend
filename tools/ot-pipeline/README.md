# OT → web asset pipeline

Offline scripts that convert Open Tibia / PokeTfs assets into atlas PNG + TMX
files consumed by the React game world. Nothing from this pipeline runs at
runtime in the browser.

## Recommended path (local sprites, no Tibia.dat)

Uses `tools/server-data/world/global_dash.otbm` + `public/assets/sprites/item/`.

```bash
# Saffron House #1 (entry 1065,1021) — crop origin = entry - half size
pnpm ot:map -- --scan --x 1017 --y 973 --w 96 --h 96 --z 7

# Build atlas (uses items.otb server→client mapping + local item PNGs)
pnpm ot:extract:local -- --only-used

# Write public/assets/world/maps/starter.tmx (+ starter-otbm.tmx)
pnpm ot:map -- --x 1017 --y 973 --w 96 --h 96 --z 7
```

Optional: `--otbm path/to/other.otbm` (default is `global_dash.otbm`).

## Classic path (Tibia.dat + Tibia.spr)

1. Copy into `tools/ot-source/` (gitignored):

| File | Source |
| --- | --- |
| `forgotten.otbm` | optional fallback map |
| `items.xml` | or reuse `tools/server-data/items/` |
| `Tibia.dat` | OTClient `client/data/things/` |
| `Tibia.spr` | OTClient `client/data/things/` |

```bash
pnpm ot:extract -- --only-used
pnpm ot:map -- --x 1160 --y 574 --w 96 --h 96 --z 7
```

## Outputs

```
public/assets/world/tilesets/overworld.png
public/assets/world/tilesets/overworld.json
public/assets/world/maps/overworld.tsx
public/assets/world/maps/starter.tmx        # playable default (PokeTibia OTBM crop)
public/assets/world/maps/starter-otbm.tmx   # same crop (pipeline artifact)
public/assets/world/maps/starter-kenney.tmx # Kenney fallback only
```

The game loads `starter.tmx` (PokeTibia). Kenney is used only if the OT map is missing.

Sprite fidelity depends on the extract source: padventures item PNGs may not match
PokeGypt client IDs — prefer real `Tibia.dat` / `Tibia.spr` for correct look.

## After the first export

Edit maps in **Tiled** against `maps/overworld.tsx` (OT).
Do not re-run OTBM conversion for day-to-day furniture / layout edits.
