"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, FileText, BarChart3, Calendar, GraduationCap, DollarSign, FileBarChart, BookOpen, Globe, Award } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // If not logged in, redirect would be handled by a middleware or the component would render differently
    // For now, we'll show a message
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-2xl text-center">
          <p>Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  // Stats data - in a real app, this would come from an API
  const stats = [
    { title: "Total Students", value: "1,248", change: "+12%", icon: Users, color: "text-blue-500" },
    { title: "Fees Collected", value: "$42,560", change: "+8%", icon: DollarSign, color: "text-green-500" },
    { title: "Attendance Rate", value: "94.2%", change: "+3.1%", icon: FileText, color: "text-purple-500" },
    { title: "Active Courses", value: "24", change: "+2", icon: BookOpen, color: "text-orange-500" },
  ];

  // Recent activities - in a real app, this would come from an API
  const recentActivities = [
    { id: 1, user: "John Smith", action: "Added new student", time: "2 min ago" },
    { id: 2, user: "Emma Johnson", action: "Updated fee payment", time: "15 min ago" },
    { id: 3, user: "Michael Chen", action: "Marked attendance", time: "1 hour ago" },
    { id: 4, user: "Sarah Williams", action: "Uploaded test results", time: "3 hours ago" },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email || 'Admin'}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white/70 dark:bg-card/50 backdrop-blur-sm border-emerald-100/50 dark:border-emerald-900/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card */}
          <Card className="lg:col-span-2 bg-white/70 dark:bg-card/50 backdrop-blur-sm border-emerald-100/50 dark:border-emerald-900/30">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-emerald-50/30 dark:bg-emerald-900/10 rounded-lg border border-emerald-100/30 dark:border-emerald-900/20">
                <p className="text-muted-foreground">Chart visualization would appear here</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/70 dark:bg-card/50 backdrop-blur-sm border-emerald-100/50 dark:border-emerald-900/30">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.user}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Card className="bg-white/70 dark:bg-card/50 backdrop-blur-sm border-emerald-100/50 dark:border-emerald-900/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>
                <CardTitle>Student Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Manage student profiles, enrollment, and academic records with ease.</p>
              <button className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">View Students →</button>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-card/50 backdrop-blur-sm border-emerald-100/50 dark:border-emerald-900/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <CardTitle>Fee Tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Automate fee collection, generate receipts, and track payments.</p>
              <button className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">View Fees →</button>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-card/50 backdrop-blur-sm border-emerald-100/50 dark:border-emerald-900/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle>Attendance System</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Digital attendance tracking with real-time reports and analytics.</p>
              <button className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">View Attendance →</button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}