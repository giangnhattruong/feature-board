import type { Metadata } from "next"
import { Manrope, Inter } from "next/font/google"
import "./globals.css"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { SidebarProvider } from "./sidebar-context"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
  preload: true,
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Feature Board",
  description: "Submit and vote on feature requests",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-screen flex bg-surface-dim">
        <SidebarProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 md:ml-64">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <footer className="w-full border-t border-outline-variant/20 mt-auto">
              <div className="max-w-3xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant font-body">
                <span>Built by Truong Giang — MVP Builder for Non-Technical Founders</span>
                <a
                  href="https://www.upwork.com/freelancers/~01fe60f85903527def?mp_source=share"
                  target="_blank"
                  className="text-primary hover:text-primary-container transition-colors font-medium"
                >
                  Upwork Profile →
                </a>
              </div>
            </footer>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
