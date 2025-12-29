"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Search, Plus, Trash2, User } from 'lucide-react'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  
  // Form State
  const [form, setForm] = useState({ 
    name: '', 
    roll_no: '', 
    parent_phone: '', 
    batch: '' 
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('id', { ascending: false })
    
    if (data) setStudents(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('students').insert([form])
    
    if (error) {
      toast.error('Error: ' + error.message)
    } else {
      toast.success('Student Registered Successfully')
      setForm({ name: '', roll_no: '', parent_phone: '', batch: '' }) // Reset form
      setOpen(false) // Close modal
      fetchStudents() // Refresh list
    }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure? This will delete all attendance records for this student.")) return;
    
    const { error } = await supabase.from('students').delete().match({ id })
    if (error) toast.error("Failed to delete")
    else {
      toast.success("Student deleted")
      fetchStudents()
    }
  }

  // Filter students based on search
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.roll_no.includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all student records and information</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4"/> Add New Student</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input 
                    placeholder="e.g. Ishaan Aggrawal" 
                    value={form.name} 
                    onChange={(e) => setForm({...form, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Roll No</label>
                  <Input 
                    placeholder="e.g. 101" 
                    value={form.roll_no} 
                    onChange={(e) => setForm({...form, roll_no: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch</label>
                  <Input 
                    placeholder="e.g. Class 12-A" 
                    value={form.batch} 
                    onChange={(e) => setForm({...form, batch: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Parent Phone</label>
                  <Input 
                    placeholder="e.g. 919876543210" 
                    value={form.parent_phone} 
                    onChange={(e) => setForm({...form, parent_phone: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <Button className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Register Student'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* LIST & SEARCH */}
      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
             <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500"/>
             <Input 
               placeholder="Search by name or roll no..." 
               className="pl-8"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Parent Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                     No students found.
                   </TableCell>
                 </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500"/>
                      </div>
                      {student.name}
                    </TableCell>
                    <TableCell>{student.roll_no}</TableCell>
                    <TableCell>{student.batch}</TableCell>
                    <TableCell>{student.parent_phone}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(student.id)}>
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