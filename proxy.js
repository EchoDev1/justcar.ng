/**
 * Middleware for route protection
 * Handles authentication and authorization for protected routes
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export default async function proxy(req) {
  // Add pathname to request headers so layouts can access it
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', req.nextUrl.pathname)

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const url = req.nextUrl.clone()

  // For admin routes, skip Supabase checks in middleware
  // The admin layout handles all authentication and authorization
  // This eliminates 700ms+ of overhead from calling Supabase on every request
  if (url.pathname.startsWith('/admin')) {
    // Just pass through - let the layout handle authentication
    return response
  }

  // Only create Supabase client for non-admin routes that need it
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get user - only for buyer routes now
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  // Protect buyer routes
  if (url.pathname.startsWith('/buyer') && !url.pathname.startsWith('/buyer/auth')) {
    if (!user || error) {
      // Not authenticated - redirect to buyer auth
      url.pathname = '/buyer/auth'
      url.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  // If user is authenticated and tries to access login/auth pages, redirect appropriately
  if (user && !error && (url.pathname === '/login' || url.pathname === '/buyer/auth')) {
    const isAdmin = user.user_metadata?.role === 'admin' ||
                    user.email?.includes('admin@justcars.ng')

    const redirectPath = req.nextUrl.searchParams.get('redirect')
    if (redirectPath) {
      url.pathname = redirectPath
      url.searchParams.delete('redirect')
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from login pages
    url.pathname = isAdmin ? '/admin' : '/buyer/saved'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/buyer/:path*', '/login', '/buyer/auth'],
}
