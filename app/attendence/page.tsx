"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function AttendancePage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    // Fetch attendance and join with students table to get names
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        students ( name, roll_no )
      `)
      .order('timestamp', { ascending: false })
      .limit(50)

    if (data) setLogs(data)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Daily Attendance Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time biometric attendance tracking</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biometric Real-time Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-in/out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && !loading ? (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                     No attendance logs found yet.
                   </TableCell>
                 </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="font-medium">{log.students?.name || 'Unknown'}</TableCell>
                    <TableCell>{log.students?.roll_no}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'Late' ? 'destructive' : 'default'}>
                        {log.status || 'Present'}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.type || 'In'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}