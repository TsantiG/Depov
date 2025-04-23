import React from "react"
import styles from "./card.module.css"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className = "", ...props }, ref) => {
  return <div ref={ref} className={`${styles.card} ${className}`} {...props} />
})
Card.displayName = "Card"

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ className = "", ...props }, ref) => {
  return <div ref={ref} className={`${styles.header} ${className}`} {...props} />
})
CardHeader.displayName = "CardHeader"

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className = "", ...props }, ref) => {
  return <div ref={ref} className={`${styles.content} ${className}`} {...props} />
})
CardContent.displayName = "CardContent"

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({ className = "", ...props }, ref) => {
  return <div ref={ref} className={`${styles.footer} ${className}`} {...props} />
})
CardFooter.displayName = "CardFooter"

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(({ className = "", ...props }, ref) => {
  return <h3 ref={ref} className={`${styles.title} ${className}`} {...props} />
})
CardTitle.displayName = "CardTitle"

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = "", ...props }, ref) => {
    return <p ref={ref} className={`${styles.description} ${className}`} {...props} />
  },
)
CardDescription.displayName = "CardDescription"

