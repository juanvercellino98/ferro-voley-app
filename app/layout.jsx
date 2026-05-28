import './globals.css'

export const metadata = {
  title: 'Ferro Vóley - Preparación Física App',
  description: 'App interna para preparación física de Ferro Vóley',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
