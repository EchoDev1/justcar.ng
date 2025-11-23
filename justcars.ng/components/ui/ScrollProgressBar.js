'use client'

import { useState, useEffect } from 'react'

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY

      // Calculate scroll percentage
      const totalScrollable = documentHeight - windowHeight
      const progress = (scrollTop / totalScrollable) * 100

      setScrollProgress(Math.min(progress, 100))
    }

    window.addEventListener('scroll', handleScroll)

    // Initial calculation
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="scroll-progress-container">
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}
