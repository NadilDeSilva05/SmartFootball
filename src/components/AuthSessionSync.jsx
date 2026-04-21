'use client'

import { useEffect } from 'react'
import { onIdTokenChanged } from 'firebase/auth'
import { useDispatch } from 'react-redux'
import { getFirebaseAuth } from '@/lib/firebase-client'
import { logout, markAuthInitialized, syncAuthSession } from '@/redux/slices/authenticationSlice'

const AuthSessionSync = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const auth = getFirebaseAuth()

    if (!auth) {
      dispatch(markAuthInitialized())

      return undefined
    }

    const unsubscribe = onIdTokenChanged(auth, async user => {
      if (!user) {
        dispatch(logout())

        return
      }

      try {
        await dispatch(syncAuthSession({ firebaseUser: user })).unwrap()
      } catch {
        if (auth.currentUser) {
          try {
            await dispatch(syncAuthSession({ firebaseUser: auth.currentUser, forceRefresh: true })).unwrap()
            return
          } catch {}
        }

        dispatch(markAuthInitialized())
      }
    })

    return () => unsubscribe()
  }, [dispatch])

  return null
}

export default AuthSessionSync
