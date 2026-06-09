// Pick readable text color (black/white) for a given hex background.
export function textOn(hex) {
  const c = hex.replace('#', '')
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  // Perceived luminance
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luma > 0.6 ? '#1a1a1a' : '#ffffff'
}
