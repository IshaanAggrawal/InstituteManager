"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Clock, Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

export default function TestSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    batch: '',
    test_date: '',
    start_time: '',
    duration: ''
  })

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from('test_schedules')
      .select('*')
      .order('test_date', { ascending: true })
    
    if (error) console.error('Error fetching:', error)
    else setSchedules(data || [])
  }

  // --- NEW: Excel/CSV Upload Logic ---
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
      
      // Parse as Array of Arrays
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
      
      // Assume Row 0 is header, start from Row 1
      // Expected Order: Subject, Date, Time, Batch, Duration
      const dataRows = rows.slice(1).filter(r => r.length >= 2) // Basic validation

      const schedulesToInsert = dataRows.map(row => ({
        subject: String(row[0] || '').trim(),
        test_date: formatExcelDate(row[1]), // Handle Excel date weirdness
        start_time: String(row[2] || '').trim(),
        batch: String(row[3] || '').trim(),
        duration: String(row[4] || '').trim()
      }))

      if (schedulesToInsert.length === 0) {
        toast.error("Invalid or empty file")
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('test_schedules')
        .insert(schedulesToInsert)
        .select()

      if (error) {
        toast.error('Upload Failed: ' + error.message)
      } else {
        toast.success(`Successfully scheduled ${schedulesToInsert.length} tests`)
        fetchSchedules()
      }
      setLoading(false)
      e.target.value = '' // Reset input
    }

    reader.readAsBinaryString(file)
  }

  // Helper: Excel sometimes returns dates as numbers (days since 1900)
  const formatExcelDate = (val: any) => {
    if (!val) return ''
    // If it's already a string like "2024-01-01", return it
    if (typeof val === 'string' || typeof val === 'number') {
       // Simple check if it's a serial number (Excel date)
       if (!isNaN(Number(val)) && Number(val) > 40000) {
           const date = new Date((Number(val) - (25567 + 2)) * 86400 * 1000)
           return date.toISOString().split('T')[0]
       }
    }
    return String(val).trim()
  }

  const handleAddTest = async () => {
    if (!formData.subject || !formData.test_date) {
        toast.error("Please fill in required fields")
        return
    }

    setLoading(true)
    const { error } = await supabase
        .from('test_schedules')
        .insert([formData])

    if (error) {
        toast.error('Failed to add test: ' + error.message)
    } else {
        toast.success('Test Scheduled Successfully')
        setFormData({ subject: '', batch: '', test_date: '', start_time: '', duration: '' })
        fetchSchedules()
    }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this test?")) return
    const { error } = await supabase.from('test_schedules').delete().match({ id })
    if (error) toast.error("Failed to delete")
    else {
        toast.success("Test cancelled")
        fetchSchedules()
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Test Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule tests and manage upcoming exams</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upload Card - Modified */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Bulk Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Excel/CSV</label>
              <Input 
                type="file" 
                accept=".csv, .xlsx, .xls" 
                onChange={handleFileUpload}
                disabled={loading}
                className="max-w-md"
              />
              <p className="text-xs text-muted-foreground">
                <strong>Format:</strong> Subject, Date (YYYY-MM-DD), Time, Batch, Duration
              </p>
            </div>
            
            <div className="rounded-md bg-muted p-3 text-xs">
                <p className="font-semibold mb-1">Example Row:</p>
                <code>Mathematics | 2025-01-15 | 10:00 | Class 12-A | 2 hours</code>
            </div>
          </CardContent>
        </Card>
        
        {/* Add New Schedule Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Add Single Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="e.g. Mathematics" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch</label>
                <Input placeholder="e.g. Class 12-A" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={formData.test_date} onChange={(e) => setFormData({...formData, test_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input placeholder="e.g. 2 hours" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
              </div>
              <div className="space-y-2 pt-6">
                <Button className="w-full" onClick={handleAddTest} disabled={loading}>
                    {loading ? 'Saving...' : 'Add Test'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Schedule List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Tests
          </CardTitle>
        </CardHeader>
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
              {schedules.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No upcoming tests scheduled.
                      </TableCell>
                  </TableRow>
              ) : (
                schedules.map((test) => (
                    <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.subject}</TableCell>
                    <TableCell>{test.test_date}</TableCell>
                    <TableCell>{test.start_time}</TableCell>
                    <TableCell><Badge variant="secondary">{test.batch}</Badge></TableCell>
                    <TableCell>{test.duration}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(test.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
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