import dynamic from "next/dynamic"
import styles from "./footer.module.css"

// Componente de respaldo para el servidor
function FooterFallback() {
  return (
    <div className={styles.footer} suppressHydrationWarning>
      <div className={styles.footerContentReorganized}>
        <div className={styles.footerSectionLeft}>
          <h3 className={styles.footerTitle}>Contacto</h3>
        </div>
        <div className={styles.footerSectionCenter}></div>
        <div className={styles.footerSectionRight}>
          <h3 className={styles.footerTitle}>Sobre DEPOV</h3>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p className={styles.copyright}>© DEPOV - Sistema de Alerta de Emergencia. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}

// Importar dinámicamente el componente del cliente con ssr: false
const FooterClient = dynamic(() => import("./footer-client"), {
  ssr: false,
  loading: FooterFallback,
})

export default function Footer() {
  return <FooterClient />
}
