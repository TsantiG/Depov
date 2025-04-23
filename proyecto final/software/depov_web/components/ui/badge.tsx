import type React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark"
  pill?: boolean
}

export function Badge({ children, className = "", variant = "primary", pill = false, ...props }: BadgeProps) {
  const badgeClass = `badge bg-${variant} ${pill ? "rounded-pill" : ""} ${className}`

  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  )
}

