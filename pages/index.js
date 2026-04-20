import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import BranchCanvas from '@/components/branches'

const PROMPTS = [
"A value I live by...",
"I want to be known for...",
"I feel most myself...",
"I'd teach someone...",
"A place that shaped me...",
"Community means...",
"I felt truly seen...",
"What gives me hope...",
"What home means to me...",
"What connects us all...",
"A truth I learned is...",
"What I stand for...",
]

const MAX_CHARS = 30;

export default function LandingPage() {
  const [formVisible, setFormVisible] = useState(false)
  const [leavesActive, setLeavesActive] = useState(false)
  const [prompt, setPrompt] = useState(PROMPTS[0])
  const [charCount, setCharCount] = useState(0);
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter();
  
  useEffect(() => {
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
  }, [])

  function handleMidpoint() {
    setFormVisible(true)
  }

  function handleTreeComplete() {
    setLeavesActive(true)
  }

  async function handleSubmit() {
    if (!answer.trim()) return

    const entry = {
      id: `leaf_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      text: answer.trim(),
      prompt: prompt,
      createdAt: new Date().toISOString(),
    }

    try {
      await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
    } catch (e) {
      console.error('submit error', e)
    }

    setSubmitted(true)
    setAnswer('')
    setCharCount(0)
  }

  return (
    <main
      className="relative max-w-full h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{ backgroundColor: '#EEE8D2' }}
    >

      <div className="absolute inset-0 z-[1]">
        <BranchCanvas
          onMidpoint={handleMidpoint}
          onComplete={handleTreeComplete}
        /> 
      </div>
       
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6 py-4 w-full max-w-sm">
       <div className="text-center p-2" style={{
          background: 'radial-gradient(ellipse 85% 70% at 50% 50%, rgba(238,232,210,0.92) 0%, rgba(238,232,210,0.5) 55%, transparent 100%)',
          borderRadius: '50%',
          padding: '20px 24px',
        }}>
          <h1
            className="text-6xl font-semibold tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', sans-serif", color: '#603913' }}
          >
            Rooted
          </h1>
          <p
            className="mt-2 text-sm tracking-widest uppercase"
            style={{ fontFamily: "'Sarabun', sans-serif", color: '#3a2e0e', opacity: 0.75 }}
          >
            Like roots beneath the soil, 
            <br/>
            we are stronger intertwined.
            <br/>
            <br/>
            Reflect. Share. Be heard.
          </p>
        </div>

        <div
          className="rounded-xl p-5 w-full relative overflow-hidden"
          style={{
            background: '#E5DBBA',
            border: '1px solid rgba(180, 148, 60, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            minHeight: '180px',
          }}
        >
          {/* form */}
          <div
            className="transition-all duration-700 ease-in-out"
            style={{
              opacity: submitted ? 0 : 1,
              transform: submitted ? 'translateY(-16px)' : 'translateY(0)',
              pointerEvents: submitted ? 'none' : 'auto',
              position: submitted ? 'absolute' : 'relative',
              width: '100%',
            }}
          >
            <p
              className="text-base mb-3 leading-snug text-center"
              style={{ fontFamily: "'Sarabun', sans-serif", color: '#603913', fontWeight: 500 }}
            >
              {prompt}
            </p>
            <textarea
              rows={3}
              maxLength={MAX_CHARS}
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value)
                setCharCount(e.target.value.length)
              }}
              placeholder="Reflect..."
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{
                fontFamily: "'Sarabun', sans-serif",
                background: 'rgba(250, 247, 238, 0.9)',
                border: '2px solid #c9b580',
                color: '#2d1f0a',
              }}
            />
            <p
              className="text-right text-xs mt-1"
              style={{
                fontFamily: "'Sarabun', sans-serif",
                color: charCount >= MAX_CHARS ? '#8b2020' : '#8a7040',
              }}
            >
              {charCount}/{MAX_CHARS}
            </p>
            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="mt-3 w-full rounded-lg py-2 text-sm tracking-wide transition-all duration-300"
              style={{
                fontFamily: "'Sarabun', sans-serif",
                fontWeight: 700,
                background: '#3a5225',
                color: '#f0e8cc',
                border: 'none',
                opacity: !answer.trim() ? 0.5 : 1,
                cursor: !answer.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              Leaf it 
            </button>
          </div>

          {/* ty */}
          <div
            className="transition-all duration-700 ease-in-out flex flex-col items-center justify-center text-center gap-4"
            style={{
              opacity: submitted ? 1 : 0,
              transform: submitted ? 'translateY(0)' : 'translateY(16px)',
              pointerEvents: submitted ? 'auto' : 'none',
              position: submitted ? 'relative' : 'absolute',
              width: '100%',
              padding: '8px 0',
            }}
          >
            <p
              style={{
                fontFamily: "'Sarabun', sans-serif",
                fontWeight: 700,
                fontSize: '20px',
                color: '#2d1f0a',
              }}
            >
              Thank you
            </p>
            <p
              style={{
                fontFamily: "'Sarabun', sans-serif",
                fontSize: '13px',
                color: '#4a3c20',
                lineHeight: 1.6,
              }}
            >
              Your leaf has been added to the tree.
              <br />
              Explore what Rooted is all about.
            </p>
            <button
              onClick={() => router.push('/learn-more')}
              className="rounded-lg py-2 px-6 text-sm tracking-wide"
              style={{
                fontFamily: "'Sarabun', sans-serif",
                fontWeight: 700,
                background: '#3a5225',
                color: '#f0e8cc',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              View the Canopy
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}