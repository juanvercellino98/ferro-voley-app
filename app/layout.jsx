import './globals.css'

export const metadata = {
  title: 'Ferro Vóley PF',
  description: 'Preparación Física Ferro Vóley',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#a3e635',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />

        <link
          rel="apple-touch-icon"
          href="/icon-192.png"
        />

        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black"
        />
      </head>

      <body>{children}</body>
    </html>
  )
}