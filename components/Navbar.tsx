"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, CreditCard, FileText, BarChart3, Calendar, LogOut, Sun, Moon } from "lucide-react"
import { useScroll } from "@/hooks/use-scroll" // 1. Import the hook
import { useTheme } from "next-themes"

export function Navbar() {
  const pathname = usePathname()
  const scrolled = useScroll(20) // 2. Detect scroll > 20px
  
  // Don't show the App Navbar on the Login page (root)
  if (pathname === "/") return null
  
  const { theme, setTheme } = useTheme()

  const routes = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/students", label: "Students", icon: Users },
    { href: "/attendence", label: "Attendance", icon: FileText },
    { href: "/fee", label: "Fees", icon: CreditCard },
    { href: "/tests/schedule", label: "Schedule", icon: Calendar },
    { href: "/tests/results", label: "Results", icon: BarChart3 },
  ]

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300",
      scrolled ? "pt-4" : "pt-6" // Moves slightly up when scrolled
    )}>
      <nav className={cn(
        "pointer-events-auto rounded-full px-2 py-2 flex items-center gap-1 max-w-5xl w-full mx-auto transition-all duration-500",
        // 3. Conditional Styles based on scroll state
        scrolled 
          ? "bg-white/80 dark:bg-[#05100a]/80 backdrop-blur-xl border border-emerald-500/10 shadow-2xl shadow-emerald-500/5" 
          : "bg-transparent border border-transparent shadow-none translate-y-2"
      )}>
        
        {/* Logo Area */}
        <div className="flex items-center gap-2 px-4 mr-2">
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center font-bold shadow-lg transition-all duration-300",
            scrolled ? "bg-emerald-600 text-white shadow-emerald-600/20" : "bg-emerald-600/90 text-white shadow-none"
          )}>
            IM
          </div>
          <span className={cn(
            "font-bold text-lg tracking-tight hidden md:block transition-colors duration-300",
            scrolled ? "text-emerald-950 dark:text-emerald-50" : "text-emerald-900 dark:text-emerald-100"
          )}>
            Institute
          </span>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto no-scrollbar">
          {routes.map((route) => {
            const Icon = route.icon
            const isActive = pathname === route.href
            
            return (
              <Link 
                key={route.href} 
                href={route.href} 
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  isActive 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30" 
                    : "text-muted-foreground hover:text-emerald-700 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{route.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Theme Toggle & Logout / Profile */}
        <div className="ml-2 px-2 flex items-center gap-2">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href="/">
            <button className="h-9 w-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </nav>
    </div>
  )
}