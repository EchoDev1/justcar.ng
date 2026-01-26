/**
 * Admin Dealers List Page
 * View and manage all dealers with bulk actions
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import DealersListWithBulk from '@/components/admin/DealersListWithBulk'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDealers() {
  try {
    // CRITICAL: Use service role client to bypass RLS for admin access
    const supabase = createServiceRoleClient()

    const { data: dealers, error } = await supabase
      .from('dealers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching dealers:', error)
      return []
    }

    return dealers || []
  } catch (error) {
    console.error('Fatal error fetching dealers:', error)
    return []
  }
}

export default async function DealersListPage() {
  const dealers = await getDealers()

  return <DealersListWithBulk initialDealers={dealers} />
}
