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

  if (saJson) {
    try {
      const cred = JSON.parse(saJson)
      app = admin.initializeApp({ credential: admin.credential.cert(cred) })
      return admin
    } catch (e) {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON')
      throw e
    }
  }
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin env: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (or FIREBASE_SERVICE_ACCOUNT_JSON)')
  }
  app = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey })
  })
  return admin
}

export function getFirestore () {
  return getAdmin().firestore()
}

export function getAuth () {
  return getAdmin().auth()
}

export { COLLECTIONS }
