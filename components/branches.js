import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const NS = 'http://www.w3.org/2000/svg'

const LEAF_COLORS = [
  '#2d4a1e', '#3a5c28', '#2a3d1a',
  '#4a6b30', '#354f22', '#263c18',
]

// ── Catmull-Rom spline solver ─────────────────────────────────────────────────
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

// ── Point generator — angle in radians, natural random drift ─────────────────
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

// ── Draw a path with stroke-dashoffset animation ──────────────────────────────
function animatePath(parent, pathD, stroke, strokeW, duration, delay, onUpdate, onComplete) {
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
    delay,
    ease: 'power2.inOut',
    onUpdate() { onUpdate?.(tween.progress(), path) },
    onComplete,
  })

  return path
}

// ── Leaf spawner ──────────────────────────────────────────────────────────────
function makeLeaf(leafLayer, x, y, angle, scale, color) {
  const g = document.createElementNS(NS, 'g')

  const stem = document.createElementNS(NS, 'line')
  stem.setAttribute('x1', '0'); stem.setAttribute('y1', '0')
  stem.setAttribute('x2', '0'); stem.setAttribute('y2', '4')
  stem.setAttribute('stroke', '#2a3d18')
  stem.setAttribute('stroke-width', '1')
  stem.setAttribute('stroke-linecap', 'round')
  g.appendChild(stem)

  const leaf = document.createElementNS(NS, 'path')
  leaf.setAttribute('d', 'M0,0 C5,-2 9,-10 8,-18 C7,-26 1,-30 0,-32 C-1,-30 -7,-26 -8,-18 C-9,-10 -5,-2 0,0z')
  leaf.setAttribute('fill', color)
  leaf.setAttribute('opacity', '0.92')
  g.appendChild(leaf)

  const vein = document.createElementNS(NS, 'line')
  vein.setAttribute('x1', '0'); vein.setAttribute('y1', '0')
  vein.setAttribute('x2', '0'); vein.setAttribute('y2', '-28')
  vein.setAttribute('stroke', '#1a2d10')
  vein.setAttribute('stroke-width', '0.6')
  vein.setAttribute('stroke-linecap', 'round')
  vein.setAttribute('opacity', '0.5')
  g.appendChild(vein)

  leafLayer.appendChild(g)
  gsap.set(g, { x, y, rotation: angle, scale: 0, transformOrigin: '0 0' })
  gsap.to(g, {
    scale,
    duration: 0.4 + Math.random() * 0.3,
    ease: 'back.out(2)',
  })
}

// ── Sway ──────────────────────────────────────────────────────────────────────
function addSway(svgEl) {
  const paths = svgEl.querySelectorAll('path')
  paths.forEach((path, i) => {
    gsap.to(path, {
      skewX: (Math.random() - 0.5) * 1.2,
      skewY: (Math.random() - 0.5) * 0.4,
      duration: 2.5 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: Math.random() * 2,
    })
  })
}

// ── Recursive fractal branch builder ─────────────────────────────────────────
// angle in radians. 0 = right, PI/2 = down, PI = left
// strokeW tapers with depth. Stops when strokeW < 0.8 or depth > maxDepth.

function buildBranch({
  branchLayer,
  leafLayer,
  x, y,
  angle,
  length,
  strokeW,
  depth,
  maxDepth,
  side,           // 'left' | 'right' — keeps asymmetry natural
  delay,
  onBranchDone,
  totalRef,
  doneRef,
  midpointRef,
  midThreshold,
  onMidpoint,
  onComplete,
}) {
  if (depth > maxDepth || strokeW < 0.7) {
    onBranchDone?.()
    return
  }

  totalRef.current++

  // Color gets lighter as branches get thinner
  const stroke = strokeW > 9
    ? '#4a2810'
    : strokeW > 6
    ? '#6b3e1a'
    : strokeW > 3.5
    ? '#8c5830'
    : strokeW > 2
    ? '#a06838'
    : '#b07840'

  const spread = 0.8 + depth * 0.3
  const pts = makePoints(x, y, angle, length, spread)
  const coords = []
  pts.forEach(p => coords.push(p.x, p.y))
  const pathD = solve(coords)

  // Leaves only on thinner branches (depth >= 2)
  const leafTotal = depth >= 2 ? Math.floor(2 + Math.random() * 5) : 0
  let leafsSpawned = 0

  const duration = 0.1 + length * 0.011 + depth * 0.025

  animatePath(
    branchLayer, pathD, stroke, strokeW,
    duration, delay,
    function (prog) {
      if (leafTotal === 0) return
      const shouldHave = Math.floor(prog * leafTotal)
      while (leafsSpawned < shouldHave) {
        const t = 0.2 + (leafsSpawned / Math.max(leafTotal - 1, 1)) * 0.8
        const idx = Math.floor(t * (pts.length - 1))
        const pt = pts[Math.min(idx, pts.length - 1)]
        const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]
        const leafSide = leafsSpawned % 2 === 0 ? 1 : -1
        const leafAngle = leafSide * (20 + Math.random() * 45)
        const scale = 0.55 + Math.random() * 0.65
        makeLeaf(leafLayer, pt.x, pt.y, leafAngle, scale, color)
        leafsSpawned++
      }
    },
    function () {
      doneRef.current++

      if (!midpointRef.current && doneRef.current >= midThreshold) {
        midpointRef.current = true
        onMidpoint?.()
      }

      if (doneRef.current >= totalRef.current) {
        onComplete?.()
      }

      // End point of this branch — fork here
      const endPt = pts[pts.length - 1]

      // How many children — varies by depth and randomness
      // Depth 0–1: always 2 children. Deeper: 1 or 2, less often 3.
      const numChildren = depth < 2
        ? 2
        : Math.random() < 0.15
        ? 3
        : Math.random() < 0.5
        ? 2
        : 1

      // Fork angles — irregular, not mirrored
      // Main branch continues roughly in same direction with slight curve
      // Sub-branches fork off at organic angles
      const forkAngles = generateForkAngles(angle, numChildren, side)
      const childDelay = 0.01

      forkAngles.forEach((forkAngle, i) => {
        const childLength = length * (0.62 + Math.random() * 0.2)
        const childW = strokeW * (0.55 + Math.random() * 0.15)

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
          side,
          delay: childDelay * i,
          onBranchDone,
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

// ── Fork angle generator — organic, asymmetric ────────────────────────────────
// Returns array of angles for child branches
function generateForkAngles(parentAngle, count, side) {
  if (count === 1) {
    // Slight curve continuation
    return [parentAngle + (Math.random() * 0.3 - 0.15)]
  }

  if (count === 2) {
    // One continues roughly forward, one forks off to the side
    // The fork direction biases toward hanging down (positive Y)
    const spread = 0.35 + Math.random() * 0.45  // radians between forks
    const bias = Math.random() * 0.15 - 0.075    // slight asymmetry

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

// ── Component ─────────────────────────────────────────────────────────────────
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
    const leafLayer = document.createElementNS(NS, 'g')
    svg.appendChild(branchLayer)
    svg.appendChild(leafLayer)

    // Shared counters across all trees
    const totalRef = { current: 0 }
    const doneRef = { current: 0 }
    const midpointRef = { current: false }
    const completeFired = { current: false }

    // Wrap onComplete to fire only once
    function handleComplete() {
      if (completeFired.current) return
      completeFired.current = true
      onComplete?.()
      addSway(svg)
    }

    // Mid threshold — fire after ~40% of branches done
    // We don't know total upfront (recursive), so we use a time-based fallback too
    const midThreshold = 12

    // ── TRUNK CONFIGS ─────────────────────────────────────────
    // Each entry is a trunk that kicks off a recursive tree.
    // angle: radians. 0=right, PI=left, PI/2=down.
    // Trunks run along top edge then fork downward.

    const trunks = [

      // ── LEFT CORNER ──────────────────────────────────────────
      // Main trunk runs rightward along top edge
      {
        x: 0, y: 2,
        angle: 0.08,              // nearly horizontal, slight downward lean
        length: W * 0.38,         // reaches ~38% across top
        strokeW: 14,
        maxDepth: 6,
        side: 'left',
        delay: 0,
      },
      // Left side trunk runs downward along left edge
      {
        x: 2, y: 0,
        angle: Math.PI / 2 + 0.06, // nearly straight down, slight inward lean
        length: H * 0.32,
        strokeW: 11,
        maxDepth: 5,
        side: 'left',
        delay: 0.1,
      },

      // ── RIGHT CORNER ─────────────────────────────────────────
      // Main trunk runs leftward along top edge
      {
        x: W, y: 2,
        angle: Math.PI - 0.08,   // nearly horizontal leftward
        length: W * 0.38,
        strokeW: 14,
        maxDepth: 6,
        side: 'right',
        delay: 0,
      },
      // Right side trunk runs downward along right edge
      {
        x: W - 2, y: 0,
        angle: Math.PI / 2 - 0.06, // nearly straight down, slight inward lean
        length: H * 0.32,
        strokeW: 11,
        maxDepth: 5,
        side: 'right',
        delay: 0.1,
      },
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
        side: trunk.side,
        delay: trunk.delay,
        totalRef,
        doneRef,
        midpointRef,
        midThreshold,
        onMidpoint,
        onComplete: handleComplete,
      })
    })

    // Time-based midpoint fallback — in case recursive count is slow to accumulate
    const midFallback = setTimeout(() => {
      if (!midpointRef.current) {
        midpointRef.current = true
        onMidpoint?.()
      }
    }, 1400)

    return () => {
      clearTimeout(midFallback)
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