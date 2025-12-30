"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge' // npx shadcn@latest add badge
import { BellRing } from 'lucide-react'
import { toast } from 'sonner'

export default function FeesPage() {
  const [fees, setFees] = useState<any[]>([])

  useEffect(() => {
    fetchFees()
  }, [])

  const fetchFees = async () => {
    // Join fees with student details
    const { data, error } = await supabase
      .from('fees')
      .select(`
        *,
        students ( name, roll_no, parent_phone )
      `)
      .order('due_date', { ascending: true })

    if (data) setFees(data)
  }

  const sendReminder = (studentName: string) => {
    // In a real app, this calls an API. For now, we simulate.
    toast.success(`Reminder queued for ${studentName}'s parents via WhatsApp`)
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fee Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track fees, payments, and outstanding dues</p>
        </div>
        <Button variant="outline">Download Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Collected</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹ 12,45,000</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending Dues</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-500">₹ 85,000</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Overdue Students</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">12</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Fee Status List</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Total Fee</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((record) => {
                const isOverdue = new Date(record.due_date) < new Date() && record.paid_amount < record.total_amount
                const isPaid = record.paid_amount >= record.total_amount
                
                return (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="font-medium">{record.students.name}</div>
                      <div className="text-xs text-gray-500">{record.students.roll_no}</div>
                    </TableCell>
                    <TableCell>₹{record.total_amount}</TableCell>
                    <TableCell>₹{record.paid_amount}</TableCell>
                    <TableCell>{record.due_date}</TableCell>
                    <TableCell>
                      {isPaid ? <Badge className="bg-green-500">Paid</Badge> : 
                       isOverdue ? <Badge variant="destructive">Overdue</Badge> : 
                       <Badge variant="secondary">Pending</Badge>}
                    </TableCell>
                    <TableCell>
                      {!isPaid && (
                        <Button size="sm" variant="ghost" onClick={() => sendReminder(record.students.name)}>
                          <BellRing className="w-4 h-4 mr-1"/> Remind
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}