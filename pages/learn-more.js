import { useRouter } from 'next/router'

export default function LearnMore() {
  const router = useRouter()

  return (
    <main
      className="min-h-screen max-w-full"
      style={{ backgroundColor: '#f5f0e8', fontFamily: "'Sarabun', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap"
        rel="stylesheet"
      />
      <nav
        className="w-full flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(180, 148, 60, 0.3)' }}
      >
        <span
          onClick={() => router.push('/')}
          className="cursor-pointer"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '22px',
            fontWeight: 600,
            color: '#1a2710',
          }}
        >
          Rooted
        </span>
        <span
          style={{
            fontSize: '12px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#8a7040',
          }}
        >
          An Interactive Installation
        </span>
      </nav>

      <section className="w-full relative" style={{ background: '#1a1a1a' }}>
        <div
          className="w-full flex items-center justify-center"
          style={{ minHeight: '60vh' }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full object-cover"
            style={{ maxHeight: '70vh' }}
          >
            <source src="/videos/rooted-hero.mp4" type="video/mp4" />
          </video>

          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
            style={{ background: 'rgba(0,0,0,0.35)' }}
          >
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(48px, 8vw, 96px)',
                fontWeight: 600,
                color: '#f5f0e8',
                letterSpacing: '0.04em',
                marginBottom: '12px',
              }}
            >
              Rooted
            </h1>
            <p
              style={{
                fontFamily: "'Sarabun', sans-serif",
                fontWeight: 300,
                fontSize: 'clamp(13px, 2vw, 17px)',
                color: 'rgba(245,240,232,0.85)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Community reflections on values, growth, and what grounds us
            </p>
          </div>
        </div>
      </section>

      <section
        className="w-full max-w-2xl mx-auto px-6 py-20 text-center"
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(22px, 4vw, 32px)',
            color: '#2d1f0a',
            lineHeight: 1.7,
          }}
        >
          "What does it mean to be rooted — in a place, a value, a community?"
        </p>
      </section>

      <div
        className="w-16 mx-auto"
        style={{ borderTop: '2px solid #c9b580', marginBottom: '80px' }}
      />

      <section className="w-full max-w-3xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 gap-16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>

          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '28px',
                fontWeight: 600,
                color: '#1a2710',
                marginBottom: '16px',
              }}
            >
              About the Work
            </h2>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 300,
                color: '#3a2e0e',
                lineHeight: 1.9,
              }}
            >
              Rooted is an interactive installation that invites participants to
              reflect on what grounds them. Through a series of prompts, visitors
              contribute a leaf to a growing digital tree — a collective portrait
              of community values.
            </p>
          </div>

          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '28px',
                fontWeight: 600,
                color: '#1a2710',
                marginBottom: '16px',
              }}
            >
              The Process
            </h2>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 300,
                color: '#3a2e0e',
                lineHeight: 1.9,
              }}
            >
              Each tree was hand-sculpted using traditional techniques, then
              digitally extended through NFC-triggered animations and a
              custom-built display system. The result is a living archive of
              community voice.
            </p>
          </div>

        </div>
      </section>

      <section
        className="w-full px-6 pb-24 max-w-4xl mx-auto"
        style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
      >
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="w-full rounded-xl flex items-center justify-center"
            style={{
              aspectRatio: '4/3',
              background: 'rgba(180, 148, 60, 0.15)',
              border: '1px solid rgba(180, 148, 60, 0.3)',
              color: '#8a7040',
              fontSize: '13px',
              fontWeight: 300,
            }}
          >
            Image {i}
          </div>
        ))}
      </section>

      <section
        className="w-full py-20 text-center px-6"
        style={{ borderTop: '1px solid rgba(180, 148, 60, 0.3)' }}
      >
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '24px',
            fontWeight: 600,
            color: '#1a2710',
            marginBottom: '12px',
          }}
        >
          About the Artist
        </h2>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 300,
            color: '#3a2e0e',
            lineHeight: 1.9,
            maxWidth: '480px',
            margin: '0 auto 32px',
          }}
        >
          Shalimar Cruz Hebbeler
          Thesis Installation, ATLAS Institute, University of Colorado Boulder.
        </p>

        <button
          onClick={() => router.push('/')}
          className="rounded-lg py-2 px-8 text-sm tracking-wide"
          style={{
            fontFamily: "'Sarabun', sans-serif",
            fontWeight: 700,
            background: '#3a5225',
            color: '#f0e8cc',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ← Leave your leaf
        </button>
      </section>
      <footer
        className="w-full py-6 text-center"
        style={{
          borderTop: '1px solid rgba(180, 148, 60, 0.2)',
          fontSize: '12px',
          color: '#8a7040',
          fontWeight: 300,
        }}
      >
        Rooted · ATLAS Institute · CU Boulder · {new Date().getFullYear()}
      </footer>

    </main>
  )
}