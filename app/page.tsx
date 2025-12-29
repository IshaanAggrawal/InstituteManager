"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Mail, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

// ⚠️ FIXED: The component is now properly exported as default
export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API delay before redirecting to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-background via-emerald-50/50 to-primary/5 dark:from-background dark:via-background dark:to-primary/10 relative overflow-hidden flex flex-col">
      
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Marketing Text */}
          <div className="space-y-8 hidden lg:block animate-in slide-in-from-left-10 duration-700 fade-in">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              System Operational
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              Institute Manager <br />
              <span className="text-primary">Next Gen.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Seamlessly manage <strong>Students, Fees, Attendance, and Test Results</strong> in one secure environment.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4">
               <div className="flex gap-4 group">
                 <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                   <ShieldCheck className="h-5 w-5" />
                 </div>
                 <div>
                   <h3 className="font-semibold">Secure Data</h3>
                   <p className="text-sm text-muted-foreground">End-to-end encryption</p>
                 </div>
               </div>
               <div className="flex gap-4 group">
                 <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                   <TrendingUp className="h-5 w-5" />
                 </div>
                 <div>
                   <h3 className="font-semibold">Live Results</h3>
                   <p className="text-sm text-muted-foreground">Instant test analytics</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-full max-w-md mx-auto animate-in slide-in-from-right-10 duration-700 fade-in delay-100">
            <Card className="border-emerald-100/50 dark:border-emerald-900/50 shadow-2xl bg-white/80 dark:bg-card/50 backdrop-blur-xl">
              <CardHeader className="space-y-1 text-center pb-8">
                <CardTitle className="text-2xl font-bold text-emerald-950 dark:text-white">Admin Portal</CardTitle>
                <CardDescription>
                  Enter credentials to access dashboard
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="email" 
                        placeholder="admin@institute.com" 
                        className="pl-10 h-11 bg-background/50 border-input group-hover:border-primary/50 transition-colors focus-visible:ring-primary" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 h-11 bg-background/50 border-input group-hover:border-primary/50 transition-colors focus-visible:ring-primary" 
                        required 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full h-11 text-base bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all" type="submit" disabled={loading}>
                    {loading ? 'Authenticating...' : 'Sign In'}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                  <div className="text-center text-xs text-muted-foreground">
                    <Link href="#" className="hover:text-primary underline underline-offset-4">Forgot password?</Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
            <p className="text-center mt-6 text-xs text-muted-foreground">
              Protected by Enterprise Guard • <Link href="#" className="hover:text-primary">Privacy</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}