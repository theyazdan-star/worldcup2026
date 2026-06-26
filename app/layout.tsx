import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'جام جهانی ۲۰۲۶ | پیش‌بینی',
  description: 'پیش‌بینی نتایج جام جهانی ۲۰۲۶',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
