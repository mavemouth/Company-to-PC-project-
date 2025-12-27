"use client"

type Format = "png" | "jpeg"

function inlineSvgStyles(node: Element) {
  const win = node.ownerDocument?.defaultView
  if (!win) return
  // Inline a subset of computed styles so exported image matches on-screen
  const computed = win.getComputedStyle(node as Element)
  const svgEl = node as SVGElement
  const attrs = [
    "fill",
    "stroke",
    "stroke-width",
    "opacity",
    "font-size",
    "font-family",
    "stroke-dasharray",
    "text-anchor",
  ]
  for (const a of attrs) {
    const v = computed.getPropertyValue(a)
    if (v) svgEl.setAttribute(a, v)
  }
  Array.from(node.children).forEach(inlineSvgStyles)
}

async function svgToImageBlob(svg: SVGSVGElement, format: Format, background = "#ffffff") {
  const { width, height } = svg.getBoundingClientRect()

  const w = Math.max(1, Math.ceil(width))
  const h = Math.max(1, Math.ceil(height))

  // Clone and inline computed styles
  const clone = svg.cloneNode(true) as SVGSVGElement
  inlineSvgStyles(clone)
  clone.setAttribute("width", `${w}`)
  clone.setAttribute("height", `${h}`)

  // Add explicit white background behind chart so grid/axes have proper backdrop
  const bgRect = clone.ownerDocument!.createElementNS("http://www.w3.org/2000/svg", "rect")
  bgRect.setAttribute("x", "0")
  bgRect.setAttribute("y", "0")
  bgRect.setAttribute("width", `${w}`)
  bgRect.setAttribute("height", `${h}`)
  bgRect.setAttribute("fill", background)
  clone.insertBefore(bgRect, clone.firstChild)

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(clone)
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(svgBlob)

  try {
    const img = new Image()
    img.crossOrigin = "anonymous" // prevent canvas taint
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })

    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = background
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0)

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(
        (blob) => resolve(blob),
        format === "png" ? "image/png" : "image/jpeg",
        format === "jpeg" ? 0.95 : undefined,
      ),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function downloadBlob(blob: Blob | null, filename: string) {
  if (!blob) return
  const a = document.createElement("a")
  const url = URL.createObjectURL(blob)
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export async function exportRechartsFromContainer(
  container: HTMLElement,
  opts?: { filename?: string; background?: string; format?: Format },
) {
  const svg = container.querySelector("svg") as SVGSVGElement | null
  if (!svg) return
  const format = opts?.format ?? "png"
  const blob = await svgToImageBlob(svg, format, opts?.background ?? "#ffffff")
  await downloadBlob(blob, opts?.filename ?? `chart.${format}`)
}
