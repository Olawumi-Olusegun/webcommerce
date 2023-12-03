import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Notification from '@components/Notification'
import AuthSession from '@components/AuthSession'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Next Ecommerce',
  description: 'A next geration ecommerce application built with next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    
    <html lang="en">
      <AuthSession>
        <body className={inter.className}>
          {children}
          <Notification />
        </body>
      </AuthSession>
    </html>
  )
}
