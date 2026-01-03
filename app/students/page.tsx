"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'
import { Search, Plus, Trash2, User, Upload, Pencil, Image as ImageIcon } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Form State
  const [form, setForm] = useState({ 
    name: '', 
    roll_no: '', 
    parent_phone: '', 
    batch: '',
    biometric_id: '', 
    photo_url: ''      
  })
  
  // State for the file being uploaded
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .order('id', { ascending: false })
    if (data) setStudents(data)
  }

  const handleEditClick = (student: any) => {
    setEditingId(student.id)
    setForm({
        name: student.name,
        roll_no: student.roll_no,
        batch: student.batch,
        parent_phone: student.parent_phone,
        biometric_id: student.biometric_id || '', 
        photo_url: student.photo_url || ''         
    })
    setPhotoFile(null) 
    setOpen(true)
  }

  const handleAddClick = () => {
    setEditingId(null)
    setForm({ name: '', roll_no: '', parent_phone: '', batch: '', biometric_id: '', photo_url: '' })
    setPhotoFile(null)
    setOpen(true)
  }

  // --- Helper to upload image to Supabase Storage ---
  const uploadPhoto = async (file: File, rollNo: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${rollNo}-${Date.now()}.${fileExt}` 
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('student-photos') 
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get Public URL
    const { data } = supabase.storage
      .from('student-photos')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // --- CSV/Excel Upload Logic ---
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
      const dataRows = rows.slice(1).filter(r => r.length >= 4)

      const studentsToInsert = dataRows.map(row => ({
        name: String(row[0] || '').trim(),
        roll_no: String(row[1] || '').trim(),
        batch: String(row[2] || '').trim(),
        parent_phone: String(row[3] || '').trim()
      }))

      if (studentsToInsert.length === 0) {
        toast.error("Invalid or empty file")
        setLoading(false)
        return
      }

      // Use upsert or insert depending on your duplicate policy
      const { error } = await supabase
        .from('students')
        .insert(studentsToInsert)
        .select()

      if (error) {
        toast.error('Bulk Upload Failed: ' + error.message)
      } else {
        toast.success(`Successfully uploaded ${studentsToInsert.length} students`)
        fetchStudents()
      }
      setLoading(false)
      e.target.value = '' 
    }
    reader.readAsBinaryString(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
        let finalPhotoUrl = form.photo_url

        // 1. Upload Photo if a new file is selected
        if (photoFile) {
            finalPhotoUrl = await uploadPhoto(photoFile, form.roll_no)
        }

        const studentData = { ...form, photo_url: finalPhotoUrl }

        if (editingId) {
            // --- UPDATE ---
            const { error } = await supabase
                .from('students')
                .update(studentData)
                .eq('id', editingId)
            if (error) throw error
            toast.success('Student Updated Successfully')
        } else {
            // --- CREATE ---
            const { error } = await supabase.from('students').insert([studentData])
            if (error) throw error
            toast.success('Student Registered Successfully')
        }
        
        setOpen(false)
        fetchStudents()

    } catch (error: any) {
        toast.error('Operation Failed: ' + error.message)
    } finally {
        setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    const { error } = await supabase.from('students').delete().match({ id })
    if (error) toast.error("Failed to delete")
    else {
      toast.success("Student deleted")
      fetchStudents()
    }
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.roll_no.includes(search)
  )

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      {/* Header & Actions */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage records, photos, and biometric IDs</p>
        </div>
        
        {/* Action Buttons: Import & Add */}
        <div className="flex items-center gap-2">
            <input 
              type="file" 
              id="file-upload" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={loading}
            />
            
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()} disabled={loading}>
                <Upload className="mr-2 h-4 w-4"/> 
                {loading ? 'Uploading...' : 'Import Excel/CSV'}
            </Button>

            <Button onClick={handleAddClick}><Plus className="mr-2 h-4 w-4"/> Add New Student</Button>
        </div>
      </div>

      {/* Main List */}
      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
             <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500"/>
             <Input placeholder="Search students..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Biometric ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      {/* Show Photo if exists, else default icon */}
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.name} className="h-10 w-10 rounded-full object-cover border" />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground"/>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.parent_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{student.roll_no}</TableCell>
                    <TableCell>{student.batch}</TableCell>
                    <TableCell>
                        {student.biometric_id ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ID: {student.biometric_id}
                            </span>
                        ) : (
                            <span className="text-xs text-muted-foreground italic">Not Linked</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(student)}>
                            <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIALOG (Modal) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Student & Biometrics' : 'Register New Student'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Personal Details</label>
                        <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                        <Input placeholder="Roll No" value={form.roll_no} onChange={(e) => setForm({...form, roll_no: e.target.value})} required />
                        <Input placeholder="Batch" value={form.batch} onChange={(e) => setForm({...form, batch: e.target.value})} required />
                        <Input placeholder="Parent Phone" value={form.parent_phone} onChange={(e) => setForm({...form, parent_phone: e.target.value})} required />
                    </div>

                    {/* Biometric & Photo Section */}
                    <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
                        <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                            <ImageIcon className="w-3 h-3"/> Biometric Data
                        </label>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Machine User ID</label>
                            <Input 
                                placeholder="e.g. 55" 
                                value={form.biometric_id} 
                                onChange={(e) => setForm({...form, biometric_id: e.target.value})} 
                            />
                            <p className="text-[10px] text-muted-foreground">The ID displayed on the attendance machine.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Student Photo</label>
                            <Input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} 
                            />
                            {form.photo_url && !photoFile && (
                                <p className="text-[10px] text-green-600 truncate">Current: ...{form.photo_url.slice(-20)}</p>
                            )}
                        </div>
                    </div>
                </div>

                <Button className="w-full" disabled={loading}>
                    {loading ? 'Processing...' : 'Save Student Record'}
                </Button>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}