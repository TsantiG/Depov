import Link from "next/link"
import Image from "next/image"
import styles from "./page.module.css"



export default function Home() {
  const currentYear = new Date().getFullYear()

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Sistema de Alerta de Emergencia</h1>
          <p className={styles.subtitle}>
            Protegiendo a los ciudadanos de Medellín con tecnología de punta para respuestas rápidas ante emergencias.
          </p>
          <div className={styles.heroCta}>
            <Link href="/register" className={styles.primaryButton}>
              Registrarse
            </Link>
            <Link href="/about" className={styles.secondaryButton}>
              Conocer más
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fondo-ESJ5BEbajD2CYMPrKvihnWmbZLmXVc.png"
            alt="Escudos DEPOV"
            width={600}
            height={600}
            priority
            className={styles.responsiveImage}
          />
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
        <p className={styles.sectionDescription}>
          Nuestro sistema permite a los ciudadanos enviar alertas de emergencia en tiempo real, que son recibidas por
          las autoridades competentes para una respuesta rápida y efectiva.
        </p>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3>Alertas en Tiempo Real</h3>
            <p>Envía alertas que son recibidas inmediatamente por las autoridades.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3>Geolocalización</h3>
            <p>Tu ubicación exacta es enviada junto con la alerta para una respuesta más rápida.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3>Seguimiento</h3>
            <p>Recibe actualizaciones sobre el estado de tu alerta y la respuesta de las autoridades.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </div>
            <h3>Múltiples Canales</h3>
            <p>Las alertas se envían a través de múltiples canales para garantizar su recepción.</p>
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>1,000,000+</span>
          <span className={styles.statLabel}>Usuarios Registrados</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>5,480+</span>
          <span className={styles.statLabel}>Alertas Procesadas</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>98%</span>
          <span className={styles.statLabel}>Tasa de Respuesta</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>24/7</span>
          <span className={styles.statLabel}>Disponibilidad</span>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>¿Listo para estar más seguro?</h2>
        <p>Únete a miles de ciudadanos que ya confían en nuestro sistema de alerta.</p>
        <Link href="/register" className={styles.ctaButton}>
          Registrarse Ahora
        </Link>
      </section>
    </div>
  )
}
