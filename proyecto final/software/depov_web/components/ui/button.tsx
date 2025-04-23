import React from "react"
import styles from "./button.module.css"
import Image from "next/image"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost" | "shield"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
  showLogo?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = "", 
    variant = "primary", 
    size = "default", 
    asChild = false, 
    showLogo = false,
    children, 
    ...props 
  }, ref) => {
    const Comp = asChild ? "span" : "button"

    const buttonClasses = [
      styles.button, 
      styles[variant], 
      size !== "default" ? styles[size] : "", 
      showLogo ? styles.logoButton : "",
      className
    ].filter(Boolean).join(" ")

    return (
      <Comp className={buttonClasses} ref={ref} {...props}>
        {showLogo ? (
          <div className={styles.logoContainer}>
            <Image 
              src="/images/logo.png" 
              alt="DEPOV Shield Logo" 
              fill 
              className={styles.logoImage}
              priority
            />
            {children && <span className={styles.logoText}>{children}</span>}
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  },
)

Button.displayName = "Button"
