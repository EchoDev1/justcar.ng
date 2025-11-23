'use client'

import { useEffect, useRef, useState } from 'react'

export default function FadeInSection({ children, delay = 0, className = '' }) {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add delay before triggering animation
            setTimeout(() => {
              setIsVisible(true)
            }, delay)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const currentElement = domRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [delay])

  return (
    <div
      ref={domRef}
      className={`fade-in-section ${isVisible ? 'fade-in-visible' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
