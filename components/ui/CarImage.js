/**
 * Car Image Component with Enhanced Error Handling
 * Provides fallback placeholder and retry logic
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'

const PLACEHOLDER_IMAGE = '/images/placeholder-car.svg'

export default function CarImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes
}) {
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER_IMAGE)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(PLACEHOLDER_IMAGE)
    }
  }

  const handleLoad = () => {
    setHasError(false)
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUIyNTMyIi8+PC9zdmc+"
      onError={handleError}
      onLoad={handleLoad}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      unoptimized={hasError}
    />
  )
}
