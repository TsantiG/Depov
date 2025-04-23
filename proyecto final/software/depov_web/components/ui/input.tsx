import React from "react"
import styles from "./input.module.css"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = "", error, ...props }, ref) => {
  return (
    <div className={styles.inputWrapper}>
      <input className={`${styles.input} ${error ? styles.error : ""} ${className}`} ref={ref} {...props} />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  )
})
Input.displayName = "Input"

