export async function svgToPngBlob(svgElement: SVGSVGElement, scale = 2): Promise<Blob> {
  const serializer = new XMLSerializer()
  let source = serializer.serializeToString(svgElement)
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
  }

  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)

  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = (e) => reject(e instanceof Event ? new Error('SVG image failed to load') : e)
      img.src = svgUrl
    })

    const vb = svgElement.viewBox.baseVal
    const w = vb.width || svgElement.clientWidth || 720
    const h = vb.height || svgElement.clientHeight || 800

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(w * scale)
    canvas.height = Math.round(h * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2D context')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b)
        else reject(new Error('canvas.toBlob returned null'))
      }, 'image/png')
    })
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyBlobToClipboard(blob: Blob): Promise<void> {
  const ClipItem = (window as unknown as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem
  if (!navigator.clipboard || !ClipItem) {
    throw new Error('Clipboard image copy not supported in this browser')
  }
  await navigator.clipboard.write([new ClipItem({ [blob.type]: blob })])
}

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'radar'
  )
}
