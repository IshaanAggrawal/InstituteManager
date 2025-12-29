"use client"
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, Mail } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API delay
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
             <div className="h-12 w-12 bg-black rounded-lg flex items-center justify-center">
               <span className="text-white font-bold text-xl">IM</span>
             </div>
          </div>
          <CardTitle className="text-2xl font-bold">Institute Manager</CardTitle>
          <CardDescription>
            Enter your admin credentials to access the portal
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input type="email" placeholder="admin@institute.com" className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input type="password" placeholder="••••••••" className="pl-10" required />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
        <div className="text-center pb-6 text-xs text-gray-500">
           Protected by Secure Auth
        </div>
      </Card>
    </div>
  )
}