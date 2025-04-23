"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import styles from "./toast.module.css"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

type ToastContextType = {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id">) => void
  removeToast: (id: string) => void
}

// Crear un valor por defecto para el contexto
const defaultToastContext: ToastContextType = {
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
}

const ToastContext = createContext<ToastContextType>(defaultToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, ...toast }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  return context
}

function Toast({ id, title, description, action, variant = "default" }: ToastProps) {
  const { removeToast } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [id, removeToast])

  return (
    <div className={`${styles.toast} ${variant === "destructive" ? styles.destructive : ""}`}>
      <div>
        {title && <div className={styles.toastTitle}>{title}</div>}
        {description && <div className={styles.toastDescription}>{description}</div>}
      </div>
      {action && <div className={styles.toastAction}>{action}</div>}
      <button className={styles.toastClose} onClick={() => removeToast(id)}>
        ✕
      </button>
    </div>
  )
}

// Componente separado para mostrar los toasts
function ToastViewport() {
  const { toasts } = useToast()

  return (
    <div className={styles.toastViewport}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}

// Componente Toaster que se exporta para usar en layout.tsx
export function Toaster() {
  // Este componente ahora solo renderiza el ToastProvider
  return null
}

