import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDxOOKDrFfCGBRENNSsFTmau0v7U144vrw',
  authDomain: 'sanctuarybasev2.firebaseapp.com',
  projectId: 'sanctuarybasev2',
  storageBucket: 'sanctuarybasev2.firebasestorage.app',
  messagingSenderId: '701865805759',
  appId: '1:701865805759:web:592f9bd6445520018e830a',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Offline persistence: reads serve from the local IndexedDB cache when
// there's no connection, and writes queue locally and sync automatically
// once connectivity returns. This is field staff's actual use case — a
// barn or kennel with a dead signal shouldn't lose a feeding log or
// medical entry, and the SDK handles the queue/replay itself rather than
// needing a hand-rolled one per feature. persistentMultipleTabManager lets
// more than one open tab share the same cache instead of one tab locking it.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

export { auth, db }
