import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sertifikat TKQu Alifatma Bungin',
  description: 'Sistem Surat Keterangan Tamat Belajar TKQu Alifatma Bungin',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
