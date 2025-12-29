"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Sparkles, Image as ImageIcon } from 'lucide-react'

export default function SchedulePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)

    try {
      // 1. Upload Image to Supabase Storage (Bucket: 'schedules')
      const fileName = `schedule-${Date.now()}`
      const { data: uploadData, error } = await supabase.storage
        .from('schedules') // Make sure this bucket exists in Supabase!
        .upload(fileName, file)

      if (error) throw error

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from('schedules')
        .getPublicUrl(uploadData.path)

      // 3. Trigger AI Agent (n8n)
      await axios.post('/api/trigger-schedule', { imageUrl: urlData.publicUrl })

      toast.success("Schedule uploaded! AI is processing dates and batches.")
      setFile(null)
      setPreview("")

    } catch (error: any) {
      toast.error("Upload failed: " + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">AI Test Scheduler</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Schedule Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition">
            <Input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="file-upload"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 rounded shadow-md" />
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-gray-600">Click to upload image</span>
                </>
              )}
            </label>
          </div>

          <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
            {loading ? (
               "Analyzing with AI..." 
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Auto-Parse & Schedule
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-400">
            Supported: Handwritten notes, Printed tables, Screenshots.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}