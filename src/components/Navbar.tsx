'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Printer, Settings } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const links = [
    { href: '/', label: 'Data Siswa', icon: Users },
    { href: '/cetak', label: 'Cetak', icon: Printer },
    { href: '/admin', label: 'Pengaturan', icon: Settings },
  ]
  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 flex items-center justify-between h-14">
        <span className="font-display font-bold text-red-600 text-base sm:text-lg tracking-tight whitespace-nowrap">
          🎓 <span className="hidden xs:inline">TKQu </span>Alifatma-Betet
        </span>
        <div className="flex items-center gap-0.5 sm:gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                pathname === href
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
