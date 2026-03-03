'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RefereePage () {
  const router = useRouter()
  useEffect(() => {
    router.replace('/referee/qr-scanner')
  }, [router])
  return null
}
