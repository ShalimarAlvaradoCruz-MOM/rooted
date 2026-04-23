import { useState } from 'react'

export default function Carousel({ images }) {
  const [current, setCurrent] = useState(0)

  function prev() {
    setCurrent(i => (i === 0 ? images.length - 1 : i - 1))
  }

  function next() {
    setCurrent(i => (i === images.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-4">
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#603913]/[0.07] border border-[#603913]/15">
        <img
          src={images[current]}
          alt={`slide ${current + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#EEE8D2]/80 hover:bg-[#EEE8D2] text-[#603913] rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold transition-all"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#EEE8D2]/80 hover:bg-[#EEE8D2] text-[#603913] rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold transition-all"
        >
          ›
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'bg-[#603913] scale-125' : 'bg-[#603913]/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}