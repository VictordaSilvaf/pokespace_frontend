import { mapUnits, spriteUrl } from './mock-data'

export function WorldMap() {
  return (
    <div className="game-world absolute inset-0 overflow-hidden" aria-hidden>
      <div className="game-biome game-biome--ocean" />
      <div className="game-biome game-biome--forest" />
      <div className="game-biome game-biome--desert" />
      <div className="game-biome game-biome--snow" />
      <div className="game-world-glow" />

      {mapUnits.map((unit, index) => (
        <div
          key={unit.id}
          className="game-unit"
          style={{
            left: `${unit.x}%`,
            top: `${unit.y}%`,
            animationDelay: `${index * 0.35}s`,
          }}
        >
          <div className="game-unit-hp">
            <span style={{ width: `${unit.hp * 100}%` }} />
          </div>
          <img
            src={spriteUrl(unit.spriteId)}
            alt=""
            className="size-10 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] sm:size-12"
            draggable={false}
          />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-x-0 top-[18%] z-10 flex justify-center px-4">
        <div className="game-brand text-center">
          <p className="game-brand-kicker">Explore · Capture · Grow</p>
          <h1 className="game-brand-title">PokeSpace</h1>
        </div>
      </div>
    </div>
  )
}
