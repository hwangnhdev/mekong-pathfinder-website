import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-be-vietnam',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mekong Pathfinder | Giải pháp đô thị bền vững',
  description: 'Phát hiện điểm ngập theo thời gian thực, cảnh báo sớm và tối ưu lộ trình bằng AI — giúp người dân Cần Thơ và toàn vùng Mekong di chuyển an toàn mùa mưa.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={beVietnamPro.variable} suppressHydrationWarning>
      <body style={{ fontFamily: 'var(--font-be-vietnam), sans-serif' }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}