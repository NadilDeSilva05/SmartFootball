/**
 * Firebase Admin SDK – use only in server code (API routes, server components).
 * Requires env: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * Or FIREBASE_SERVICE_ACCOUNT_JSON (full JSON string) for Vercel/single env.
 */
import admin from 'firebase-admin'
import { COLLECTIONS } from './firestore-collections'

let app
function getAdmin () {
  if (admin.apps.length) return admin
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

  const databaseURL = process.env.FIREBASE_DATABASE_URL || null

  if (saJson) {
    try {
      const cred = JSON.parse(saJson)
      const options = { credential: admin.credential.cert(cred) }
      if (databaseURL) options.databaseURL = databaseURL
      app = admin.initializeApp(options)
      return admin
    } catch (e) {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON')
      throw e
    }
  }
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin env: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (or FIREBASE_SERVICE_ACCOUNT_JSON)')
  }
  const options = { credential: admin.credential.cert({ projectId, clientEmail, privateKey }) }
  if (databaseURL) options.databaseURL = databaseURL
  app = admin.initializeApp(options)
  return admin
}

export function getFirestore () {
  return getAdmin().firestore()
}

/** Returns Firebase Realtime Database (optional). Set FIREBASE_DATABASE_URL in env, e.g. https://PROJECT_ID-default-rtdb.firebaseio.com */
export function getDatabase () {
  const adminInstance = getAdmin()
  if (!adminInstance.app().options.databaseURL) return null
  return adminInstance.database()
}

export function getAuth () {
  return getAdmin().auth()
}

export { COLLECTIONS }
