// Next Imports
import { NextResponse } from 'next/server'

// Redirect root to login on initial load.
const HOME_PAGE_URL = '/login'

export default function middleware(request) {
  const pathname = request.nextUrl.pathname

  if (pathname === '/') {
    return NextResponse.redirect(new URL(HOME_PAGE_URL, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|next.svg|vercel.svg).*)']
}
