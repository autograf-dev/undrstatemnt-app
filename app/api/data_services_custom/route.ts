import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/server/supabase';

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
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
      .from('Data_Services_Custom')
      .select('*');
    if (error) return NextResponse.json({ error: 'Failed to fetch Data_Services_Custom' }, { status: status || 500, headers: cors() });
    return NextResponse.json(data ?? [], { headers: cors() });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500, headers: cors() });
  }
}


