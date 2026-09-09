# Client assets (DAT/SPR)

Offline tools that turn the **local** OTClient under `./client` into a PokeSpace
asset manifest and optional PNG extract.

## Source (required)

| Path | Role |
| --- | --- |
| `client/data/things/things.dat` | Thing metadata |
| `client/data/things/things.spr` | Sprite pixels |
| `client/data/things/things.otfi` | Extended DAT/SPR flags |

No automatic download. Also accepts `Tibia.dat` / `Tibia.spr` naming if present.

## Commands

```bash
pnpm assets:discover
pnpm assets:extract
pnpm assets:validate
pnpm assets:export-visuals
```

Options:

- `--input <dir>` — folder with `things.dat` + `things.spr` (default `client/data/things`)
- `--max <n>` — limit per category (discover/extract)
