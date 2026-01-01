"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Upload, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

export default function TestSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([]) 
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState<number | null>(null) // State for Sync Button loading

  const [formData, setFormData] = useState({
    subject: '', batch: '', test_date: '', start_time: '', duration: ''
  })

  useEffect(() => { 
      fetchSchedules() 
      fetchBatches() 
  }, [])

  const fetchSchedules = async () => {
    const { data } = await supabase.from('test_schedules').select('*').order('test_date', { ascending: true })
    if (data) setSchedules(data)
  }

  const fetchBatches = async () => {
    const { data } = await supabase.from('batches').select('name').order('name', { ascending: true })
    if (data) setBatches(data)
  }

  // --- 1. SYNC ATTENDANCE (Master Requirement: Track Absenteeism) ---
  const handleSyncAttendance = async (testId: number, testDate: string) => {
    // Logic: You can't mark attendance for a test that hasn't happened yet
    if (new Date(testDate) > new Date()) {
        toast.error("Cannot mark attendance for a future test!")
        return
    }

    setSyncing(testId)
    try {
        // Calls the SQL Function 'sync_test_attendance' we created
        const { error } = await supabase.rpc('sync_test_attendance', { target_test_id: testId })
        
        if (error) throw error
        toast.success("Attendance Synced! Absent students identified.")
        
        // Optional: Trigger n8n here to send "Absent Alerts" to parents
        // triggerN8N({ type: 'absent_alert', testId: testId })
        
    } catch (e: any) {
        toast.error("Sync Failed: " + e.message)
    } finally {
        setSyncing(null)
    }
  }

  // --- 2. AUTOMATION TRIGGER ---
  const triggerN8N = async (payload: any) => {
    const N8N_WEBHOOK = process.env.NEXT_PUBLIC_N8N_SCHEDULE_WEBHOOK 
    if(N8N_WEBHOOK) {
        try {
            await fetch(N8N_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            toast.success("Sent to WhatsApp via n8n!")
        } catch (e) {
            console.error("Automation failed", e)
        }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const reader = new FileReader()

    reader.onload = async (event) => {
      const data = event.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
      
      const dataRows = rows.slice(1).filter(r => r.length >= 2)

      const schedulesToInsert = dataRows.map(row => ({
        subject: String(row[0] || '').trim(),
        test_date: formatExcelDate(row[1]),
        start_time: formatExcelTime(row[2]),
        batch: String(row[3] || '').trim(),
        duration: String(row[4] || '').trim()
      }))

      if (schedulesToInsert.length === 0) {
        toast.error("File is empty or invalid")
        setLoading(false)
        return
      }

      const { error } = await supabase.from('test_schedules').insert(schedulesToInsert)

      if (error) {
        toast.error('Upload Failed: ' + error.message)
      } else {
        toast.success(`Scheduled ${schedulesToInsert.length} tests`)
        fetchSchedules()
        triggerN8N({ type: 'bulk', data: schedulesToInsert })
      }
      setLoading(false)
      e.target.value = '' 
    }
    reader.readAsBinaryString(file)
  }

  const formatExcelDate = (val: any) => {
    if (!val) return ''
    if (typeof val === 'number' && val > 40000) {
       const date = new Date((val - (25567 + 2)) * 86400 * 1000)
       return date.toISOString().split('T')[0]
    }
    return String(val).trim()
  }

  const formatExcelTime = (val: any) => {
     if (typeof val === 'number') {
        const totalSeconds = Math.floor(val * 86400)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
     }
     return String(val).trim()
  }

  const handleAddTest = async () => {
    if (!formData.subject || !formData.test_date || !formData.batch) return toast.error("Required fields missing")

    setLoading(true)
    const { error } = await supabase.from('test_schedules').insert([formData])

    if (error) {
        toast.error('Error: ' + error.message)
    } else {
        toast.success('Test Scheduled')
        setFormData({ subject: '', batch: '', test_date: '', start_time: '', duration: '' })
        fetchSchedules()
        triggerN8N({ type: 'single', data: formData })
    }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Cancel this test?")) return
    const { error } = await supabase.from('test_schedules').delete().eq('id', id)
    if (error) toast.error("Failed to delete")
    else { toast.success("Test cancelled"); fetchSchedules() }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Test Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage Exams & Forecast Schedules</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Card */}
        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Bulk Upload</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Excel/CSV</label>
              <Input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} disabled={loading} />
              <p className="text-xs text-muted-foreground">Format: Subject, Date, Time, Batch, Duration</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Add Single Card */}
        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Add Single Test</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Subject" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
              
              {/* --- BATCH DROPDOWN --- */}
              <Select value={formData.batch} onValueChange={(val) => setFormData({...formData, batch: val})}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                    {batches.map((b) => (
                        <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Input type="date" value={formData.test_date} onChange={(e) => setFormData({...formData, test_date: e.target.value})} />
              <Input type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
              <Input placeholder="Duration" className="col-span-2" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
              <Button className="col-span-2 bg-primary text-primary-foreground" onClick={handleAddTest} disabled={loading}>{loading ? 'Scheduling...' : 'Schedule Test'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* List */}
      <Card className="bg-card/40 backdrop-blur-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Upcoming Tests</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.subject}</TableCell>
                  <TableCell>{test.test_date}</TableCell>
                  <TableCell>{test.start_time}</TableCell>
                  <TableCell><Badge variant="secondary">{test.batch}</Badge></TableCell>
                  <TableCell>{test.duration}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    
                    {/* SYNC BUTTON: Marks attendance for this test based on biometric data */}
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleSyncAttendance(test.id, test.test_date)}
                        disabled={syncing === test.id}
                        title="Sync Daily Attendance to this Test"
                    >
                        <RefreshCw className={`h-4 w-4 mr-1 ${syncing === test.id ? 'animate-spin' : ''}`} />
                        {syncing === test.id ? 'Syncing...' : 'Sync Attendance'}
                    </Button>

                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(test.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}