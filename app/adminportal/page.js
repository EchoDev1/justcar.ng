/**
 * Admin Portal Redirect
 * Redirects /adminportal to /admin
 */

import { redirect } from 'next/navigation'

export default function AdminPortalRedirect() {
  redirect('/admin')
}
