import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'

const LEAF_LINGER_MS = 5 * 60 * 1000
const LEAF_W = 488
const LEAF_H = 334
const STAGGER_MS = 12000       // minimum gap between leaf spawns
const REPLAY_INTERVAL_MS = 30000 // how often completed entries re-queue

function FallingLeaf({ text, prompt, id, onDone }) {
  const leafRef = useRef(null)
  const promptCurveId = `curve_${id}`
  const promptPath = `M 80,160 Q 157,0 345,81`

  useEffect(() => {
    const el = leafRef.current
    if (!el) return

    const vW = window.innerWidth
    const vH = window.innerHeight
    const startX = Math.random() * (vW - LEAF_W)
    const swayAmount = 40 + Math.random() * 60
    const swayDuration = 5 + Math.random() * 4
    const startRotation = -10 + Math.random() * 20
    const endRotation = -20 + Math.random() * 40

    gsap.set(el, {
      x: startX,
      y: -LEAF_H - 20,
      opacity: 0,
      rotation: startRotation,
    })

    const tl = gsap.timeline()

    tl.to(el, { opacity: 1, duration: 2, ease: 'power1.in' })
    tl.to(el, { y: vH + LEAF_H + 20, duration: 30 + Math.random() * 8, ease: 'none' }, 0)
    tl.to(el, { x: startX + swayAmount, duration: swayDuration, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
    tl.to(el, { rotation: endRotation, duration: swayDuration * 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() * 2 }, 0)

    const lingerTimer = setTimeout(() => {
      gsap.to(el, {
        opacity: 0,
        duration: 2.5,
        ease: 'power1.inOut',
        onComplete: () => onDone(id),
      })
    }, LEAF_LINGER_MS)

    return () => {
      clearTimeout(lingerTimer)
      tl.kill()
    }
  }, [])

  return (
    <div
      ref={leafRef}
      className="absolute top-0 left-0"
      style={{ width: LEAF_W, height: LEAF_H, pointerEvents: 'none' }}
    >
      <svg
        viewBox={`0 0 ${LEAF_W} ${LEAF_H}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          <path id={promptCurveId} d={promptPath} fill="none" stroke="none" />
        </defs>
        <image href="/img/leaf.png" x="0" y="0" width={LEAF_W} height={LEAF_H} preserveAspectRatio="xMidYMid meet" />
        <text fill="#603913" fontFamily="Sarabun, Georgia, serif" fontWeight="700" fontSize="28">
          <textPath href={`#${promptCurveId}`} startOffset="0%" textLength="308" lengthAdjust="spacing">
            {prompt}
          </textPath>
        </text>
        <text
          x="244" y="188"
          fill="#603913"
          fontFamily="Sarabun, Georgia, serif"
          fontWeight="700"
          fontSize="30"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {text}
        </text>
      </svg>
    </div>
  )
}

// ── Operator panel ────────────────────────────────────────────────────────────
function OperatorPanel({ onClose }) {
  const [entries, setEntries] = useState([])
  const [played, setPlayed] = useState([])

  function refresh() {
    try {
      const q = JSON.parse(localStorage.getItem('rooted_queue') || '[]')
      const p = JSON.parse(localStorage.getItem('rooted_played') || '[]')
      setEntries(q)
      setPlayed(p)
    } catch (e) {}
  }

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 2000)
    return () => clearInterval(t)
  }, [])

  function clearQueue() {
    localStorage.setItem('rooted_queue', JSON.stringify([]))
    refresh()
  }

  function clearPlayed() {
    localStorage.setItem('rooted_played', JSON.stringify([]))
    refresh()
  }

  function clearAll() {
    localStorage.setItem('rooted_queue', JSON.stringify([]))
    localStorage.setItem('rooted_played', JSON.stringify([]))
    refresh()
  }

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 80px',
    gap: '8px',
    padding: '6px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    fontSize: '12px',
    color: '#f0e8cc',
    alignItems: 'start',
  }

  const labelStyle = {
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(240,232,204,0.5)',
    marginBottom: '4px',
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      fontFamily: "'Sarabun', sans-serif",
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#f0e8cc', fontSize: '20px', fontWeight: 700 }}>Queue Manager</h2>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(240,232,204,0.4)', color: '#f0e8cc', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
          Close
        </button>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={clearQueue} style={btnStyle('#8b2020')}>Clear pending queue</button>
        <button onClick={clearPlayed} style={btnStyle('#3a5225')}>Clear played history</button>
        <button onClick={clearAll} style={btnStyle('#4a3010')}>Clear everything</button>
      </div>

      {/* Pending queue */}
      <div style={{ marginBottom: '24px' }}>
        <p style={labelStyle}>Pending — {entries.length} leaf{entries.length !== 1 ? 's' : ''} waiting</p>
        {entries.length === 0
          ? <p style={{ color: 'rgba(240,232,204,0.4)', fontSize: '12px' }}>Nothing in queue</p>
          : entries.map((e, i) => (
            <div key={e.id} style={rowStyle}>
              <span style={{ opacity: 0.6 }}>{e.prompt}</span>
              <span>{e.text}</span>
              <span style={{ opacity: 0.4, fontSize: '10px' }}>{new Date(e.createdAt).toLocaleTimeString()}</span>
            </div>
          ))
        }
      </div>

      {/* Played history */}
      <div>
        <p style={labelStyle}>Played history — {played.length} total</p>
        {played.length === 0
          ? <p style={{ color: 'rgba(240,232,204,0.4)', fontSize: '12px' }}>Nothing played yet</p>
          : played.map((e, i) => (
            <div key={e.id + i} style={{ ...rowStyle, opacity: 0.5 }}>
              <span>{e.prompt}</span>
              <span>{e.text}</span>
              <span style={{ fontSize: '10px' }}>{new Date(e.createdAt).toLocaleTimeString()}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}

function btnStyle(bg) {
  return {
    background: bg,
    color: '#f0e8cc',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '12px',
    fontFamily: "'Sarabun', sans-serif",
    cursor: 'pointer',
  }
}

// ── Main display page ─────────────────────────────────────────────────────────
export default function DisplayPage() {
  const [leaves, setLeaves] = useState([])
  const [fontReady, setFontReady] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const spawnQueueRef = useRef([])     // ordered list of entries waiting to spawn
  const spawnTimerRef = useRef(null)   // timeout handle for next spawn
  const playedRef = useRef([])         // entries that have been shown at least once

  // Font loading
  useEffect(() => {
    if (typeof document === 'undefined') return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@700&display=swap'
    document.head.appendChild(link)
    if ('fonts' in document) {
      document.fonts.load("700 30px 'Sarabun'").then(() => setFontReady(true))
    } else {
      setTimeout(() => setFontReady(true), 1500)
    }
  }, [])

  // Spawn the next leaf from the internal spawn queue
  function scheduleNext(immediate = false) {
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current)
    spawnTimerRef.current = setTimeout(() => {
      if (spawnQueueRef.current.length === 0) return
      const entry = spawnQueueRef.current.shift()
      // Mark as played in localStorage
      const played = JSON.parse(localStorage.getItem('rooted_played') || '[]')
      if (!played.find(p => p.id === entry.id)) {
        played.push(entry)
        localStorage.setItem('rooted_played', JSON.stringify(played))
      }
      const leafId = `${entry.id}_${Date.now()}`
      setLeaves(prev => [...prev, { ...entry, leafId }])
      // Schedule the next one
      if (spawnQueueRef.current.length > 0) scheduleNext()
    }, immediate ? 500 : STAGGER_MS)
  }

  // Poll localStorage for new submissions
  useEffect(() => {
    function checkQueue() {
      try {
        const raw = localStorage.getItem('rooted_queue')
        if (!raw) return
        const queue = JSON.parse(raw)
        if (!queue.length) return

        // Add new entries to spawn queue (avoid duplicates)
        const existingIds = new Set(spawnQueueRef.current.map(e => e.id))
        const newEntries = queue.filter(e => !existingIds.has(e.id))
        if (newEntries.length > 0) {
          spawnQueueRef.current.push(...newEntries)
          // Clear from localStorage queue
          localStorage.setItem('rooted_queue', JSON.stringify([]))
          // Kick off spawning if not already running
          if (!spawnTimerRef.current) scheduleNext(true)
        }
      } catch (e) {
        console.error('queue read error', e)
      }
    }

    const interval = setInterval(checkQueue, 1000)
    checkQueue()
    return () => clearInterval(interval)
  }, [])

  // Periodic replay — re-queue played entries so the display stays active
  useEffect(() => {
    const replayInterval = setInterval(() => {
      try {
        const played = JSON.parse(localStorage.getItem('rooted_played') || '[]')
        if (played.length === 0) return
        // Only re-queue if spawn queue is empty — don't pile up
        if (spawnQueueRef.current.length > 0) return
        // Shuffle played entries and add them back
        const shuffled = [...played].sort(() => Math.random() - 0.5)
        spawnQueueRef.current.push(...shuffled)
        scheduleNext(true)
      } catch (e) {}
    }, REPLAY_INTERVAL_MS)

    return () => clearInterval(replayInterval)
  }, [])

  function removeLeaf(leafId) {
    setLeaves(prev => prev.filter(l => l.leafId !== leafId))
  }

  // Secret tap in top-right corner to open operator panel
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef(null)
  function handleCornerTap() {
    tapCountRef.current++
    clearTimeout(tapTimerRef.current)
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0 }, 2000)
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0
      setShowPanel(true)
    }
  }

  return (
    <main
      className="relative w-screen h-screen overflow-hidden"
      style={{ backgroundColor: '#F3E6CB' }}
    >

      {/* Secret tap zone — top right corner, tap 5 times to open panel */}
      <div
        onClick={handleCornerTap}
        style={{ position: 'fixed', top: 0, right: 0, width: 60, height: 60, zIndex: 50 }}
      />

      {fontReady && leaves.map(leaf => (
        <FallingLeaf
          key={leaf.leafId}
          id={leaf.leafId}
          text={leaf.text}
          prompt={leaf.prompt}
          onDone={removeLeaf}
        />
      ))}

      {showPanel && <OperatorPanel onClose={() => setShowPanel(false)} />}
    </main>
  )
}