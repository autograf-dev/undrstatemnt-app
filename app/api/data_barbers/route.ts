import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/server/supabase';

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  } as Record<string, string>;
}

export async function OPTIONS() {
  return new NextResponse('', { headers: cors() });
}

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error, status } = await (supabase as any)
      .from('Data_barbers')
      .select('*');

    if (error) {
      console.error('[data_barbers] GET error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch Data_barbers' }, { status: status || 500, headers: cors() });
    }
    return NextResponse.json(data ?? [], { headers: cors() });
  } catch (err: any) {
    console.error('[data_barbers] GET exception:', err?.message || err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500, headers: cors() });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    const rows = Array.isArray(payload) ? payload : [payload];
    const supabase = getSupabaseServiceClient();

    const { data, error, status } = await (supabase as any)
      .from('Data_barbers')
      .insert(rows)
      .select('*');

    if (error) {
      console.error('[data_barbers] POST error:', error.message);
      return NextResponse.json({ error: 'Failed to insert into Data_barbers' }, { status: status || 500, headers: cors() });
    }
    return NextResponse.json(data ?? [], { status: 201, headers: cors() });
  } catch (err: any) {
    console.error('[data_barbers] POST exception:', err?.message || err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500, headers: cors() });
  }
}


