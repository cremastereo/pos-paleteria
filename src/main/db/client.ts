import { PGlite } from '@electric-sql/pglite'
import { sql } from 'drizzle-orm'
import { drizzle, type PgliteDatabase } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { app } from 'electron'
import { join } from 'node:path'
import * as schema from './schema'

let client: PGlite | null = null
let database: PgliteDatabase<typeof schema> | null = null

function migrationsFolder() {
  if (app.isPackaged) return join(process.resourcesPath, 'migrations')
  return join(app.getAppPath(), 'src/main/db/migrations')
}

export async function openDatabase() {
  const dataDir = join(app.getPath('userData'), 'pglite')
  const next = new PGlite(dataDir)
  client = next
  try {
    await next.waitReady
    database = drizzle(next, { schema })
    await migrate(database, { migrationsFolder: migrationsFolder() })
  } catch (error) {
    await next.close().catch(() => undefined)
    client = null
    database = null
    throw error
  }
}

export function getDatabase() {
  if (!database) throw new Error('Database is not open')
  return database
}

export async function pingDatabase(): Promise<{ ok: true }> {
  await getDatabase().execute(sql`select 1`)
  return { ok: true }
}

export async function closeDatabase() {
  if (!client || client.closed) {
    client = null
    database = null
    return
  }
  await client.close()
  client = null
  database = null
}
