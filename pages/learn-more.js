import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import Carousel from '@/components/carousel'

const NS = 'http://www.w3.org/2000/svg'

function solve(data) {
  const size = data.length
  const last = size - 4
  let path = 'M' + [data[0], data[1]]
  for (let i = 0; i < size - 2; i += 2) {
    const x0 = i ? data[i-2] : data[0], y0 = i ? data[i-1] : data[1]
    const x1 = data[i], y1 = data[i+1]
    const x2 = data[i+2], y2 = data[i+3]
    const x3 = i !== last ? data[i+4] : x2, y3 = i !== last ? data[i+5] : y2
    const cp1x = (-x0+6*x1+x2)/6, cp1y = (-y0+6*y1+y2)/6
    const cp2x = (x1+6*x2-x3)/6, cp2y = (y1+6*y2-y3)/6
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
      x: pts[i-1].x + dirX * 5 + drift,
      y: pts[i-1].y + dirY * 5 + (Math.random() - 0.45) * 1.5,
    })
  }
  return pts
}

function generateForkAngles(parentAngle, count) {
  if (count === 1) return [parentAngle + (Math.random() * 0.3 - 0.15)]
  if (count === 2) {
    const spread = 0.35 + Math.random() * 0.45
    const bias = Math.random() * 0.15 - 0.075
    return [parentAngle - spread * 0.4 + bias, parentAngle + spread * 0.6 + bias]
  }
  const spread = 0.3 + Math.random() * 0.35
  return [
    parentAngle - spread + Math.random() * 0.1,
    parentAngle + Math.random() * 0.15 - 0.075,
    parentAngle + spread + Math.random() * 0.1,
  ]
}

const LEAF_COLORS = ['#2d4a1e','#3a5c28','#2a3d1a','#4a6b30','#354f22','#263c18']

function buildStaticBranch(parent, x, y, angle, length, strokeW, depth, maxDepth, W, H) {
  if (depth > maxDepth || strokeW < 0.3) return

  const spread = 0.8 + depth * 0.3
  const pts = makePoints(x, y, angle, length, spread)
  const coords = []
  pts.forEach(p => coords.push(p.x, p.y))

  const path = document.createElementNS(NS, 'path')
  path.setAttribute('d', solve(coords))
  path.setAttribute('fill', 'none')
  const col = strokeW > 9 ? '#4a2810' : strokeW > 6 ? '#6b3e1a' : strokeW > 3.5 ? '#8c5830' : strokeW > 2 ? '#a06838' : '#b07840'
  path.setAttribute('stroke', col)
  path.setAttribute('stroke-width', strokeW)
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  parent.appendChild(path)

  if (depth >= 2) {
    const leafCount = Math.floor(3 + Math.random() * 4)
    for (let li = 0; li < leafCount; li++) {
      const t = 0.15 + (li / Math.max(leafCount - 1, 1)) * 0.85
      const idx = Math.floor(t * (pts.length - 1))
      const pt = pts[Math.min(idx, pts.length - 1)]
      if (pt.x < -60 || pt.x > W + 60 || pt.y < -60 || pt.y > H) continue

      const side = li % 2 === 0 ? 1 : -1
      const stemAngle = angle + side * (Math.PI / 2)
      const stemLen = 7 + Math.random() * 6
      const stemEndX = pt.x + Math.cos(stemAngle) * stemLen
      const stemEndY = pt.y + Math.sin(stemAngle) * stemLen

      const g = document.createElementNS(NS, 'g')

      const stem = document.createElementNS(NS, 'line')
      stem.setAttribute('x1', pt.x)
      stem.setAttribute('y1', pt.y)
      stem.setAttribute('x2', stemEndX.toFixed(1))
      stem.setAttribute('y2', stemEndY.toFixed(1))
      stem.setAttribute('stroke', '#3a2d18')
      stem.setAttribute('stroke-width', '1')
      stem.setAttribute('stroke-linecap', 'round')
      g.appendChild(stem)

      const leafRot = (stemAngle * 180 / Math.PI - 90).toFixed(1)
      const scale = (0.6 + Math.random() * 0.55).toFixed(2)
      const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]

      const leafG = document.createElementNS(NS, 'g')
      leafG.setAttribute('transform', `translate(${stemEndX.toFixed(1)},${stemEndY.toFixed(1)}) rotate(${leafRot}) scale(${scale})`)

      const leaf = document.createElementNS(NS, 'path')
      leaf.setAttribute('d', 'M0,0 C5,-2 9,-10 8,-18 C7,-26 1,-30 0,-32 C-1,-30 -7,-26 -8,-18 C-9,-10 -5,-2 0,0z')
      leaf.setAttribute('fill', color)
      leaf.setAttribute('opacity', '0.92')
      leafG.appendChild(leaf)

      const vein = document.createElementNS(NS, 'line')
      vein.setAttribute('x1', '0'); vein.setAttribute('y1', '0')
      vein.setAttribute('x2', '0'); vein.setAttribute('y2', '-28')
      vein.setAttribute('stroke', '#1a2d10')
      vein.setAttribute('stroke-width', '0.6')
      vein.setAttribute('stroke-linecap', 'round')
      vein.setAttribute('opacity', '0.5')
      leafG.appendChild(vein)

      g.appendChild(leafG)
      parent.appendChild(g)
    }
  }

  const endPt = pts[pts.length - 1]
  const numChildren = depth < 2 ? 2 : Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1
  const childLength = length * (0.68 + Math.random() * 0.18)
  const childW = strokeW * (0.62 + Math.random() * 0.12)
  generateForkAngles(angle, numChildren).forEach(fa => {
    buildStaticBranch(parent, endPt.x, endPt.y, fa, childLength, childW, depth + 1, maxDepth, W, H)
  })
}

function FixedBranches() {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.innerHTML = ''
    const W = window.innerWidth
    const H = window.innerHeight

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)

    const g = document.createElementNS(NS, 'g')
    svg.appendChild(g)

    buildStaticBranch(g, 0, 2, 0.08, W * 0.44, 13, 0, 8, W, H)
    buildStaticBranch(g, 2, 0, Math.PI / 2 + 0.06, H * 0.5, 10, 0, 7, W, H)
    buildStaticBranch(g, W, 2, Math.PI - 0.08, W * 0.44, 13, 0, 8, W, H)
    buildStaticBranch(g, W - 2, 0, Math.PI / 2 - 0.06, H * 0.5, 10, 0, 7, W, H)
  }, [])

  return (
    <svg
      ref={svgRef}
      className="fixed top-0 left-0 w-full h-screen pointer-events-none"
      style={{ zIndex: 1, overflow: 'visible' }}
      xmlns={NS}
    />
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#E5DBBA] border border-[#c9b580] rounded-xl p-6 ${className}`}>
      {children}
    </div>
  )
}

export default function LearnMore() {
  const router = useRouter()

  return (
    <main className="min-h-screen w-full bg-[#EEE8D2] font-['Sarabun',sans-serif] overflow-x-hidden relative">

      <FixedBranches />

      <div className="relative z-10">

        <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-[#603913]/20 bg-[#EEE8D2]/80 backdrop-blur-md sticky top-0 z-20">
          <span
            onClick={() => router.push('/')}
            className="cursor-pointer text-[22px] font-bold text-[#603913]"
          >
            Rooted
          </span>
          <span className="text-[11px] tracking-[0.14em] uppercase text-[#8a7040]">
            An Interactive Installation
          </span>
        </nav>

        <section className="w-full backdrop-blur-md overflow-hidden">
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full border-0 scale-[1.03]"
              src="https://www.youtube.com/embed/YekloFXmZnI?autoplay=1&mute=1&loop=1&playlist=YekloFXmZnI"
              title="Rooted"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>

        <div className="w-full backdrop-blur-md max-w-2xl mx-auto px-6 pt-12 pb-6 flex flex-col gap-5">

          <Card className="">
            <h2 className="text-[22px] text-center font-bold text-[#603913] mb-3">About the Artist</h2>
            <p className="text-[16px] text-center font-bold text-[#3a2e0e] mb-2">
              Shalimar Cruz Hebbeler
            </p>
            <p className="text-[15px] text-left text-[#3a2e0e] leading-loose">
              Shalimar is a graduating masters student who likes to think of herself as an
              imagineer. She combines art, technology, and engineering to create experiences
              that leave a lasting impression. With roots in experimental events and a
              belief that wonder should be accessible to everyone, she lives at the intersection
              of creativity and craft.
              <br /><br />
              When she is not building something, she is spoiling her cat April, strengthening
              her community, or somewhere in the world learning about people and places and
              confirming, every time, just how similar we all truly are no matter where we come from.
            </p>
            <p className='text-center pt-4'>
              <a href="https://www.linkedin.com/in/shalimarcruz" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#8a7040] italic underline underline-offset-2 hover:text-[#603913] transition-colors">LinkedIn</a>
            </p>
          </Card>

          <Card>
            <h2 className="text-[22px] font-bold text-[#603913] mb-4">Why Trees?</h2>
            <p className="text-[15px] text-[#3a2e0e] leading-loose">
              There are over 73,000 known tree species on Earth and nearly 10,000 still
              undiscovered. Every one of them, regardless of species, does the same things.
              They provide shade, shelter, clean air, protection, and nourishment. No tree holds
              back from another. Neighboring trees intertwine their roots beneath the soil,
              quietly sharing resources and strengthening each other. They do not sort by
              species. They just grow together.
              <br /><br />
              People work the same way. Every person, regardless of where they come from,
              has the same fundamental needs. Communities grow stronger when people connect
              and contribute to one another. Rooted was built on that parallel.
            </p>
          </Card>

          <Card>
            <h2 className="text-[22px] font-bold text-[#603913] mb-4">About the Work</h2>
            <p className="text-[15px] text-[#3a2e0e] leading-loose">
              Rooted is an interactive cabinet built at a time when community feels more
              fragile than ever. In a political climate that increasingly targets and divides
              the people who make up our communities by origin, by identity, and by belief,
              this project is a quiet act of resistance. A reminder that we are more alike
              than we are different and that the connections between us matter.
              <br /><br />
              The cabinet invites you to contribute a single reflection. A value, a truth,
              something you would teach someone. Your response appears as a leaf on a monitor
              inside the cabinet, falling and settling alongside everyone else's.
              <br /><br />
              No name attached. No response ranked above another. Every leaf falls the same way.
            </p>
          </Card>

          <Card>
            <h2 className="text-[22px] font-bold text-[#603913] mb-4">The Making</h2>
            <p className="text-[15px] text-[#3a2e0e] leading-loose">
              The cabinet was designed and built from scratch using 2x4 lumber framing and
              plywood panels. Tree branch forms were sculpted over pool noodle armatures
              using drywall compound and plaster of Paris, finished with primer and white
              acrylic paint.
              <br /><br />
              An Arduino Mega drives mmWave radar sensors and DotStar LED strips. A
              Raspberry Pi runs a custom Next.js web application that manages submissions
              and displays leaves on a monitor in real time. NFC tags mounted on the
              sculpture link directly to the submission portal with no app download required.
            </p>
            <Carousel images={[
              '/img/cabinet.jpeg',
              '/img/armature.jpeg',
              '/img/doors.jpeg',
              '/img/inside.jpeg',
              '/img/fin.jpeg',
            ]} />
          </Card>

          <Card>
            <h2 className="text-[22px] font-bold text-[#603913] mb-4">The Process</h2>
            <p className="text-[15px] text-[#3a2e0e] leading-loose mb-6">
              Rooted began with a question: what kinds of interactive experiences do people
              actually want in a public space? A 19-respondent survey conducted at the
              University of Colorado Boulder showed that tactile and interactive elements
              ranked as the most appealing type of installation. A surprising number of
              respondents also expressed a want for something calming and low pressure.
              Both of those findings shaped this project directly.
            </p>
            <h3 className="text-[17px] font-bold text-[#603913] mb-3">The Research</h3>
            <p className="text-[15px] text-[#3a2e0e] leading-loose mb-6">
              The survey explored public interest across installation types including digital,
              physical, sound-based, and participatory formats. Respondents consistently ranked
              hands-on interactivity highest, citing a desire to feel personally involved
              rather than passively observed.
              <br /><br />
              Secondary research into tree biology, epigenetic memory in plants, and root
              communication networks reinforced the core thesis. Trees are not just a visual
              metaphor for community. They are a functioning model of it.
            </p>
            <h3 className="text-[17px] font-bold text-[#603913] mb-3">The Results</h3>
            <p className="text-[15px] text-[#3a2e0e] leading-loose">
              Rooted was designed to be experienced, not explained. The prompts were
              tested and refined to be open enough for anyone to answer regardless of
              background, language, or familiarity with the space.
              <br /><br />
              The physical build, electronics, and web application were all developed and
              iterated in parallel. The result is a piece where the sculptural and the
              digital are inseparable. The tree is both the artwork and the interface.
            </p>
          </Card>

          <Card>
            <h2 className="text-[22px] font-bold text-[#603913] mb-2">Community Resources</h2>
            <p className="text-[15px] text-[#3a2e0e] leading-loose mb-6">
              Rooted is about community and community means showing up for each other.
              Here are real resources available to you and your neighbors in Colorado.
              No barriers, no judgment. Just information.
            </p>
            <div className="flex flex-col gap-3">
              <a href="https://www.aclu-co.org/know-your-rights" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#c9b580] bg-[#EEE8D2]/60 hover:bg-[#EEE8D2] transition-colors">
                <span className="text-[15px] font-bold text-[#603913]">Know Your Rights</span>
                <span className="text-[#8a7040]">→</span>
              </a>
              <a href="https://www.colorado.gov/pacific/cdhs/assistance-programs" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#c9b580] bg-[#EEE8D2]/60 hover:bg-[#EEE8D2] transition-colors">
                <span className="text-[15px] font-bold text-[#603913]">CO Assistance Programs List</span>
                <span className="text-[#8a7040]">→</span>
              </a>
              <a href="https://www.211colorado.org" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#c9b580] bg-[#EEE8D2]/60 hover:bg-[#EEE8D2] transition-colors">
                <span className="text-[15px] font-bold text-[#603913]">2-1-1 Colorado</span>
                <span className="text-[#8a7040]">→</span>
              </a>
              {/* <a href="https://cdphe.colorado.gov/mental-health" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#c9b580] bg-[#EEE8D2]/60 hover:bg-[#EEE8D2] transition-colors">
                <span className="text-[15px] font-bold text-[#603913]">Mental Health Resources</span>
                <span className="text-[#8a7040]">→</span>
              </a> */}
              <a href="https://www.tpl.org/our-mission/community" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#c9b580] bg-[#EEE8D2]/60 hover:bg-[#EEE8D2] transition-colors">
                <span className="text-[15px] font-bold text-[#603913]">Trust for Public Land</span>
                <span className="text-[#8a7040]">→</span>
              </a>
            </div>
          </Card>

          <div className="flex flex-row justify-center items-center py-4">
            <button
              onClick={() => router.push('/')}
              className="bg-[#3a5225] text-[#f0e8cc] rounded-lg px-7 py-[10px] text-[13px] tracking-[0.06em] font-bold cursor-pointer w-80"
            >
              Leave your leaf
            </button>
          </div>

          <div className="w-full py-6 text-center border-t border-[#c9b580] text-[11px] text-[#8a7040] tracking-[0.1em]">
            <p>
              Rooted · ATLAS Institute · CU Boulder · 2026
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}