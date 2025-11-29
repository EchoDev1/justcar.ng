/**
 * Animated Counter Component
 * Counts up from 0 to target value with smooth animation
 */

'use client'

import { useEffect, useState, useRef, memo, useCallback } from 'react'

function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  separator = '',
  decimals = 0
}) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const counterRef = useRef(null)

  useEffect(() => {
    // Intersection Observer to trigger animation when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (counterRef.current) {
      observer.observe(counterRef.current)
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime = null
    const startValue = 0
    const endValue = end

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.floor(easeOut * (endValue - startValue) + startValue)

      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(endValue)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  // Format number with separators (commas) - memoized for performance
  const formatNumber = useCallback((num) => {
    if (separator === ',') {
      return num.toLocaleString('en-US')
    }
    return num.toFixed(decimals)
  }, [separator, decimals])

  return (
    <span ref={counterRef} className="counter-number">
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
}

export default memo(AnimatedCounter)
