import Image from "next/image"
import type { CSSProperties } from "react"

interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  style?: CSSProperties
}

export default function ResponsiveImage({
  src,
  alt,
  className = "",
  priority = false,
  fill = false,
  width,
  height,
  sizes = "100vw",
  style,
}: ResponsiveImageProps) {
  // Si fill es true, no necesitamos width y height
  if (fill) {
    return (
      <div className={`relative ${className}`} style={{ width: "100%", height: "100%" }}>
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill={true}
          sizes={sizes}
          priority={priority}
          style={{ objectFit: "cover", ...style }}
        />
      </div>
    )
  }

  // Si no es fill, necesitamos width y height
  return (
    <div className={`relative ${className}`}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width || 1200}
        height={height || 800}
        sizes={sizes}
        priority={priority}
        style={{ width: "100%", height: "auto", ...style }}
      />
    </div>
  )
}

