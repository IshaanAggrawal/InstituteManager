"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Download, Banknote, AlertCircle, CalendarIcon, CreditCard, History } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import * as XLSX from 'xlsx'

export default function FeesPage() {
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Dialogs
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  
  // Form
  const [payAmount, setPayAmount] = useState('')
  const [payMode, setPayMode] = useState('UPI')
  const [nextDate, setNextDate] = useState('')

  useEffect(() => { fetchFees() }, [])

  const fetchFees = async () => {
    setLoading(true)
    const { data } = await supabase.from('fees').select(`*, students(name, roll_no, parent_phone, batch)`).order('due_date')
    if (data) setFees(data)
    setLoading(false)
  }

  // --- 1. UPI LINK GENERATOR ---
  const copyUPILink = (fee: any) => {
    const due = fee.total_amount - fee.paid_amount
    if (due <= 0) return toast.info("No due amount!")
    
    // REPLACE WITH CLIENT'S UPI ID
    const upiId = "institute@hdfcbank" 
    const link = `upi://pay?pa=${upiId}&pn=Institute&am=${due}&tn=Fee-${fee.students.roll_no}&cu=INR`
    
    navigator.clipboard.writeText(link)
    toast.success("UPI Payment Link Copied to Clipboard!")
  }

  // --- 2. RECORD PAYMENT (With Transactions) ---
  const handlePaymentSubmit = async () => {
    if (!selectedFee || !payAmount) return
    const amount = parseFloat(payAmount)
    const newPaid = (selectedFee.paid_amount || 0) + amount
    const remaining = selectedFee.total_amount - newPaid

    if (remaining > 0 && !nextDate) return toast.error("Please set a Next Due Date for the remaining balance.")

    try {
        // A. Add to Transactions Table
        await supabase.from('transactions').insert({
            fee_id: selectedFee.id,
            amount: amount,
            payment_mode: payMode,
            remarks: remaining > 0 ? `Partial. Due: ${nextDate}` : 'Full Settlement'
        })

        // B. Update Main Fee Record
        const updateData: any = { paid_amount: newPaid }
        if (remaining > 0) updateData.due_date = nextDate

        await supabase.from('fees').update(updateData).eq('id', selectedFee.id)
        
        toast.success("Payment Recorded & Receipt Generated!")
        setPaymentOpen(false)
        fetchFees()
    } catch (e) { toast.error("Payment Failed") }
  }

  // --- 3. VIEW HISTORY ---
  const openHistory = async (fee: any) => {
    const { data } = await supabase.from('transactions').select('*').eq('fee_id', fee.id).order('transaction_date', { ascending: false })
    setTransactions(data || [])
    setHistoryOpen(true)
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fee Manager</h1>
        <Button onClick={() => window.print()} variant="outline"><Download className="mr-2 h-4 w-4"/> Report</Button>
      </div>

      <Card className="bg-card/40 backdrop-blur-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Due Amount</TableHead>
                <TableHead>Next Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((f) => {
                const balance = f.total_amount - f.paid_amount
                return (
                  <TableRow key={f.id} className="hover:bg-muted/30">
                    <TableCell>
                        <div className="font-bold">{f.students?.name}</div>
                        <div className="text-xs text-muted-foreground">{f.students?.parent_phone}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{f.students?.batch}</Badge></TableCell>
                    <TableCell className="font-bold text-destructive">₹{balance.toLocaleString()}</TableCell>
                    <TableCell>{new Date(f.due_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                        {balance > 0 && (
                            <>
                            <Button size="icon" variant="ghost" onClick={() => copyUPILink(f)} title="Copy UPI Link">
                                <CreditCard className="h-4 w-4 text-blue-600"/>
                            </Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setSelectedFee(f); setPayAmount(balance.toString()); setPaymentOpen(true) }}>
                                <Banknote className="h-4 w-4 mr-1"/> Pay
                            </Button>
                            </>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => openHistory(f)}>
                            <History className="h-4 w-4 text-muted-foreground"/>
                        </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAYMENT DIALOG */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Amount (₹)</Label>
                        <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}/>
                    </div>
                    <div className="space-y-2">
                        <Label>Mode</Label>
                        <Select value={payMode} onValueChange={setPayMode}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UPI">UPI / GPay</SelectItem>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {(selectedFee?.total_amount - (selectedFee?.paid_amount + parseFloat(payAmount || '0'))) > 0 && (
                    <div className="space-y-2 bg-destructive/10 p-3 rounded-md">
                        <Label className="text-destructive flex gap-2"><CalendarIcon className="w-4 h-4"/> Next Due Date (Required)</Label>
                        <Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
                    </div>
                )}
            </div>
            <DialogFooter><Button onClick={handlePaymentSubmit}>Confirm Payment</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* HISTORY DIALOG */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Transaction History</DialogTitle></DialogHeader>
            <div className="space-y-2">
                {transactions.map((t) => (
                    <div key={t.id} className="flex justify-between items-center p-2 border rounded-md bg-muted/20">
                        <div>
                            <div className="font-bold">₹{t.amount} via {t.payment_mode}</div>
                            <div className="text-xs text-muted-foreground">{new Date(t.transaction_date).toDateString()}</div>
                        </div>
                        <Badge variant="outline">{t.remarks || 'Settled'}</Badge>
                    </div>
                ))}
                {transactions.length === 0 && <p className="text-center text-muted-foreground">No payments recorded yet.</p>}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}