"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, CreditCard, FileText, BarChart3, Calendar, LogOut, Sun, Moon, Menu, X, User, LogIn } from "lucide-react"
import { useScroll } from "@/hooks/use-scroll" // 1. Import the hook
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

export function Navbar() {
  const pathname = usePathname()
  const scrolled = useScroll(20) // 2. Detect scroll > 20px
  
  const { user, logout, loading } = useAuth()
  
  const { theme, setTheme } = useTheme()
  const [isThemeLoaded, setIsThemeLoaded] = useState(false)
  
  useEffect(() => {
    setIsThemeLoaded(true)
  }, []) // Empty dependency array to run only once on mount
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Don't show the App Navbar on login and signup pages
  if (pathname === "/auth/login" || pathname === "/auth/signup") return null

  const authRoutes = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/students", label: "Students", icon: Users },
    { href: "/attendence", label: "Attendance", icon: FileText },
    { href: "/fee", label: "Fees", icon: CreditCard },
    { href: "/tests/schedule", label: "Schedule", icon: Calendar },
    { href: "/tests/results", label: "Results", icon: BarChart3 },
  ]
  
  const publicRoutes = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/auth/login", label: "Login", icon: LogIn },
    { href: "/auth/signup", label: "Sign Up", icon: LogIn },
  ]
  
  const routes = user ? authRoutes : publicRoutes

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
        {/* Desktop Navigation - Hidden on Mobile */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-1 overflow-x-auto no-scrollbar">
          {routes.map((route) => {
            const Icon = route.icon
            const isActive = pathname === route.href
            
            // Only show auth routes if user is logged in, otherwise only show home in main nav
            if (!user && route.href !== "/") {
              return null;
            }
            
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
        
        {/* Mobile Navigation - Hidden on Desktop */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-b-lg py-2 z-50 md:hidden border border-emerald-100 dark:border-emerald-900/20">
              {routes.map((route) => {
                const Icon = route.icon
                const isActive = pathname === route.href
                
                // Only show auth routes if user is logged in, otherwise only show home in mobile nav
                if (!user && route.href !== "/") {
                  return null;
                }
                
                return (
                  <Link 
                    key={route.href} 
                    href={route.href} 
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                        : "text-muted-foreground hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{route.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Theme Toggle & Auth Controls */}
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 transition-colors"
            disabled={!isThemeLoaded}
          >
            {isThemeLoaded ? (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <Sun className="w-4 h-4" />}
          </button>
          
          {user ? (
            // User is logged in - show profile and logout
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <User className="w-4 h-4" />
              </div>
              <button 
                onClick={logout}
                className="h-9 w-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 transition-colors"
                disabled={loading}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // User is not logged in - show login and signup buttons
            <div className="flex items-center gap-2">
              <Link href="/auth/signup">
                <button className="h-9 px-4 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/30 transition-colors">
                  Sign Up
                </button>
              </Link>
              <Link href="/auth/login">
                <button className="h-9 px-4 flex items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                  Login
                </button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}