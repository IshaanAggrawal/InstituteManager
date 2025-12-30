import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { results } = body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'No data found in the Excel file.' },
        { status: 400 }
      );
    }

    const N8N_URL = process.env.N8N_RESULTS_WEBHOOK;

    if (!N8N_URL) {
      return NextResponse.json(
        { error: 'Server Error: N8N Webhook URL is not configured.' },
        { status: 500 }
      );
    }

    const n8nResponse = await fetch(N8N_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: results, 
        timestamp: new Date().toISOString(),
      }),
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n responded with ${n8nResponse.status}`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully sent ${results.length} records to processing.`,
    });

  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to process results. Please try again.' },
      { status: 500 }
    );
  }
}