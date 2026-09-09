# Client assets pipeline (Tibia 10.98)

Offline tools that turn a **local** Open Tibia client (`Tibia.dat` + `Tibia.spr`) into a PokeSpace asset manifest and optional PNG extract.

**No automatic download** of proprietary CipSoft / custom client files. You must place them yourself.

## Expected version

- Protocol / client family: **10.98** (PokeGypt / PokéTibia custom client preferred)
- Vanilla 10.98 alone will not match PokeGypt custom item/creature IDs

## Input location

Place files in either:

| Path | Notes |
| --- | --- |
| `tools/ot-source/Tibia.dat` | Shared with `pnpm ot:extract` (gitignored) |
| `tools/ot-source/Tibia.spr` | Same |
| `tools/client-assets/input/` | Optional alternate (`--input` flag) |

Both `input/` and `tools/ot-source/*` are gitignored except keep files.

## Commands

```bash
# Inspect client + write manifests/manifest.json (no PNGs)
pnpm assets:discover

# Same + extract PNGs under output/client-10.98/{items,creatures,effects,missiles}/
pnpm assets:extract

# Validate manifest integrity
pnpm assets:validate
```

Options (after `--`):

- `--input <dir>` — folder containing `Tibia.dat` + `Tibia.spr`
- `--max <n>` — cap things per category (dev smoke)
- `--category items|creatures|effects|missiles|all`

## Output

```text
tools/client-assets/output/
  manifests/manifest.json
  client-10.98/          # only after assets:extract
    items/{id}.png
    creatures/{id}.png
    effects/{id}.png
    missiles/{id}.png
```

`manifest.json` is the contract with backend registry / frontend. Runtime Nest **never** reads `.dat`/`.spr`.

## ID rules

| ID | Meaning |
| --- | --- |
| `thing.id` | Client thing id in DAT (item / looktype / effect / missile) |
| `spriteIds[]` | Indices into SPR |
| `dexId` | Pokémon national dex — **never** equal to spriteId by assumption |

## Validate

`pnpm assets:validate` checks:

- manifest exists and has version
- geometry fields present
- sprite id lists non-empty when required
- no duplicate thing ids within a category
- optional: PNG present for each thing when `--require-png`

## Relation to other tools

- `pnpm ot:extract` — atlas for Tiled overworld (items only)
- `pnpm ot:extract:local` — padventures PNGs (no DAT)
- Backend `pnpm assets:sync` — consumes pack folders / registry JSON, not DAT directly
