import fs from 'fs'
import path from 'path'

const FILE = path.join('/tmp', 'rooted-queue.json')

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'))
  } catch {
    return { queue: [], played: [] }
  }
}

function save(data) {
  try {
    fs.writeFileSync(FILE, JSON.stringify(data))
  } catch (e) {
    console.error('save error', e)
  }
}

export default function handler(req, res) {
  const store = load()

  if (req.method === 'GET') {
    return res.status(200).json({ pending: store.queue, played: store.played })
  }

  if (req.method === 'POST') {
    const entry = req.body
    if (!entry?.id || !entry?.text || !entry?.prompt) {
      return res.status(400).json({ error: 'missing fields' })
    }
    store.queue.push(entry)
    save(store)
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { target } = req.body || {}
    if (target === 'queue') store.queue = []
    else if (target === 'played') store.played = []
    else { store.queue = []; store.played = [] }
    save(store)
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'PATCH') {
    const entry = req.body
    if (entry && !store.played.find(p => p.id === entry.id)) {
      store.played.push(entry)
    }
    save(store)
    return res.status(200).json({ ok: true })
  }

  res.status(405).end()
}