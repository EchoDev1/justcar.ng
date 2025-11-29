/**
 * Root Layout for JustCars.ng
 * Wraps all pages with common HTML structure
 */

import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp'
import ScrollProgressBar from '@/components/ui/ScrollProgressBar'
import NewArrivalToast from '@/components/ui/NewArrivalToast'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

export const metadata = {
  title: 'JustCars.ng - Buy Quality Cars in Nigeria',
  description: 'Find your dream car in Nigeria. Browse verified cars from trusted dealers across Lagos, Abuja, Port Harcourt and more.',
  keywords: 'cars for sale Nigeria, buy cars Lagos, Nigerian used cars, foreign used cars, car dealership Nigeria',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#3B82F6',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <ScrollProgressBar />
            <Header />
            <main className="flex-1 pb-20 md:pb-0">
              {children}
            </main>
            <Footer />
            <BottomNav />
            <FloatingWhatsApp />
            <NewArrivalToast />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
