/**
 * Middleware for route protection
 * Handles authentication and authorization for protected routes
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export default async function proxy(req) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

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
              headers: req.headers,
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
              headers: req.headers,
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

  // Get user - using getUser() for secure authentication
  // In middleware, we need to verify the session is authentic
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  const url = req.nextUrl.clone()

  // Protect admin routes
  if (url.pathname.startsWith('/admin')) {
    if (!user || error) {
      // Not authenticated - redirect to login
      url.pathname = '/login'
      url.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Check if user has admin role
    // You can enhance this by checking a database table or user metadata
    const isAdmin = user.user_metadata?.role === 'admin' ||
                    user.email?.includes('admin@justcars.ng')

    if (!isAdmin) {
      // Authenticated but not admin - redirect to home
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

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
