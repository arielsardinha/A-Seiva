/** Mini-radar do visor: o pontinho é o corredor se movendo no mato, rumo ao rio. */
export function Radar() {
  return (
    <svg className="radar" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="radar-varredura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="radar__anel" cx="50" cy="50" r="46" />
      <circle className="radar__anel" cx="50" cy="50" r="30" />
      <circle className="radar__anel" cx="50" cy="50" r="14" />
      <path className="radar__linha" d="M50 4 V96 M4 50 H96" />
      <path className="radar__rio" d="M6 30 C30 38 44 18 70 24 S92 20 96 14" />
      <g className="radar__varredura">
        <path d="M50 50 L50 4 A46 46 0 0 1 82.5 17.5 Z" fill="url(#radar-varredura)" />
      </g>
      <circle className="radar__alvo" cx="50" cy="50" r="4" />
    </svg>
  )
}
