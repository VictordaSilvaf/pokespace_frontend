export function CosmicScene() {
  return (
    <div className="cosmic-scene" aria-hidden="true">
      <div className="cosmic-dust" />
      <div className="cosmic-stars" />
      <div className="planet-stage">
        <PokeballPlanet />
      </div>
    </div>
  )
}

function PokeballPlanet() {
  return (
    <svg viewBox="0 0 600 600" role="presentation">
      <defs>
        <radialGradient id="planet-lit" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#fff4ea" stopOpacity="0.55" />
          <stop offset="42%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="planet-shade" cx="70%" cy="72%" r="62%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.18" />
          <stop offset="80%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="292" fill="#f4f7fb" />
      <path d="M8 300a292 292 0 0 1 584 0H8Z" fill="#c1121f" />
      <rect x="8" y="286" width="584" height="28" fill="#16343c" />
      <circle
        cx="300"
        cy="300"
        r="64"
        fill="#f4f7fb"
        stroke="#16343c"
        strokeWidth="18"
      />
      <circle
        cx="300"
        cy="300"
        r="26"
        fill="#f0c14d"
        stroke="#16343c"
        strokeWidth="8"
      />
      <circle cx="300" cy="300" r="292" fill="url(#planet-lit)" />
      <circle cx="300" cy="300" r="292" fill="url(#planet-shade)" />
    </svg>
  )
}
