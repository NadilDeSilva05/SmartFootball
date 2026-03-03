/**
 * Firebase client SDK – for auth, Firestore (app data), and Realtime Database (IoT live metrics).
 * Use only in client components. Set NEXT_PUBLIC_FIREBASE_DATABASE_URL for RTDB (IoT metrics).
 */
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || undefined
}

let app
let auth
let db
let rtdb

export function getFirebaseAuth () {
  if (typeof window === 'undefined') return null
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null
  if (!app) app = initializeApp(firebaseConfig)
  if (!auth) auth = getAuth(app)
  return auth
}

export function getFirestoreClient () {
  if (typeof window === 'undefined') return null
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null
  if (!app) getFirebaseAuth()
  if (!app) return null
  if (!db) db = getFirestore(app)
  return db
}

/** Realtime Database – use for IoT player performance metrics (live_metrics). Requires NEXT_PUBLIC_FIREBASE_DATABASE_URL. */
export function getRealtimeDbClient () {
  if (typeof window === 'undefined') return null
  if (!firebaseConfig.databaseURL) return null
  if (!app) getFirebaseAuth()
  if (!app) return null
  if (!rtdb) rtdb = getDatabase(app)
  return rtdb
}
