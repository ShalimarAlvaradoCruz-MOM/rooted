import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const NS = 'http://www.w3.org/2000/svg'

const LEAF_COLORS = [
  '#2d4a1e', '#3a5c28', '#2a3d1a',
  '#4a6b30', '#354f22', '#263c18',
]

function solve(data) {
  const size = data.length
  const last = size - 4
  let path = 'M' + [data[0], data[1]]
  for (let i = 0; i < size - 2; i += 2) {
    const x0 = i ? data[i - 2] : data[0],    y0 = i ? data[i - 1] : data[1]
    const x1 = data[i],                        y1 = data[i + 1]
    const x2 = data[i + 2],                    y2 = data[i + 3]
    const x3 = i !== last ? data[i + 4] : x2,  y3 = i !== last ? data[i + 5] : y2
    const cp1x = (-x0 + 6 * x1 + x2) / 6,  cp1y = (-y0 + 6 * y1 + y2) / 6
    const cp2x =  (x1 + 6 * x2 - x3) / 6,  cp2y =  (y1 + 6 * y2 - y3) / 6
    path += 'C' + [cp1x, cp1y, cp2x, cp2y, x2, y2]
  }
  return path
}

function makePoints(startX, startY, angleRad, length, spread) {
  const count = Math.floor(length / 5)
  const pts = [{ x: startX, y: startY }]
  const dirX = Math.cos(angleRad)
  const dirY = Math.sin(angleRad)
  for (let i = 1; i <= count; i++) {
    const drift = spread * (Math.random() * 2 - 1) * i * 0.4
    pts.push({
      x: pts[i - 1].x + dirX * 5 + drift,
      y: pts[i - 1].y + dirY * 5 + (Math.random() - 0.45) * 1.5,
    })
  }
  return pts
}

function generateForkAngles(parentAngle, count) {
  if (count === 1) return [parentAngle + (Math.random() * 0.3 - 0.15)]
  if (count === 2) {
    const spread = 0.35 + Math.random() * 0.45
    const bias = Math.random() * 0.15 - 0.075
    return [
      parentAngle - spread * 0.4 + bias,
      parentAngle + spread * 0.6 + bias,
    ]
  }
  if (count === 3) {
    const spread = 0.3 + Math.random() * 0.35
    return [
      parentAngle - spread + Math.random() * 0.1,
      parentAngle + Math.random() * 0.15 - 0.075,
      parentAngle + spread + Math.random() * 0.1,
    ]
  }
  return [parentAngle]
}

function strokeColor(w) {
  if (w > 9)   return '#4a2810'
  if (w > 6)   return '#6b3e1a'
  if (w > 3.5) return '#8c5830'
  if (w > 2)   return '#a06838'
  return '#b07840'
}

function isOnScreen(x, y, W, H, margin = 60) {
  return x >= -margin && x <= W + margin && y >= -margin && y <= H + margin
}

function animatePath(parent, pathD, stroke, strokeW, duration, onUpdate, onComplete) {
  const path = document.createElementNS(NS, 'path')
  path.setAttribute('d', pathD)
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', stroke)
  path.setAttribute('stroke-width', strokeW)
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  parent.appendChild(path)

  const length = path.getTotalLength()
  path.style.strokeDasharray = length
  path.style.strokeDashoffset = length

  const tween = gsap.to(path, {
    strokeDashoffset: 0,
    duration,
    ease: 'power2.inOut',
    onUpdate() { onUpdate?.(tween.progress(), path) },
    onComplete,
  })
  return path
}

// Leaf that visually connects its stem to the branch point
// The stem line goes FROM the branch surface TOWARD the leaf body
// branchAngle tells us which direction the branch is going so we
// can orient the stem perpendicular to it — making it look attached
function makeLeaf(leafLayer, bx, by, branchAngle, side, scale, color) {
  const g = document.createElementNS(NS, 'g')

  // Stem grows perpendicular to branch direction, alternating sides
  // branchAngle is in radians — stem goes 90deg off that
  const stemAngle = branchAngle + side * (Math.PI / 2)
  const stemLen = 8 + Math.random() * 6
  const stemEndX = Math.cos(stemAngle) * stemLen
  const stemEndY = Math.sin(stemAngle) * stemLen

  // Stem line — starts at branch point, grows outward
  const stem = document.createElementNS(NS, 'line')
  stem.setAttribute('x1', '0')
  stem.setAttribute('y1', '0')
  stem.setAttribute('x2', stemEndX.toFixed(2))
  stem.setAttribute('y2', stemEndY.toFixed(2))
  stem.setAttribute('stroke', '#3a2d18')
  stem.setAttribute('stroke-width', '1.2')
  stem.setAttribute('stroke-linecap', 'round')
  g.appendChild(stem)

  // Leaf body — positioned at end of stem
  const leafG = document.createElementNS(NS, 'g')
  leafG.setAttribute('transform', `translate(${stemEndX.toFixed(2)}, ${stemEndY.toFixed(2)}) rotate(${(stemAngle * 180 / Math.PI - 90).toFixed(1)})`)

  const leaf = document.createElementNS(NS, 'path')
  leaf.setAttribute('d', 'M0,0 C5,-2 9,-10 8,-18 C7,-26 1,-30 0,-32 C-1,-30 -7,-26 -8,-18 C-9,-10 -5,-2 0,0z')
  leaf.setAttribute('fill', color)
  leaf.setAttribute('opacity', '0.92')
  leafG.appendChild(leaf)

  // Midrib vein
  const vein = document.createElementNS(NS, 'line')
  vein.setAttribute('x1', '0'); vein.setAttribute('y1', '0')
  vein.setAttribute('x2', '0'); vein.setAttribute('y2', '-28')
  vein.setAttribute('stroke', '#1a2d10')
  vein.setAttribute('stroke-width', '0.6')
  vein.setAttribute('stroke-linecap', 'round')
  vein.setAttribute('opacity', '0.5')
  leafG.appendChild(vein)

  g.appendChild(leafG)
  leafLayer.appendChild(g)

  // Place the whole group at the branch point
  gsap.set(g, { x: bx, y: by, scale: 0, transformOrigin: '0 0' })
  gsap.to(g, {
    scale,
    duration: 0.4 + Math.random() * 0.3,
    ease: 'back.out(2)',
  })
}

function addSway(svgEl) {
  if (!svgEl) return
  svgEl.querySelectorAll('path[stroke]').forEach((path) => {
    gsap.to(path, {
      skewX: (Math.random() - 0.5) * 1.0,
      skewY: (Math.random() - 0.5) * 0.3,
      duration: 2.5 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: Math.random() * 2,
    })
  })
}

function buildBranch({
  branchLayer,
  leafLayer,
  x, y,
  angle,
  length,
  strokeW,
  depth,
  maxDepth,
  W, H,
  totalRef,
  doneRef,
  midpointRef,
  midThreshold,
  onMidpoint,
  onComplete,
}) {
  if (depth > maxDepth || strokeW < 0.3) return

  totalRef.current++

  const spread = 0.8 + depth * 0.3
  const pts = makePoints(x, y, angle, length, spread)
  const coords = []
  pts.forEach(p => coords.push(p.x, p.y))
  const pathD = solve(coords)

  // Only spawn leaves on branches depth 2+ whose start point is on-screen
  const canHaveLeaves = depth >= 2 && isOnScreen(x, y, W, H)
  const leafTotal = canHaveLeaves ? Math.floor(2 + Math.random() * 5) : 0
  let leafsSpawned = 0

  const duration = 0.2 + length * 0.011 + depth * 0.025

  animatePath(
    branchLayer, pathD, strokeColor(strokeW), strokeW, duration,
    function(prog) {
      if (leafTotal === 0) return
      const shouldHave = Math.floor(prog * leafTotal)
      while (leafsSpawned < shouldHave) {
        // Sample the point along pts that matches current draw progress
        const t = 0.15 + (leafsSpawned / Math.max(leafTotal - 1, 1)) * 0.85
        const idx = Math.floor(t * (pts.length - 1))
        const pt = pts[Math.min(idx, pts.length - 1)]

        // Only place leaf if this exact point is on screen
        if (isOnScreen(pt.x, pt.y, W, H, 20)) {
          const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]
          // Alternate sides: +1 = left of branch direction, -1 = right
          const side = leafsSpawned % 2 === 0 ? 1 : -1
          const scale = 0.65 + Math.random() * 0.5
          // Pass the branch angle so the stem can orient perpendicular to it
          makeLeaf(leafLayer, pt.x, pt.y, angle, side, scale, color)
        }
        leafsSpawned++
      }
    },
    function() {
      doneRef.current++

      // Midpoint check only — no completion here to prevent early stop
      if (!midpointRef.current && doneRef.current >= midThreshold) {
        midpointRef.current = true
        onMidpoint?.()
      }

      const endPt = pts[pts.length - 1]

      const numChildren = depth < 2
        ? 2
        : Math.random() < 0.15
        ? 3
        : Math.random() < 0.5
        ? 2
        : 1

      const childLength = length * (0.68 + Math.random() * 0.18)
      const childW = strokeW * (0.62 + Math.random() * 0.12)
      const forkAngles = generateForkAngles(angle, numChildren)

      forkAngles.forEach(forkAngle => {
        buildBranch({
          branchLayer,
          leafLayer,
          x: endPt.x,
          y: endPt.y,
          angle: forkAngle,
          length: childLength,
          strokeW: childW,
          depth: depth + 1,
          maxDepth,
          W, H,
          totalRef,
          doneRef,
          midpointRef,
          midThreshold,
          onMidpoint,
          onComplete,
        })
      })
    }
  )
}

export default function BranchCanvas({ onMidpoint, onComplete }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    const container = containerRef.current
    if (!svg || !container) return

    svg.innerHTML = ''

    const W = container.offsetWidth
    const H = container.offsetHeight

    const branchLayer = document.createElementNS(NS, 'g')
    const leafLayer   = document.createElementNS(NS, 'g')
    svg.appendChild(branchLayer)
    svg.appendChild(leafLayer)

    const totalRef      = { current: 0 }
    const doneRef       = { current: 0 }
    const midpointRef   = { current: false }
    const completeFired = { current: false }

    function handleComplete() {
      if (completeFired.current) return
      completeFired.current = true
      onComplete?.()
      addSway(svg)
    }

    const trunks = [
      { x: 0,     y: 2, angle: 0.08,               length: W * 0.42, strokeW: 14, maxDepth: 9 },
      { x: 2,     y: 0, angle: Math.PI / 2 + 0.06, length: H * 0.35, strokeW: 11, maxDepth: 8 },
      { x: W,     y: 2, angle: Math.PI - 0.08,      length: W * 0.42, strokeW: 14, maxDepth: 9 },
      { x: W - 2, y: 0, angle: Math.PI / 2 - 0.06, length: H * 0.35, strokeW: 11, maxDepth: 8 },
    ]

    trunks.forEach(trunk => {
      buildBranch({
        branchLayer,
        leafLayer,
        x: trunk.x,
        y: trunk.y,
        angle: trunk.angle,
        length: trunk.length,
        strokeW: trunk.strokeW,
        depth: 0,
        maxDepth: trunk.maxDepth,
        W, H,
        totalRef,
        doneRef,
        midpointRef,
        midThreshold: 12,
        onMidpoint,
        onComplete: handleComplete,
      })
    })

    // Midpoint fallback — form fades in after 1.4s regardless
    const midFallback = setTimeout(() => {
      if (!midpointRef.current) {
        midpointRef.current = true
        onMidpoint?.()
      }
    }, 1400)

    // Completion fallback — sway starts after 8s regardless of recursive count
    // This prevents the counter race condition from stopping growth early
    const completeFallback = setTimeout(() => {
      handleComplete()
    }, 8000)

    return () => {
      clearTimeout(midFallback)
      clearTimeout(completeFallback)
      gsap.killTweensOf(svg.querySelectorAll('*'))
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
        xmlns={NS}
      />
    </div>
  )
}