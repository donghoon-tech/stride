'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageSquare, BarChart2, Calendar } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()

  // Hide navigation on the login page
  if (pathname === '/login' || pathname === '/') return null

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Coach', href: '/coach', icon: MessageSquare },
    { name: 'Insights', href: '/insights', icon: BarChart2 },
    { name: 'Plan', href: '/plan', icon: Calendar },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-4 sm:static sm:border-t-0 sm:border-b sm:pb-0">
      <div className="max-w-5xl mx-auto px-4">
        <ul className="flex justify-around sm:justify-start sm:space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name} className="flex-1 sm:flex-none">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-3 px-2 text-xs font-medium sm:flex-row sm:space-x-2 sm:text-sm sm:py-4 transition-colors ${
                    isActive 
                      ? 'text-black' 
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <item.icon className={`h-5 w-5 sm:h-4 sm:w-4 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                  <span className="mt-1 sm:mt-0">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
