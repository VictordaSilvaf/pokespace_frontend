# OT → web asset pipeline

Offline scripts that convert `./client` + `./server` into atlas PNG + TMX
files for the React game world. Nothing from this pipeline runs at runtime.

## Sources

| Path | Role |
| --- | --- |
| `client/data/things/things.dat` + `things.spr` | Sprites |
| `server/data/world/DarkXPoke.otbm` | World map |
| `server/data/items/items.xml` | Item names |

## Commands

```bash
# Scan crop + write used-ids.json
pnpm ot:map -- --scan --x <originX> --y <originY> --w 96 --h 96 --z 7

# Build overworld atlas from client DAT/SPR (used IDs only)
pnpm ot:extract -- --only-used

# Write starter.tmx (+ starter-otbm.tmx)
pnpm ot:map -- --x <originX> --y <originY> --w 96 --h 96 --z 7

pnpm world:validate
```

Optional: `--otbm path/to/other.otbm` (default `server/data/world/DarkXPoke.otbm`).

## Outputs

```
public/assets/world/tilesets/overworld.png
public/assets/world/tilesets/overworld.json
public/assets/world/maps/overworld.tsx
public/assets/world/maps/starter.tmx
```
