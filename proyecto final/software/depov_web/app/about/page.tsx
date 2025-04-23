"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import styles from "./page.module.css"
import { Button } from "@/components/ui/button"
import Footer from "@/components/ui/footer"
import { ArrowLeft, Play, Pause, VolumeX, Volume2 } from "lucide-react"

export default function About() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Función para intentar activar el audio automáticamente
  const attemptAutoplay = async () => {
    if (videoRef.current) {
      try {
        // Primero intentamos reproducir con audio
        videoRef.current.muted = false
        await videoRef.current.play()
        setIsMuted(false)
        setIsPlaying(true)
        console.log("Reproducción con audio exitosa")
      } catch (error) {
        console.log("No se pudo reproducir con audio, intentando silenciado:", error)

        try {
          // Si falla, intentamos reproducir silenciado
          videoRef.current.muted = true
          await videoRef.current.play()
          setIsMuted(true)
          setIsPlaying(true)
          console.log("Reproducción silenciada exitosa")
        } catch (secondError) {
          console.log("No se pudo reproducir el video:", secondError)
        }
      }
    }
  }

  useEffect(() => {
    // Intentar reproducir el video cuando se carga la página
    attemptAutoplay()

    // Agregar un detector de eventos para activar el audio después de la interacción
    const handleUserInteraction = () => {
      if (!hasInteracted && videoRef.current && videoRef.current.muted) {
        setHasInteracted(true)

        // Intentar activar el audio después de la interacción
        videoRef.current.muted = false
        setIsMuted(false)

        // Eliminar los event listeners después de la primera interacción
        document.removeEventListener("click", handleUserInteraction)
        document.removeEventListener("keydown", handleUserInteraction)
        document.removeEventListener("touchstart", handleUserInteraction)
      }
    }

    // Agregar event listeners para detectar interacción del usuario
    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)

    // Limpiar event listeners
    return () => {
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
    }
  }, [hasInteracted])

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className={styles.container} onClick={() => setHasInteracted(true)}>
      

      <main className={styles.main}>
        <div className={styles.videoWrapper}>
          <video
            ref={videoRef}
            className={styles.video}
            controls
            preload="auto"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src="/images/output_free.mp4" type="video/mp4" />
            Tu navegador no soporta la reproducción de videos.
          </video>

          {isMuted && (
            <div className={styles.mutedOverlay} onClick={toggleMute}>
              <Volume2 size={32} />
              <span>Haz clic para activar el sonido</span>
            </div>
          )}
        </div>

        <div className={styles.videoInfo}>
          <h2 className={styles.videoTitle}>Información del Sistema de Alerta</h2>
          <p className={styles.videoDescription}>
            Este video explica cómo funciona nuestro Sistema de Alerta de Emergencia, diseñado para proteger a los
            ciudadanos de Medellín con tecnología de punta para respuestas rápidas ante emergencias.
          </p>

          <div className={styles.buttonContainer}>
            

          
          </div>
        </div>
      </main>

      
    </div>
  )
}
