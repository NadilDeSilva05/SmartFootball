/**
 * Firebase client SDK – for auth and optional Firestore in the browser.
 * Use only in client components (the NEXT_PUBLIC_ vars are required).
 */
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

let app
let auth

export function getFirebaseAuth () {
  if (typeof window === 'undefined') return null
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null
  if (!app) app = initializeApp(firebaseConfig)
  if (!auth) auth = getAuth(app)
  return auth
}
