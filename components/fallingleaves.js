'use client'
import { useEffect, useRef, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

// tsParticles needs images as HTMLImageElement refs loaded before init
function useLeafImages() {
  const [images, setImages] = useState([])

  useEffect(() => {
    const srcs = [
      '/leaf.svg',
      '/leaf-dark.svg',
      '/leaf-mid.svg',
      '/leaf-amber.svg',
    ]
    const loaded = srcs.map((src) => {
      const img = new Image()
      img.src = src
      return img
    })
    // Wait for all to load
    Promise.all(
      loaded.map(
        (img) =>
          new Promise((res) => {
            img.onload = res
            img.onerror = res // don't block on error
          })
      )
    ).then(() => setImages(loaded))
  }, [])

  return images
}

export default function FallingLeaves({ active }) {
  const [engineReady, setEngineReady] = useState(false)
  const leafImages = useLeafImages()

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setEngineReady(true))
  }, [])

  if (!engineReady || leafImages.length === 0) return null

  const options = {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,

    // ── EMITTERS ──────────────────────────────────────────────
    // Two emitters: top edge strip + two side strips near top
    emitters: [
      {
        // Full top edge
        direction: 'bottom',
        rate: { delay: 0.6, quantity: 1 },
        position: { x: 50, y: 0 },
        size: { width: 100, height: 0 },
        life: { count: 0 }, // infinite
      },
      {
        // Left side near top — mimics branch tips
        direction: 'bottom-right',
        rate: { delay: 1.2, quantity: 1 },
        position: { x: 5, y: 15 },
        size: { width: 10, height: 20 },
        life: { count: 0 },
      },
      {
        // Right side near top — mimics branch tips
        direction: 'bottom-left',
        rate: { delay: 1.2, quantity: 1 },
        position: { x: 95, y: 15 },
        size: { width: 10, height: 20 },
        life: { count: 0 },
      },
    ],

    particles: {
      number: { value: 0 }, // emitters control this

      // ── SHAPE — custom SVG leaf images ──────────────────────
      shape: {
        type: 'image',
        options: {
          image: leafImages.map((img) => ({
            src: img.src,
            width: 20,
            height: 35,
          })),
        },
      },

      size: {
        value: { min: 10, max: 18 },
        animation: { enable: false },
      },

      opacity: {
        value: { min: 0.6, max: 0.95 },
        animation: { enable: false },
      },

      // ── MOVEMENT ────────────────────────────────────────────
      move: {
        enable: true,
        gravity: {
          enable: true,
          acceleration: 1.8, // moderate fall speed
          maxSpeed: 6,
        },
        speed: { min: 1.5, max: 3.5 },
        direction: 'bottom',
        random: true,
        straight: false,
        outModes: {
          bottom: 'none', // don't destroy on bottom — we handle pile
          left: 'out',
          right: 'out',
          top: 'out',
        },
        // Wind: each leaf gets a random horizontal drift
        // that changes mid-fall via the warp updater
        drift: { min: -3, max: 3 },
        warp: true, // direction changes mid-flight
      },

      // ── ROTATION — tumbling as they fall ────────────────────
      rotate: {
        value: { min: 0, max: 360 },
        direction: 'random',
        animation: {
          enable: true,
          speed: { min: 8, max: 20 },
          sync: false,
        },
      },

      // ── TILT — adds organic flutter ─────────────────────────
      tilt: {
        enable: true,
        value: { min: 0, max: 360 },
        direction: 'random',
        animation: {
          enable: true,
          speed: { min: 5, max: 15 },
          sync: false,
        },
      },

      // ── WOBBLE — side-to-side sway changing mid-fall ─────────
      wobble: {
        enable: true,
        distance: { min: 8, max: 22 },
        speed: { min: 3, max: 8 },
      },

      // ── ROLL — leaf flipping over as it falls ────────────────
      roll: {
        enable: true,
        speed: { min: 4, max: 10 },
        light: {
          enable: true,
          color: '#5a8040',
          length: 8,
        },
        backColor: '#1a2d10',
        darken: { enable: true, value: 25 },
      },

      // ── LIFE — leaves persist at bottom before fading ────────
      life: {
        count: 1,
        duration: {
          sync: false,
          value: { min: 8, max: 14 }, // seconds alive total
        },
      },

      // ── FADE OUT when life ends ──────────────────────────────
      destroy: {
        mode: 'split',
        split: {
          count: 1,
          factor: { value: 1 },
          rate: { value: 1 },
          particles: {
            opacity: {
              value: 0,
              animation: {
                enable: true,
                speed: 0.3,
                sync: true,
                startValue: 'max',
                destroy: 'min',
              },
            },
            move: { enable: false }, // pile stays still
            size: { value: 0, animation: { enable: false } },
          },
        },
      },
    },
  }

  return (
    <Particles
      id="falling-leaves"
      options={options}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  )
}