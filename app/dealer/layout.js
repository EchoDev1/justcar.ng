/**
 * Dealer Layout
 * Server component wrapper for viewport control + client auth layout
 */

import DealerLayoutClient from '@/components/dealer/DealerLayoutClient'

export const metadata = {
  title: 'Dealer Portal | JustCars.ng',
  description: 'Manage your car dealership'
}

export const viewport = {
  width: 1024,
  themeColor: '#3B82F6',
}

export default function DealerLayout({ children }) {
  return <DealerLayoutClient>{children}</DealerLayoutClient>
}
