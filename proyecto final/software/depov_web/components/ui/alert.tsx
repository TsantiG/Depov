import React from "react"
import styles from "./alert.module.css"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning"
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    return <div ref={ref} role="alert" className={`${styles.alert} ${styles[variant]} ${className}`} {...props} />
  },
)
Alert.displayName = "Alert"

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(({ className = "", ...props }, ref) => {
  return <h5 ref={ref} className={`${styles.title} ${className}`} {...props} />
})
AlertTitle.displayName = "AlertTitle"

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className = "", ...props }, ref) => {
    return <div ref={ref} className={`${styles.description} ${className}`} {...props} />
  },
)
AlertDescription.displayName = "AlertDescription"

