"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, CreditCard, FileText, BarChart3, Calendar, LogOut, Sun, Moon, Menu, X, User, LogIn } from "lucide-react"
import { useScroll } from "@/hooks/use-scroll"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

export function Navbar() {
  const pathname = usePathname()
  const scrolled = useScroll(20)
  const { user, logout, loading } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isThemeLoaded, setIsThemeLoaded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  useEffect(() => { setIsThemeLoaded(true) }, [])

  // 1. Define ALL possible main navigation links (for logged-in users)
  const dashboardRoutes = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/students", label: "Students", icon: Users },
    { href: "/attendence", label: "Attendance", icon: FileText },
    { href: "/fee", label: "Fees", icon: CreditCard },
    { href: "/tests/schedule", label: "Schedule", icon: Calendar },
    { href: "/tests/results", label: "Results", icon: BarChart3 },
  ]
  
  // 2. Define Public links (usually just Home)
  const publicRoutes = [
    { href: "/", label: "Home", icon: LayoutDashboard },
  ]

  // Select which links to show in the CENTER bar
  // If logged in -> Show Dashboard links
  // If logged out -> Show only Home
  const navigationLinks = user ? dashboardRoutes : publicRoutes

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300",
      scrolled ? "pt-4" : "pt-6"
    )}>
      <nav className={cn(
        "pointer-events-auto rounded-full px-2 py-2 flex items-center gap-1 max-w-5xl w-full mx-auto transition-all duration-500",
        scrolled 
          ? "bg-white/80 dark:bg-[#05100a]/80 backdrop-blur-xl border border-emerald-500/10 shadow-2xl shadow-emerald-500/5" 
          : "bg-transparent border border-transparent shadow-none translate-y-2"
      )}>
        
        {/* --- LEFT: Logo --- */}
        <Link href="/" className="flex items-center gap-2 px-4 mr-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold bg-emerald-600 text-white shadow-lg">
            IM
          </div>
          <span className="font-bold text-lg tracking-tight hidden md:block text-emerald-900 dark:text-emerald-100">
            Institute
          </span>
        </Link>
        
        {/* --- CENTER: Navigation Links (Desktop) --- */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-1">
          {navigationLinks.map((route) => {
            const Icon = route.icon
            const isActive = pathname === route.href
            return (
              <Link 
                key={route.href} 
                href={route.href} 
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
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
        
        {/* --- MOBILE MENU TOGGLE --- */}
        <div className="md:hidden flex items-center ml-auto mr-2">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors pointer-events-auto"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* --- RIGHT: Action Buttons (Theme + Auth) --- */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 transition-colors"
          >
            {isThemeLoaded && (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
          </button>
          
          {/* Auth Buttons Logic */}
          {user ? (
            // LOGGED IN: Show Email, Profile Icon, and Logout Button
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
               <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200 px-2 max-w-[150px] truncate">
                 {user.email}
               </span>
              <div className="h-9 w-9 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30">
                <User className="w-4 h-4" />
              </div>
              <button 
                onClick={logout}
                title="Logout"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // LOGGED OUT: Show Sign Up and Login Buttons
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
              <Link href="/auth/signup">
                <button className="h-9 px-4 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/30 transition-colors text-sm font-medium">
                  Sign Up
                </button>
              </Link>
              <Link href="/auth/login">
                <button className="h-9 px-4 flex items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-medium shadow-md shadow-emerald-500/20">
                  Login
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* --- MOBILE DROPDOWN MENU --- */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-900/20 md:hidden flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
            {navigationLinks.map((route) => {
               const Icon = route.icon
               const isActive = pathname === route.href
               return (
                <Link 
                  key={route.href} 
                  href={route.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                      : "text-muted-foreground hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{route.label}</span>
                </Link>
               )
            })}
            
            {/* Mobile Auth Actions */}
            <div className="border-t border-emerald-100 dark:border-emerald-800/30 my-1 pt-2 flex flex-col gap-2 p-2">
              {user ? (
                 <button 
                   onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                   className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20"
                 >
                   <LogOut className="w-4 h-4" />
                   <span>Logout ({user.email})</span>
                 </button>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full h-10 rounded-xl bg-emerald-600 text-white font-medium">Login</button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full h-10 rounded-xl bg-emerald-100 text-emerald-700 font-medium">Sign Up</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  )
}