const fs = require('fs/promises')
const path = require('path')
const { Pool } = require('pg')

const DATA_DIR = path.join(__dirname, 'data')
const RSVP_FILE = path.join(DATA_DIR, 'rsvps.json')
const GUESTBOOK_FILE = path.join(DATA_DIR, 'guestbook.json')
const SCHEMA_FILE = path.join(__dirname, 'schema.sql')
const usePostgres = Boolean(process.env.DATABASE_URL)
const pool = usePostgres
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.PG_POOL_MAX) || 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.PGSSL === 'true'
        ? { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false' }
        : undefined
    })
  : null
let initialization

async function initializeStorage() {
  if (usePostgres) {
    if (process.env.VERCEL !== '1') {
      const schema = await fs.readFile(SCHEMA_FILE, 'utf8')
      await pool.query(schema)
    }
    await pool.query('SELECT 1')
    console.log(process.env.VERCEL === '1'
      ? 'PostgreSQL connection is ready.'
      : 'PostgreSQL storage is ready.')
    return
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required when NODE_ENV=production.')
  }

  await fs.mkdir(DATA_DIR, { recursive: true })
  for (const file of [RSVP_FILE, GUESTBOOK_FILE]) {
    try {
      await fs.access(file)
    } catch {
      await fs.writeFile(file, '[]')
    }
  }
  console.log('Using local JSON storage. Set DATABASE_URL to enable PostgreSQL.')
}

function ensureStorage() {
  if (!initialization) {
    initialization = initializeStorage().catch(error => {
      initialization = undefined
      throw error
    })
  }
  return initialization
}

function recordFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    attendance: row.attendance,
    guests: row.guests,
    message: row.message,
    createdAt: row.created_at.toISOString()
  }
}

function wishFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: row.created_at.toISOString()
  }
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'))
}

async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2))
}

async function createRsvp({ id, name, attendance, guests, message, createdAt }) {
  if (usePostgres) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const { rows } = await client.query(
        `INSERT INTO wedding_rsvps (id, name, attendance, guests, message, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, attendance, guests, message, created_at`,
        [id, name, attendance, guests, message, createdAt]
      )
      let wish = null
      if (message) {
        const wishResult = await client.query(
          `INSERT INTO wedding_guestbook (id, name, message, created_at)
           VALUES ($1, $2, $3, $4)
           RETURNING id, name, message, created_at`,
          [`${id}-wish`, name, message, createdAt]
        )
        wish = wishFromRow(wishResult.rows[0])
      }
      await client.query('COMMIT')
      return { rsvp: recordFromRow(rows[0]), wish }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
  const records = await readJson(RSVP_FILE)
  const rsvp = { id, name, attendance, guests, message, createdAt }
  records.push(rsvp)
  await writeJson(RSVP_FILE, records)
  let wish = null
  if (message) {
    const wishes = await readJson(GUESTBOOK_FILE)
    wish = { id: `${id}-wish`, name, message, createdAt }
    wishes.push(wish)
    await writeJson(GUESTBOOK_FILE, wishes)
  }
  return { rsvp, wish }
}

async function listRsvps() {
  if (usePostgres) {
    const { rows } = await pool.query(
      'SELECT id, name, attendance, guests, message, created_at FROM wedding_rsvps ORDER BY created_at ASC'
    )
    return rows.map(recordFromRow)
  }
  return readJson(RSVP_FILE)
}

async function createWish({ id, name, message, createdAt }) {
  if (usePostgres) {
    const { rows } = await pool.query(
      `INSERT INTO wedding_guestbook (id, name, message, created_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, message, created_at`,
      [id, name, message, createdAt]
    )
    return wishFromRow(rows[0])
  }
  const wishes = await readJson(GUESTBOOK_FILE)
  wishes.push({ id, name, message, createdAt })
  await writeJson(GUESTBOOK_FILE, wishes)
  return wishes[wishes.length - 1]
}

async function listWishes() {
  if (usePostgres) {
    const { rows } = await pool.query(
      'SELECT id, name, message, created_at FROM wedding_guestbook ORDER BY created_at ASC'
    )
    return rows.map(wishFromRow)
  }
  return readJson(GUESTBOOK_FILE)
}

async function importLegacyJson() {
  if (!usePostgres) throw new Error('Set DATABASE_URL before importing JSON data.')
  const [rsvps, wishes] = await Promise.all([
    readJson(RSVP_FILE).catch(error => error.code === 'ENOENT' ? [] : Promise.reject(error)),
    readJson(GUESTBOOK_FILE).catch(error => error.code === 'ENOENT' ? [] : Promise.reject(error))
  ])
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const rsvp of rsvps) {
      await client.query(
        `INSERT INTO wedding_rsvps (id, name, attendance, guests, message, created_at)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [String(rsvp.id), rsvp.name, rsvp.attendance, rsvp.guests, rsvp.message || '', rsvp.createdAt]
      )
    }
    for (const wish of wishes) {
      await client.query(
        `INSERT INTO wedding_guestbook (id, name, message, created_at)
         VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [String(wish.id), wish.name, wish.message, wish.createdAt]
      )
    }
    await client.query('COMMIT')
    return { rsvps: rsvps.length, wishes: wishes.length }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function closeStorage() {
  if (pool) await pool.end()
}

module.exports = {
  closeStorage,
  createRsvp,
  createWish,
  ensureStorage,
  importLegacyJson,
  initializeStorage,
  listRsvps,
  listWishes,
  usePostgres
}
