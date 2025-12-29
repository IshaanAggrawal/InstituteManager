"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, CreditCard, AlertCircle, ArrowRight, CheckCircle2, Database, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    feesCollected: 0,
    pendingFees: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // 1. Get Total Students
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })

      // 2. Get Today's Attendance
      const today = new Date().toISOString().split('T')[0]
      const { count: presentCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'Present')

      // 3. Get Fee Stats
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
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const attendancePercentage = stats.totalStudents > 0 
    ? Math.round((stats.presentToday / stats.totalStudents) * 100) 
    : 0

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Institute Overview</p>
        </div>
        <div className="text-sm font-medium text-slate-500">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Stats Grid - Strict & Clean */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Students</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? "-" : stats.totalStudents}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Attendance</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? "-" : `${attendancePercentage}%`}
            </div>
            <p className="text-xs text-slate-500 mt-1">{stats.presentToday} Present</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {loading ? "-" : `₹${stats.feesCollected.toLocaleString()}`}
            </div>
            <p className="text-xs text-slate-500 mt-1">Collected</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Dues</CardTitle>
            <AlertCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {loading ? "-" : `₹${stats.pendingFees.toLocaleString()}`}
            </div>
            <p className="text-xs text-slate-500 mt-1">Outstanding</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Quick Actions */}
        <Card className="col-span-2 border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Management Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
             <Link href="/tests/results" className="block">
               <div className="flex items-center justify-between p-4 rounded border hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-medium text-sm text-slate-900">Upload Results</div>
                    <div className="text-xs text-slate-500 mt-0.5">Excel / CSV Parser</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
               </div>
             </Link>

             <Link href="/tests/schedule" className="block">
               <div className="flex items-center justify-between p-4 rounded border hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-medium text-sm text-slate-900">Schedule Test</div>
                    <div className="text-xs text-slate-500 mt-0.5">AI Image Scanner</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
               </div>
             </Link>
          </CardContent>
        </Card>

        {/* System Status - Simple List */}
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base font-semibold">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                   <Database className="w-4 h-4 text-slate-400" />
                   Database
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs uppercase">
                   <CheckCircle2 className="w-3.5 h-3.5" /> Online
                </div>
             </div>

             <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                   <MessageSquare className="w-4 h-4 text-slate-400" />
                   WhatsApp API
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs uppercase">
                   <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </div>
             </div>

             <div className="pt-2 border-t mt-2">
                <p className="text-xs text-slate-400">Server Time: {new Date().toLocaleTimeString()}</p>
             </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}