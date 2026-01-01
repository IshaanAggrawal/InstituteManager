import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Fetch fees with student details
    // Note: Supabase doesn't support comparing two columns (paid < total) directly in a simple select 
    // without a Stored Procedure. We fetch relevant records and filter in JS.
    const { data: fees, error } = await supabase
      .from('fees')
      .select(`
        total_amount,
        paid_amount,
        due_date,
        students ( name, roll_no, parent_phone, batch )
      `);

    if (error) throw error;

    // 2. Filter for PENDING dues only
    const defaulters = (fees || []).filter((record: any) => {
        return record.paid_amount < record.total_amount;
    }).map((record: any) => ({
        name: record.students.name,
        roll_no: record.students.roll_no, // Added Roll No as requested
        phone: record.students.parent_phone,
        batch: record.students.batch,
        due_amount: record.total_amount - record.paid_amount,
        due_date: record.due_date
    }));

    if (defaulters.length === 0) {
        return NextResponse.json({ success: false, message: 'No pending dues found.' });
    }

    // 3. Send to n8n
    const N8N_URL = process.env.N8N_FEE_REMINDER_WEBHOOK; 
    
    if (!N8N_URL) {
        return NextResponse.json({ success: false, message: 'Server Error: Webhook Config Missing' });
    }

    await fetch(N8N_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: defaulters })
    });

    return NextResponse.json({ 
        success: true, 
        message: `Sent reminders to ${defaulters.length} students (Included Roll Nos).` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}