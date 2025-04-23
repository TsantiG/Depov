"use client"

import { useEffect } from "react"

// Este componente no renderiza nada visible, solo actualiza el año si es necesario
export default function YearUpdater() {
  useEffect(() => {
    const checkYear = () => {
      const yearElement = document.querySelector("[data-year]")
      if (yearElement) {
        const currentYear = new Date().getFullYear().toString()
        if (yearElement.textContent !== currentYear) {
          yearElement.textContent = currentYear
        }
      }
    }

    // Verificar inmediatamente
    checkYear()

    // Configurar un intervalo para verificar cada hora
    const interval = setInterval(checkYear, 1000 * 60 * 60)

    return () => clearInterval(interval)
  }, [])

  return null
}
