// Firestore backup — dumps every root collection (including subcollections)
// to timestamped JSON files under backups/, and prunes backups older than 30 days.
//
// Requires a service account key:
//   1. Firebase console → Project settings → Service accounts → Generate new private key
//   2. Save it as serviceAccountKey.json in the project root (it's gitignored)
// Run manually:  node scripts/backupFirestore.mjs
// Schedule daily: powershell scripts/setup-backup-schedule.ps1
import { readFileSync, mkdirSync, writeFileSync, readdirSync, rmSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import admin from 'firebase-admin'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || join(root, 'serviceAccountKey.json')
if (!existsSync(keyPath)) {
  console.error(`Service account key not found at ${keyPath}.\n` +
    'Download one from Firebase console → Project settings → Service accounts → Generate new private key,\n' +
    'and save it as serviceAccountKey.json in the project root.')
  process.exit(1)
}

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(readFileSync(keyPath, 'utf8'))) })
const db = admin.firestore()

const stamp = new Date().toISOString().slice(0, 10)
const outDir = join(root, 'backups', stamp)
mkdirSync(outDir, { recursive: true })

async function dumpDocs(docs) {
  const out = []
  for (const doc of docs) {
    const entry = { _id: doc.id, ...doc.data() }
    const subs = await doc.ref.listCollections()
    if (subs.length) {
      entry._subcollections = {}
      for (const sub of subs) {
        const subSnap = await sub.get()
        entry._subcollections[sub.id] = await dumpDocs(subSnap.docs)
      }
    }
    out.push(entry)
  }
  return out
}

const collections = await db.listCollections()
let totalDocs = 0
for (const col of collections) {
  const snap = await col.get()
  const data = await dumpDocs(snap.docs)
  totalDocs += snap.size
  writeFileSync(join(outDir, `${col.id}.json`), JSON.stringify(data, null, 1))
  console.log(`  ${col.id}: ${snap.size} docs`)
}
console.log(`Backup complete: ${collections.length} collections, ${totalDocs} docs → backups/${stamp}/`)

// Prune backups older than 30 days
const backupsRoot = join(root, 'backups')
const cutoff = Date.now() - 30 * 24 * 3600 * 1000
for (const name of readdirSync(backupsRoot)) {
  const d = new Date(name + 'T00:00:00')
  if (!isNaN(d) && d.getTime() < cutoff) {
    rmSync(join(backupsRoot, name), { recursive: true, force: true })
    console.log(`Pruned old backup: ${name}`)
  }
}
