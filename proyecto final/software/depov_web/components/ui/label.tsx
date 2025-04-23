import React from "react"
import styles from "./label.module.css"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", required = false, ...props }, ref) => {
    return <label ref={ref} className={`${styles.label} ${required ? styles.required : ""} ${className}`} {...props} />
  },
)
Label.displayName = "Label"

