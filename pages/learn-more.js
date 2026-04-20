import { useRouter } from 'next/router'

export default function LearnMore() {
  const router = useRouter()

  return (
    <main
      className="min-h-screen max-w-full"
      style={{ backgroundColor: '#EEE8D2', fontFamily: "'Sarabun', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap"
        rel="stylesheet"
      />

      <nav
        className="w-full flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(96, 57, 19, 0.2)' }}
      >
        <span
          onClick={() => router.push('/')}
          className="cursor-pointer"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '22px',
            fontWeight: 600,
            color: '#603913',
          }}
        >
          Rooted
        </span>
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#8a7040',
          }}
        >
          An Interactive Installation
        </span>
      </nav>

      <section className="w-full relative" style={{ background: '#1a1208' }}>
        <div className="w-full flex items-center justify-center" style={{ minHeight: '65vh' }}>
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
            style={{ background: 'rgba(10,8,3,0.42)' }}
          >
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(52px, 8vw, 100px)',
                fontWeight: 600,
                color: '#EEE8D2',
                letterSpacing: '0.04em',
                marginBottom: '16px',
              }}
            >
              Rooted
            </h1>
            <p
              style={{
                fontFamily: "'Sarabun', sans-serif",
                fontWeight: 300,
                fontSize: 'clamp(12px, 2vw, 16px)',
                color: 'rgba(238,232,210,0.8)',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              Different branches. One tree.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full max-w-2xl mx-auto px-6 py-20 text-center">
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(22px, 4vw, 34px)',
            color: '#2d1f0a',
            lineHeight: 1.75,
          }}
        >
          "Without trees, we perish.
          <br />
          Without community, we are nothing."
        </p>
      </section>

      <div className="w-16 mx-auto" style={{ borderTop: '1px solid #c9b580', marginBottom: '80px' }} />

      <section className="w-full max-w-2xl mx-auto px-6 pb-24 text-center">
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '32px',
            fontWeight: 600,
            color: '#603913',
            marginBottom: '20px',
          }}
        >
          Why Trees?
        </h2>
        <p
          style={{
            fontSize: '15px',
            fontWeight: 300,
            color: '#3a2e0e',
            lineHeight: 2,
          }}
        >
          There are an estimated 73,000 distinct tree species on Earth — nearly
          10,000 still undiscovered. No matter the species, trees share the same
          fundamental drive: to grow, to reach, and to connect. Neighboring trees
          intertwine their roots beneath the soil, sharing nutrients and
          strengthening one another silently, invisibly, without ask.
          <br /><br />
          We are not so different. Humanity has always grown stronger through
          exchange — of culture, of knowledge, of story. Our diversities are not
          divisions. They are branches of the same tree.
        </p>
      </section>

      <div className="w-16 mx-auto" style={{ borderTop: '1px solid #c9b580', marginBottom: '80px' }} />

      <section className="w-full max-w-3xl mx-auto px-6 pb-24">
        <div
          className="grid grid-cols-1 gap-16"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '28px',
                fontWeight: 600,
                color: '#603913',
                marginBottom: '16px',
              }}
            >
              About the Work
            </h2>
            <p style={{ fontSize: '15px', fontWeight: 300, color: '#3a2e0e', lineHeight: 1.95 }}>
              <em>Rooted</em> is a community-engaged interactive installation
              built from hand-sculpted baroque-style trees, live electronics,
              and a digital display system. Visitors are invited to respond to
              a prompt — and their words become a leaf, carried through the
              air and added to the collective canopy.
              <br /><br />
              Each response is anonymous, equal, and permanent for the duration
              of the exhibition. No voice is louder than another. Every leaf
              falls the same way.
            </p>
          </div>

          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '28px',
                fontWeight: 600,
                color: '#603913',
                marginBottom: '16px',
              }}
            >
              The Making
            </h2>
            <p style={{ fontSize: '15px', fontWeight: 300, color: '#3a2e0e', lineHeight: 1.95 }}>
              The trees are sculpted by hand using pool noodles, drywall
              compound, and plaster of Paris — techniques rooted in Baroque
              stucco bas-relief. Their forms reference Organic Architecture
              and Romantic Ruin: nature reclaiming built space.
              <br /><br />
              Beneath the surface, Arduino controls lighting and sensors detect presence. A custom
              web application animates the leafs in real time, growing as the community gathers and contributes.
            </p>
          </div>
        </div>
      </section>

      <section
        className="w-full py-20 px-6"
        style={{ background: 'rgba(96,57,19,0.06)', borderTop: '1px solid rgba(96,57,19,0.1)', borderBottom: '1px solid rgba(96,57,19,0.1)' }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-center"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '28px',
              fontWeight: 600,
              color: '#603913',
              marginBottom: '40px',
            }}
          >
            What Trees Give Us
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
            }}
          >
            {[
              { word: 'Shade', sub: 'rest' },
              { word: 'Habitat', sub: 'home' },
              { word: 'Purification', sub: 'cleansing' },
              { word: 'Protection', sub: 'erosion prevention' },
              { word: 'Resources', sub: 'sustenance' },
              { word: 'Memory', sub: 'epigenetic learning' },
              { word: 'Connection', sub: 'root intertwining' },
              { word: 'Well-being', sub: 'stress reduction' },
            ].map(item => (
              <div
                key={item.word}
                style={{
                  textAlign: 'center',
                  padding: '20px 12px',
                  border: '1px solid rgba(96,57,19,0.15)',
                  borderRadius: '10px',
                  background: 'rgba(238,232,210,0.7)',
                }}
              >
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#603913',
                  marginBottom: '4px',
                }}>
                  {item.word}
                </p>
                <p style={{
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#8a7040',
                  fontWeight: 300,
                }}>
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="w-full px-6 py-24 max-w-4xl mx-auto"
        style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="w-full rounded-xl flex items-center justify-center"
            style={{
              aspectRatio: '4/3',
              background: 'rgba(96,57,19,0.07)',
              border: '1px solid rgba(96,57,19,0.15)',
              color: '#8a7040',
              fontSize: '13px',
              fontWeight: 300,
              letterSpacing: '0.06em',
            }}
          >
            Image {i}
          </div>
        ))}
      </section>

      <section
        className="w-full py-20 text-center px-6"
        style={{ borderTop: '1px solid rgba(96,57,19,0.15)' }}
      >
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '28px',
            fontWeight: 600,
            color: '#603913',
            marginBottom: '16px',
          }}
        >
          About the Artist
        </h2>
        <p
          style={{
            fontSize: '15px',
            fontWeight: 300,
            color: '#3a2e0e',
            lineHeight: 1.95,
            maxWidth: '520px',
            margin: '0 auto 12px',
          }}
        >
          Shalimar Cruz Hebbeler
        </p>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 300,
            color: '#8a7040',
            lineHeight: 1.8,
            maxWidth: '520px',
            margin: '0 auto 36px',
            letterSpacing: '0.04em',
          }}
        >
          Masters Student · ATLAS Institute · University of Colorado Boulder
        </p>

        <button
          onClick={() => router.push('/')}
          style={{
            fontFamily: "'Sarabun', sans-serif",
            fontWeight: 700,
            background: '#3a5225',
            color: '#f0e8cc',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 28px',
            fontSize: '13px',
            letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
        >
          ← Leave your leaf
        </button>
      </section>

      <footer
        className="w-full py-6 text-center"
        style={{
          borderTop: '1px solid rgba(96,57,19,0.12)',
          fontSize: '11px',
          color: '#8a7040',
          fontWeight: 300,
          letterSpacing: '0.1em',
        }}
      >
        Rooted · ATLAS Institute · CU Boulder · 2026
      </footer>
    </main>
  )
}