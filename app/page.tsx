"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2 } from 'lucide-react'

export default function Home() {
  const [students, setStudents] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', roll_no: '', parent_phone: '', batch: '' })
  const [loading, setLoading] = useState(false)

  // Fetch Students on Load
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    const { data, error } = await supabase.from('students').select('*').order('id', { ascending: false })
    if (data) setStudents(data)
  }

  // Add Student
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('students').insert([form])
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setForm({ name: '', roll_no: '', parent_phone: '', batch: '' }) // Reset form
      fetchStudents() // Refresh list
    }
    setLoading(false)
  }

  // Delete Student
  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    await supabase.from('students').delete().match({ id })
    fetchStudents()
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Institute Manager</h1>
        <Button variant="outline">Login</Button>
      </div>

      {/* --- ADD STUDENT FORM --- */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Input 
              placeholder="Full Name" 
              value={form.name} 
              onChange={(e) => setForm({...form, name: e.target.value})} 
              required 
            />
            <Input 
              placeholder="Roll No" 
              value={form.roll_no} 
              onChange={(e) => setForm({...form, roll_no: e.target.value})} 
              required 
            />
            <Input 
              placeholder="Batch (e.g. Class 12)" 
              value={form.batch} 
              onChange={(e) => setForm({...form, batch: e.target.value})} 
              required 
            />
            <Input 
              placeholder="Parent Phone (9198...)" 
              value={form.parent_phone} 
              onChange={(e) => setForm({...form, parent_phone: e.target.value})} 
              required 
            />
            <Button className="col-span-2" disabled={loading}>
              {loading ? 'Saving...' : 'Register Student'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* --- STUDENT LIST --- */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.roll_no}</TableCell>
                  <TableCell>{student.batch}</TableCell>
                  <TableCell>{student.parent_phone}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(student.id)}>
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