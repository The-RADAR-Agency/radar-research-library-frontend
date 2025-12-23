export async function getDefaultCardImage(seed: string): Promise<string> {
  // Deterministic “editorial gradient” SVG, no external deps.
  const hash = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const a = (hash * 37) % 360;
  const b = (hash * 91) % 360;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${a} 70% 55%)" stop-opacity="1"/>
        <stop offset="100%" stop-color="hsl(${b} 70% 55%)" stop-opacity="1"/>
      </linearGradient>
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.12"/>
        </feComponentTransfer>
      </filter>
    </defs>
    <rect width="1200" height="600" fill="url(#g)"/>
    <rect width="1200" height="600" filter="url(#n)"/>
  </svg>`.trim();

  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  return `data:image/svg+xml,${encoded}`;
}
