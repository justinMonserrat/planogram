import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

const ZOOM_MIN = 0.12
const ZOOM_MAX = 2
const ZOOM_STEP = 0.1
const VIEWPORT_PAD = 32

function clampZoom(value) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value))
}

const RackViewport = forwardRef(function RackViewport({ children }, ref) {
  const scrollRef = useRef(null)
  const innerRef = useRef(null)
  const zoomRef = useRef(1)
  const [zoom, setZoom] = useState(1)
  const [contentSize, setContentSize] = useState({ w: 0, h: 0 })

  const setZoomSafe = useCallback((value) => {
    const next = typeof value === 'function' ? value(zoomRef.current) : value
    zoomRef.current = next
    setZoom(next)
  }, [])

  const measure = useCallback(() => {
    const inner = innerRef.current
    if (!inner) return
    setContentSize({ w: inner.scrollWidth, h: inner.scrollHeight })
  }, [])

  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [measure])

  const fitWidth = useCallback(() => {
    const scroll = scrollRef.current
    const inner = innerRef.current
    if (!scroll || !inner) return
    const scale = (scroll.clientWidth - VIEWPORT_PAD) / inner.scrollWidth
    setZoomSafe(clampZoom(scale))
  }, [setZoomSafe])

  const fitAll = useCallback(() => {
    const scroll = scrollRef.current
    const inner = innerRef.current
    if (!scroll || !inner) return
    const scaleX = (scroll.clientWidth - VIEWPORT_PAD) / inner.scrollWidth
    const scaleY = (scroll.clientHeight - VIEWPORT_PAD) / inner.scrollHeight
    setZoomSafe(clampZoom(Math.min(scaleX, scaleY)))
  }, [setZoomSafe])

  const zoomIn = useCallback(() => {
    setZoomSafe((z) => clampZoom(Number((z + ZOOM_STEP).toFixed(2))))
  }, [setZoomSafe])

  const zoomOut = useCallback(() => {
    setZoomSafe((z) => clampZoom(Number((z - ZOOM_STEP).toFixed(2))))
  }, [setZoomSafe])

  const resetZoom = useCallback(() => setZoomSafe(1), [setZoomSafe])

  useImperativeHandle(ref, () => ({
    async withNativeZoom(fn) {
      const prev = zoomRef.current
      setZoomSafe(1)
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      try {
        await fn()
      } finally {
        setZoomSafe(prev)
      }
    },
  }))

  useEffect(() => {
    const scroll = scrollRef.current
    if (!scroll) return

    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      setZoomSafe((z) => clampZoom(Number((z + delta).toFixed(2))))
    }

    scroll.addEventListener('wheel', onWheel, { passive: false })
    return () => scroll.removeEventListener('wheel', onWheel)
  }, [setZoomSafe])

  const zoomPct = Math.round(zoom * 100)

  return (
    <div className="rack-viewport">
      <div className="rack-viewport__toolbar" aria-label="Planogram zoom controls">
        <div className="rack-viewport__group">
          <button
            type="button"
            className="btn btn--small btn--icon"
            onClick={zoomOut}
            disabled={zoom <= ZOOM_MIN}
            title="Zoom out"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            className="btn btn--small rack-viewport__zoom-label"
            onClick={resetZoom}
            title="Reset to 100%"
          >
            {zoomPct}%
          </button>
          <button
            type="button"
            className="btn btn--small btn--icon"
            onClick={zoomIn}
            disabled={zoom >= ZOOM_MAX}
            title="Zoom in"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>

        <div className="rack-viewport__group">
          <button type="button" className="btn btn--small" onClick={fitWidth} title="Fit planogram to viewport width">
            Fit width
          </button>
          <button type="button" className="btn btn--small" onClick={fitAll} title="Fit entire planogram in view">
            Fit all
          </button>
          <button type="button" className="btn btn--small" onClick={resetZoom} title="Actual size (100%)">
            100%
          </button>
        </div>

        <span className="rack-viewport__hint">Ctrl + scroll to zoom</span>
      </div>

      <div className="rack-viewport__scroll" ref={scrollRef}>
        <div
          className="rack-viewport__sizer"
          style={{
            width: contentSize.w ? contentSize.w * zoom : undefined,
            height: contentSize.h ? contentSize.h * zoom : undefined,
          }}
        >
          <div
            className="rack-viewport__inner"
            ref={innerRef}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
})

export default RackViewport
