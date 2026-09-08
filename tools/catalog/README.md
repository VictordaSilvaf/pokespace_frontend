# Game data catalog

Offline converters that turn declarative OT server XML into JSON consumed by
the React app. Lua scripts are indexed by path only — never executed.

## Source

| Path | Role |
| --- | --- |
| `tools/server-data/` | Full PokeTFS `data/` dump (not served by Vite) |
| `tools/catalog/build-catalog.mjs` | XML → JSON |

## Output

Written to `src/features/game-data/generated/`:

- `pokemon.json` — dex, types, lookType, portraitId, moves, evolutions
- `moves.json` — spell registry from `spells.xml`
- `npcs.json` — name, look, greet/decline
- `meta.json` — generation timestamp and counts

## Command

```bash
pnpm catalog:build
```

Commit the generated JSON so clones work without running the converter.
