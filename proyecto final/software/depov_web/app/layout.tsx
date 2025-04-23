import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import NavBar from "@/components/nav-bar"
import { ToastProvider } from "@/components/ui/toaster"
import Footer from "@/components/ui/footer"
import YearUpdater from "@/components/ui/year-updater"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Alerta de Emergencia - Medellín",
  description: "Sistema de alerta de emergencia para la ciudad de Medellín, Colombia",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ToastProvider>
          <NavBar />
          <main>{children}</main>
          <Footer />
        </ToastProvider>
        <YearUpdater />
      </body>
    </html>
  )
}
