const express = require('express')
const cors = require('cors')
const path = require('path')
const crypto = require('crypto')
const {
  closeStorage,
  createRsvp,
  createWish,
  ensureStorage,
  initializeStorage,
  listRsvps,
  listWishes,
  usePostgres
} = require('./storage')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(async (_req, res, next) => {
  try {
    await ensureStorage()
    next()
  } catch (error) {
    console.error('Could not initialize application storage.', error)
    res.status(503).json({ error: 'Application storage is unavailable.' })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true, storage: usePostgres ? 'postgres' : 'local-json' }))

app.post('/api/rsvp', async (req, res) => {
  const { name, attendance, guests = 1, message = '' } = req.body || {}
  if (typeof name !== 'string' || !name.trim() || !['yes', 'no'].includes(attendance)) {
    return res.status(400).json({ error: 'A name and valid attendance response are required.' })
  }
  if (typeof message !== 'string') {
    return res.status(400).json({ error: 'The message must be text.' })
  }
  const record = {
    id: `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    name: name.trim().slice(0, 120),
    attendance,
    guests: Math.max(1, Math.min(20, Number(guests) || 1)),
    message: message.trim().slice(0, 1000),
    createdAt: new Date().toISOString()
  }
  try {
    const saved = await createRsvp(record)
    res.status(201).json({ ok: true, rsvp: saved.rsvp, wish: saved.wish })
  } catch (error) {
    console.error('Could not save RSVP.', error)
    res.status(500).json({ error: 'Could not save RSVP.' })
  }
})

app.get('/api/rsvp', async (req, res) => {
  const adminToken = process.env.RSVP_ADMIN_TOKEN
  const authorization = req.get('authorization') || ''
  const suppliedToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!adminToken) {
    return res.status(503).json({ error: 'RSVP administration is not configured.' })
  }
  const suppliedBuffer = Buffer.from(suppliedToken)
  const expectedBuffer = Buffer.from(adminToken)
  if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    return res.status(401).json({ error: 'Unauthorized.' })
  }
  try {
    const responses = await listRsvps()
    res.json({ count: responses.length, attending: responses.filter(r => r.attendance === 'yes').length, responses })
  } catch (error) {
    console.error('Could not read RSVP data.', error)
    res.status(500).json({ error: 'Could not read RSVP data.' })
  }
})

app.get('/api/guestbook', async (_req, res) => {
  try {
    const wishes = await listWishes()
    res.json({ count: wishes.length, wishes })
  } catch (error) {
    console.error('Could not read guestbook messages.', error)
    res.status(500).json({ error: 'Could not read guestbook messages.' })
  }
})

app.post('/api/guestbook', async (req, res) => {
  const { name, message } = req.body || {}
  if (typeof name !== 'string' || !name.trim() || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'A name and message are required.' })
  }
  const wish = {
    id: `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    name: name.trim().slice(0, 120),
    message: message.trim().slice(0, 1000),
    createdAt: new Date().toISOString()
  }
  try {
    const saved = await createWish(wish)
    res.status(201).json({ ok: true, wish: saved })
  } catch (error) {
    console.error('Could not save the guestbook message.', error)
    res.status(500).json({ error: 'Could not save the guestbook message.' })
  }
})

const dist = path.join(__dirname, '..', 'dist')
if (require.main === module && require('fs').existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

async function start() {
  try {
    await initializeStorage()
    const server = app.listen(PORT, () => console.log(`Wedding API running at http://localhost:${PORT}`))
    const shutdown = () => {
      server.close(async error => {
        if (error) {
          console.error('Could not close the HTTP server cleanly.', error)
          process.exitCode = 1
        }
        try {
          await closeStorage()
        } catch (closeError) {
          console.error('Could not close the database connection pool.', closeError)
          process.exitCode = 1
        }
      })
    }
    process.once('SIGINT', shutdown)
    process.once('SIGTERM', shutdown)
  } catch (error) {
    console.error('Could not start the wedding API.', error)
    await closeStorage()
    process.exitCode = 1
  }
}

if (require.main === module) {
  start()
} else {
  module.exports = app
}
