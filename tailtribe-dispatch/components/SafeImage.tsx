'use client'

import Image, { type ImageProps } from 'next/image'
import { useEffect, useMemo, useState } from 'react'

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src: string
  fallbackSrc: string
}

export function SafeImage({ src, fallbackSrc, onError, ...rest }: SafeImageProps) {
  const resolvedFallback = useMemo(() => fallbackSrc, [fallbackSrc])
  const initialSrc = src || resolvedFallback
  const [currentSrc, setCurrentSrc] = useState(initialSrc)
  const [didFallback, setDidFallback] = useState(false)

  useEffect(() => {
    setCurrentSrc(src || resolvedFallback)
    setDidFallback(false)
  }, [src, resolvedFallback])

  return (
    <Image
      {...rest}
      src={currentSrc}
      onError={(event) => {
        if (!didFallback && resolvedFallback && currentSrc !== resolvedFallback) {
          setDidFallback(true)
          setCurrentSrc(resolvedFallback)
        }
        onError?.(event)
      }}
    />
  )
}
