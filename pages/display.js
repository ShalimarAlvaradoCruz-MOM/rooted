import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'

const LEAF_LINGER_MS = 5 * 60 * 1000
const LEAF_W = 488
const LEAF_H = 334
const STAGGER_MS = 12000
const REPLAY_INTERVAL_MS = 30000

// ── Falling Leaf ──────────────────────────────────────────────────────────────
function FallingLeaf({ text, prompt, id, onDone }) {
  const leafRef = useRef(null)
  const promptCurveId = `curve_${id}`
  const promptPath = `M 75,170 Q 160,0 345,80`

 useEffect(() => {
  const el = leafRef.current
  if (!el) return

  const vW = window.innerWidth
  const vH = window.innerHeight
  const startX = 40 + Math.random() * (vW - LEAF_W - 80)
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

  // Fade in
  tl.to(el, {
    opacity: 1,
    duration: 2,
    ease: 'power1.in',
  })

  // Slow descent — falls all the way off the bottom
  tl.to(el, {
    y: vH + LEAF_H + 20,
    duration: 30 + Math.random() * 8,
    ease: 'none',
  }, 0)

  // Horizontal sway
  tl.to(el, {
    x: startX + swayAmount,
    duration: swayDuration,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  }, 0)

  // Rotation sway — up to ±20deg, independent timing
  tl.to(el, {
    rotation: endRotation,
    duration: swayDuration * 0.7,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: Math.random() * 2,
  }, 0)

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
        <image
          href="/img/leaf.png"
          x="0" y="0"
          width={LEAF_W} height={LEAF_H}
          preserveAspectRatio="xMidYMid meet"
        />
        <text
          fill="#603913"
          fontFamily="Sarabun, Georgia, serif"
          fontWeight="700"
          fontSize="28"
        >
          <textPath
            href={`#${promptCurveId}`}
            startOffset="2%"
            textLength="308"
            lengthAdjust="spacing"
          >
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

// ── Operator Panel ────────────────────────────────────────────────────────────
function OperatorPanel({ onClose }) {
  const [entries, setEntries] = useState([])
  const [played, setPlayed] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  async function refresh() {
    try {
      const res = await fetch('/api/queue')
      const data = await res.json()
      setEntries(data.pending || [])
      setPlayed(data.played || [])
    } catch (e) {}
  }

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 2000)
    return () => clearInterval(t)
  }, [])

  async function doDelete(target, label) {
    setLoading(true)
    await fetch('/api/queue', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target }),
    })
    await refresh()
    setLoading(false)
    showToast(`${label} cleared`)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(26,18,6,0.96)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Sarabun', sans-serif",
      overflowY: 'auto',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 28px 16px',
        borderBottom: '1px solid rgba(210,185,88,0.2)',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '28px',
            fontWeight: 600,
            color: '#D2B958',
            letterSpacing: '0.04em',
            margin: 0,
          }}>
            Rooted
          </h1>
          <p style={{ fontSize: '11px', color: 'rgba(210,185,88,0.5)', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '2px 0 0' }}>
            Queue Manager
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: '1px solid rgba(210,185,88,0.3)',
            color: '#D2B958',
            padding: '8px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: "'Sarabun', sans-serif",
            letterSpacing: '0.06em',
          }}
        >
          Close
        </button>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        padding: '20px 28px',
        borderBottom: '1px solid rgba(210,185,88,0.12)',
      }}>
        {[
          { label: 'Pending', value: entries.length, color: '#D2B958' },
          { label: 'Played', value: played.length, color: '#8bc34a' },
          { label: 'Total', value: entries.length + played.length, color: 'rgba(240,232,204,0.6)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(210,185,88,0.06)',
            border: '1px solid rgba(210,185,88,0.15)',
            borderRadius: '10px',
            padding: '14px 16px',
          }}>
            <p style={{ fontSize: '10px', color: 'rgba(240,232,204,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 6px' }}>{s.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', padding: '16px 28px', borderBottom: '1px solid rgba(210,185,88,0.12)' }}>
        <ActionBtn label="Clear pending" onClick={() => doDelete('queue', 'Pending queue')} color="#8b2020" disabled={loading} />
        <ActionBtn label="Clear history" onClick={() => doDelete('played', 'Play history')} color="#3a5225" disabled={loading} />
        <ActionBtn label="Clear all" onClick={() => doDelete('all', 'Everything')} color="#4a3010" disabled={loading} />
      </div>

      {/* Pending queue */}
      <Section title="Pending" count={entries.length} accent="#D2B958">
        {entries.length === 0
          ? <EmptyState label="No leaves waiting" />
          : entries.map(e => <EntryRow key={e.id} entry={e} dimmed={false} />)
        }
      </Section>

      {/* Played history */}
      <Section title="Played" count={played.length} accent="#8bc34a">
        {played.length === 0
          ? <EmptyState label="Nothing played yet" />
          : [...played].reverse().map((e, i) => <EntryRow key={e.id + i} entry={e} dimmed />)
        }
      </Section>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#3a5225',
          color: '#f0e8cc',
          padding: '10px 24px',
          borderRadius: '30px',
          fontSize: '13px',
          fontFamily: "'Sarabun', sans-serif",
          letterSpacing: '0.06em',
          zIndex: 300,
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}

function ActionBtn({ label, onClick, color, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: color,
        color: '#f0e8cc',
        border: 'none',
        borderRadius: '8px',
        padding: '9px 16px',
        fontSize: '12px',
        fontFamily: "'Sarabun', sans-serif",
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        letterSpacing: '0.05em',
        flex: 1,
      }}
    >
      {label}
    </button>
  )
}

function Section({ title, count, accent, children }) {
  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', color: accent, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>{title}</span>
        <span style={{ fontSize: '11px', color: 'rgba(240,232,204,0.3)', background: 'rgba(255,255,255,0.05)', padding: '1px 8px', borderRadius: '20px' }}>{count}</span>
      </div>
      {children}
    </div>
  )
}

function EmptyState({ label }) {
  return (
    <p style={{ fontSize: '13px', color: 'rgba(240,232,204,0.25)', fontStyle: 'italic', padding: '8px 0' }}>{label}</p>
  )
}

function EntryRow({ entry, dimmed }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.8fr 72px',
      gap: '10px',
      padding: '10px 0',
      borderBottom: '1px solid rgba(210,185,88,0.08)',
      opacity: dimmed ? 0.45 : 1,
      alignItems: 'start',
    }}>
      <span style={{ fontSize: '12px', color: 'rgba(240,232,204,0.55)', lineHeight: 1.5 }}>{entry.prompt}</span>
      <span style={{ fontSize: '13px', color: '#f0e8cc', fontWeight: 700, lineHeight: 1.5 }}>{entry.text}</span>
      <span style={{ fontSize: '10px', color: 'rgba(210,185,88,0.4)', textAlign: 'right', paddingTop: '2px' }}>
        {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}

// ── Main display page ─────────────────────────────────────────────────────────
export default function DisplayPage() {
  const [leaves, setLeaves] = useState([])
  const [fontReady, setFontReady] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const spawnQueueRef = useRef([])
  const spawnTimerRef = useRef(null)

  // Font loading
  useEffect(() => {
    if (typeof document === 'undefined') return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@700&family=Cormorant+Garamond:wght@600&display=swap'
    document.head.appendChild(link)
    if ('fonts' in document) {
      document.fonts.load("700 30px 'Sarabun'").then(() => setFontReady(true))
    } else {
      setTimeout(() => setFontReady(true), 1500)
    }
  }, [])

  // Spawn next leaf from internal queue
  function scheduleNext(immediate = false) {
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current)
    spawnTimerRef.current = setTimeout(async () => {
      if (spawnQueueRef.current.length === 0) {
        spawnTimerRef.current = null
        return
      }
      const entry = spawnQueueRef.current.shift()

      // Tell server this entry has been played
      try {
        await fetch('/api/queue', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        })
      } catch (e) {}

      const leafId = `${entry.id}_${Date.now()}`
      setLeaves(prev => [...prev, { ...entry, leafId }])

      if (spawnQueueRef.current.length > 0) scheduleNext()
      else spawnTimerRef.current = null
    }, immediate ? 600 : STAGGER_MS)
  }

  // Poll server for new submissions
  useEffect(() => {
    async function checkQueue() {
      try {
        const res = await fetch('/api/queue')
        const { pending } = await res.json()
        if (!pending?.length) return

        const existingIds = new Set(spawnQueueRef.current.map(e => e.id))
        const newEntries = pending.filter(e => !existingIds.has(e.id))
        if (newEntries.length > 0) {
          spawnQueueRef.current.push(...newEntries)
          if (!spawnTimerRef.current) scheduleNext(true)
        }
      } catch (e) {}
    }

    const interval = setInterval(checkQueue, 2000)
    checkQueue()
    return () => clearInterval(interval)
  }, [])

  // Periodic replay of played entries
  useEffect(() => {
    const t = setInterval(async () => {
      if (spawnQueueRef.current.length > 0) return
      try {
        const res = await fetch('/api/queue')
        const { played } = await res.json()
        if (!played?.length) return
        const shuffled = [...played].sort(() => Math.random() - 0.5)
        spawnQueueRef.current.push(...shuffled)
        scheduleNext(true)
      } catch (e) {}
    }, REPLAY_INTERVAL_MS)
    return () => clearInterval(t)
  }, [])

  function removeLeaf(leafId) {
    setLeaves(prev => prev.filter(l => l.leafId !== leafId))
  }

  // Secret 5-tap top-right corner to open operator panel
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
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Secret tap zone */}
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