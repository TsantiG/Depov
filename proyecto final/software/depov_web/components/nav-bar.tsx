"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { getSession, logout } from "@/lib/auth-utils"
import styles from "./nav-bar.module.css"

export default function NavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const userSession = getSession()
    setSession(userSession)

    const checkSession = () => {
      const currentSession = getSession()
      setSession(currentSession)
    }

    window.addEventListener("focus", checkSession)

    return () => {
      window.removeEventListener("focus", checkSession)
    }
  }, [pathname])

  function handleLogout() {
    logout()
    setSession(null)
    router.push("/login")
  }

  function getDashboardLink() {
    if (!session) return "/dashboard"

    switch (session.userRole) {
      case "admin":
        return "/admin/dashboard"
      case "police":
        return "/police/dashboard"
      default:
        return "/dashboard"
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.bannerContainer}>
        {/* Imagen de fondo responsiva con Next/Image */}
        <Image
          src="/images/banner.png"
          alt="DEPOV Banner"
          fill
          sizes="100vw"
          quality={90}
          priority
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>
      <div className="container">
        <div className={styles.navbar}>
          <div className={styles.leftSection}>
            <Link href="/" className={styles.logo}>
              Sistema de Alerta de Emergencia
            </Link>

            {isClient && session && (
              <Link href={getDashboardLink()} className={styles.dashboardLink}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.dashboardIcon}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                Panel
              </Link>
            )}
          </div>

          {isClient && session ? (
            <div className={styles.userSection}>
              <span className={styles.userName}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.userIcon}
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {session.userName}
                {session.userRole === "admin" && <span className={styles.roleBadge}>Administrador</span>}
                {session.userRole === "police" && <span className={styles.roleBadge}>Policía</span>}
              </span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.logoutIcon}
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link href="/login" className={styles.navLink}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.navIcon}
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Iniciar Sesión
              </Link>
              <Link href="/register" className={styles.navLink}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.navIcon}
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

