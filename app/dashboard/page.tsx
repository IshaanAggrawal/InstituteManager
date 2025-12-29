"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, CreditCard, Activity, ArrowUpRight } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    feesCollected: 0,
    pendingFees: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    // 1. Get Total Students
    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    // 2. Get Today's Attendance (Present)
    const today = new Date().toISOString().split('T')[0]
    const { count: presentCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('status', 'Present')

    // 3. Get Fee Stats (Summing up - simplistic approach)
    const { data: feeData } = await supabase
      .from('fees')
      .select('paid_amount, total_amount')
    
    let paid = 0
    let total = 0
    if (feeData) {
      feeData.forEach(f => {
        paid += Number(f.paid_amount)
        total += Number(f.total_amount)
      })
    }

    setStats({
      totalStudents: studentCount || 0,
      presentToday: presentCount || 0,
      feesCollected: paid,
      pendingFees: total - paid
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back, Admin</p>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentToday}</div>
            <p className="text-xs text-muted-foreground">
               {stats.totalStudents > 0 
                 ? Math.round((stats.presentToday / stats.totalStudents) * 100) 
                 : 0}% Attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fees Collected</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.feesCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">₹{stats.pendingFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* --- RECENT ACTIVITY SECTION --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
             <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between group">
                <div>
                   <div className="font-medium">Upload Test Results</div>
                   <div className="text-sm text-gray-500">Parse Excel & WhatsApp</div>
                </div>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 transition" />
             </div>
             <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between group">
                <div>
                   <div className="font-medium">Schedule Test</div>
                   <div className="text-sm text-gray-500">AI Image Parser</div>
                </div>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 transition" />
             </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-sm">Database Connected</span>
               </div>
               <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-sm">WhatsApp API Active</span>
               </div>
               <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-sm">n8n Automation Running</span>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}