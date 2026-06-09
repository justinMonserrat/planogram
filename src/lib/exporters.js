import { toPng } from 'html-to-image'

function triggerDownload(href, filename) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

function slugify(name) {
  return (name || 'rack').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function exportJSON(rack) {
  const payload = { version: 1, exportedAt: new Date().toISOString(), rack }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, `${slugify(rack.name)}.planogram.json`)
  URL.revokeObjectURL(url)
}

export async function exportPNG(node, rack) {
  if (!node) return
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: '#eef1f5',
    cacheBust: true,
  })
  triggerDownload(dataUrl, `${slugify(rack.name)}.png`)
}

export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        const rack = parsed.rack ?? parsed
        if (!rack || !Array.isArray(rack.bays)) {
          throw new Error('Not a valid planogram file (missing bays).')
        }
        resolve(rack)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
