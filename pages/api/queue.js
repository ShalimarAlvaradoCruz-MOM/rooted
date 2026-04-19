let queue = []
let played = []

export default function handler(req, res) {
  if (req.method === 'GET') {
    const pending = [...queue]
    queue = [] 
    return res.status(200).json({ pending, played })
  }

  if (req.method === 'POST') {
    const entry = req.body
    if (!entry?.id || !entry?.text || !entry?.prompt) {
      return res.status(400).json({ error: 'missing fields' })
    }
    queue.push(entry)
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { target } = req.body || {}
    if (target === 'queue') queue = []
    else if (target === 'played') played = []
    else { queue = []; played = [] }
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'PATCH') {
    const entry = req.body
    if (entry && !played.find(p => p.id === entry.id)) {
      played.push(entry)
    }
    return res.status(200).json({ ok: true })
  }

  res.status(405).end()
}