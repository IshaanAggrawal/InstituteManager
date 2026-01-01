"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Calendar as CalendarIcon, User, RefreshCcw, Fingerprint, Clock, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"

export default function AttendancePage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Search States
  const [searchType, setSearchType] = useState('roll_no') 
  const [searchValue, setSearchValue] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [searchedStudent, setSearchedStudent] = useState<any>(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    setSearchedStudent(null)
    
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        students ( name, roll_no, batch, photo_url, biometric_id, parent_phone )
      `)
      .order('timestamp', { ascending: false })
      .limit(50)

    if (data) setLogs(data)
    if (error) toast.error('Failed to fetch live logs')
    setLoading(false)
  }

  const handleSearch = async () => {
    if (!searchValue && !searchDate) {
      toast.error("Enter a Roll No, ID, or pick a date")
      return
    }

    setLoading(true)
    try {
      let studentId = null
      if (searchValue) {
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq(searchType, searchValue)
          .single()

        if (studentError || !student) {
          toast.error("Student not found")
          setLoading(false)
          return
        }
        
        setSearchedStudent(student)
        studentId = student.id
      }

      let query = supabase
        .from('attendance')
        .select(`
          *,
          students ( name, roll_no, batch, photo_url )
        `)
        .order('timestamp', { ascending: false })

      if (studentId) query = query.eq('student_id', studentId)

      if (searchDate) {
        const startDate = new Date(searchDate)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(searchDate)
        endDate.setHours(23, 59, 59, 999)

        query = query.gte('timestamp', startDate.toISOString()).lte('timestamp', endDate.toISOString())
      }

      const { data: attendanceData, error: attendanceError } = await query
      if (attendanceError) throw attendanceError
      
      setLogs(attendanceData || [])
      if (attendanceData?.length === 0) toast.info("No records found for these filters")

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchValue('')
    setSearchDate('')
    setSearchedStudent(null)
    fetchLogs()
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      
      {/* --- HEADER & CONTROLS --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance Monitor</h1>
          <p className="text-sm text-muted-foreground">
            Live biometric tracking & student entry logs.
          </p>
        </div>
        
        {/* Floating Glass Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center p-1.5 rounded-2xl border border-border/50 shadow-xl shadow-black/5 bg-card/40 backdrop-blur-xl transition-all hover:bg-card/60">
            <div className="relative group">
              <select 
                value={searchType} 
                onChange={(e) => setSearchType(e.target.value)}
                className="w-40 h-10 bg-transparent border-green-500 focus:ring-0 text-muted-foreground font-medium appearance-none pl-4 pr-8 outline-none cursor-pointer"
              >
                <option value="roll_no" className="bg-card text-foreground">Roll Number</option>
                <option value="biometric_id" className="bg-card text-foreground">Biometric ID</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors"/>
            </div>

            <div className="h-6 w-px bg-border/60 hidden sm:block"></div>
            <Input 
                placeholder={searchType === 'roll_no' ? "e.g. R-2024" : "e.g. 55"}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full sm:w-[160px] border-none bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/40 font-medium h-10"
            />

            <div className="h-6 w-px bg-border/60 hidden sm:block"></div>

            <Input 
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full sm:w-[140px] border-none bg-transparent focus-visible:ring-0 text-muted-foreground h-10"
            />

            <Button size="icon" className="rounded-xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all h-9 w-9 my-auto" onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4" />
            </Button>
            
            {(searchValue || searchDate || searchedStudent) && (
                <Button variant="ghost" size="icon" onClick={clearSearch} className="rounded-xl text-muted-foreground hover:text-foreground h-9 w-9 my-auto">
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            )}
        </div>
      </div>

      {/* --- STUDENT PROFILE CARD (Conditional) --- */}
      {searchedStudent && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <Card className="border-border/60 bg-gradient-to-br from-card/80 to-muted/20 backdrop-blur-md overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        {/* Left: Photo & Basics */}
                        <div className="p-6 flex flex-col items-center md:items-start gap-4 border-b md:border-b-0 md:border-r border-border/50 md:min-w-[250px] bg-secondary/10">
                             <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary to-accent rounded-full blur opacity-30"></div>
                                {searchedStudent.photo_url ? (
                                    <img 
                                        src={searchedStudent.photo_url} 
                                        alt={searchedStudent.name} 
                                        className="relative h-28 w-28 rounded-full object-cover border-4 border-background shadow-2xl"
                                    />
                                ) : (
                                    <div className="relative h-28 w-28 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-2xl">
                                        <User className="h-10 w-10 text-muted-foreground/50" />
                                    </div>
                                )}
                             </div>
                             <div className="text-center md:text-left">
                                <h2 className="text-xl font-bold">{searchedStudent.name}</h2>
                                <p className="text-sm text-muted-foreground font-medium">{searchedStudent.roll_no}</p>
                             </div>
                        </div>

                        {/* Right: Stats & Details */}
                        <div className="flex-1 p-6 flex flex-col justify-center space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Batch</span>
                                    <p className="font-semibold text-foreground">{searchedStudent.batch}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Biometric ID</span>
                                    <div className="flex items-center gap-1.5">
                                        <Fingerprint className="w-4 h-4 text-primary"/>
                                        <p className="font-medium">{searchedStudent.biometric_id || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Parent Contact</span>
                                    <p className="font-medium">{searchedStudent.parent_phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Logs</span>
                                    <Badge variant="secondary" className="font-mono bg-primary/10 text-primary hover:bg-primary/20">{logs.length}</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}

      {/* --- LOGS TABLE --- */}
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary"/>
            {searchedStudent ? 'Attendance History' : 'Live Activity Feed'}
          </CardTitle>
          <div className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
             {logs.length} Records
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-[200px] pl-6">Timestamp</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Batch / Roll</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Punch Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && !loading ? (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center h-48 text-muted-foreground/60">
                     <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                            <CalendarIcon className="h-6 w-6 opacity-40" />
                        </div>
                        <p className="text-sm">
                            {searchedStudent 
                                ? "No attendance records found for this student." 
                                : "Waiting for live attendance punches..."}
                        </p>
                     </div>
                   </TableCell>
                 </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-border/40 hover:bg-muted/30 transition-colors group">
                    <TableCell className="pl-6">
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground text-sm">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                                {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </TableCell>
                    
                    <TableCell>
                        <div className="font-medium text-foreground">
                            {log.students?.name || searchedStudent?.name || 'Unknown User'}
                        </div>
                    </TableCell>
                    
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {log.students?.batch || searchedStudent?.batch || '-'}
                            </span>
                            <span className="text-xs text-muted-foreground/60">
                                #{log.students?.roll_no || searchedStudent?.roll_no || '-'}
                            </span>
                        </div>
                    </TableCell>
                    
                    <TableCell>
                      {log.status === 'Late' ? (
                          <Badge variant="destructive" className="bg-destructive/15 text-destructive border-destructive/20 hover:bg-destructive/25 shadow-none">
                            <AlertCircle className="w-3 h-3 mr-1" /> Late
                          </Badge>
                      ) : (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shadow-none">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Present
                          </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right pr-6">
                        <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            log.type === 'Out' 
                                ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" 
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        )}>
                            {log.type === 'Out' ? 'Exit' : 'Entry'}
                        </span>
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