"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Clock, Upload, Camera, Users } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function TestSchedulePage() {
  const [schedule, setSchedule] = useState([
    { id: 1, subject: 'Mathematics', date: '2024-01-15', time: '10:00 AM', batch: 'Class 12-A', duration: '2 hours' },
    { id: 2, subject: 'Physics', date: '2024-01-17', time: '11:00 AM', batch: 'Class 12-B', duration: '2 hours' },
    { id: 3, subject: 'Chemistry', date: '2024-01-20', time: '09:30 AM', batch: 'Class 12-A', duration: '2 hours' },
  ])
  
  const [image, setImage] = useState<string | null>(null)
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)
        console.log('Parsed Excel data:', jsonData)
        // Here you would process the schedule data from Excel
      }
      reader.readAsArrayBuffer(file)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Test Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule tests and manage upcoming exams</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Schedule Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Excel File</label>
              <Input 
                type="file" 
                accept=".xlsx,.xls" 
                onChange={handleExcelUpload}
                className="max-w-md"
              />
              <p className="text-xs text-muted-foreground">Upload Excel with columns: Subject, Date, Time, Batch, Duration</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Image (Handwritten Schedule)</label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="max-w-md"
              />
              <p className="text-xs text-muted-foreground">AI will extract schedule details from handwritten schedules</p>
            </div>
            
            {image && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <img 
                  src={image} 
                  alt="Uploaded schedule" 
                  className="max-w-full h-auto rounded border"
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Add New Schedule Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Add New Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="e.g. Mathematics" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch</label>
                <Input placeholder="e.g. Class 12-A" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input type="time" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input placeholder="e.g. 2 hours" />
              </div>
              <div className="space-y-2 pt-6">
                <Button className="w-full">Add Test</Button>
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
              {schedule.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.subject}</TableCell>
                  <TableCell>{test.date}</TableCell>
                  <TableCell>{test.time}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{test.batch}</Badge>
                  </TableCell>
                  <TableCell>{test.duration}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Edit</Button>
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