"use client"
import { useState } from 'react'
import * as XLSX from 'xlsx' // npm install xlsx
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react'

export default function TestResultsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState("")

  // 1. Handle File Upload & Parse Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const wsName = wb.SheetNames[0]
      const ws = wb.Sheets[wsName]
      const jsonData = XLSX.utils.sheet_to_json(ws)
      setData(jsonData) // Preview data
    }
    reader.readAsBinaryString(file)
  }

  // 2. Send to Backend (n8n)
  const processResults = async () => {
    if (data.length === 0) return
    setLoading(true)

    try {
      // Calls our Next.js API route, which then forwards to n8n
      await axios.post('/api/trigger-results', { results: data })
      toast.success("Results sent for processing! Parents will receive WhatsApp alerts shortly.")
      setData([])
      setFileName("")
    } catch (error) {
      toast.error("Failed to process results.")
    }
    setLoading(false)
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold">Upload Test Results</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload Excel files to automatically send results to parents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Select Excel File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileUpload}
              className="max-w-md"
            />
            {fileName && <span className="text-green-600 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> {fileName} loaded</span>}
          </div>
          <p className="text-sm text-gray-500">
            Ensure columns are: <code>RollNo</code>, <code>Subject</code>, <code>Marks</code>, <code>Total</code>, <code>Rank</code>.
          </p>
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>2. Preview & Publish</CardTitle>
            <Button onClick={processResults} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Publish Results
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-100 overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(data[0]).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((val: any, i) => (
                        <TableCell key={i}>{val}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}