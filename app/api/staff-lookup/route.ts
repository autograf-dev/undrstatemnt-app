import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/server/supabase';

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServiceClient();
    const url = new URL(req.url);
    const name = url.searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Name parameter required' }, { status: 400 });
    }

    // Normalize name for matching (trim and lowercase)
    const normalizedName = name.trim().toLowerCase();

    // Query the staff table for matching name
    const { data, error } = await supabase
      .from('staff')
      .select('ghl_id')
      .eq('name', normalizedName)
      .maybeSingle();

    if (error) {
      console.error('Supabase error fetching staff ghl_id:', error);
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }

    if (!data) {
      // Try fuzzy match if exact match fails (e.g., handle "Daniel  " vs "Daniel")
      const { data: fuzzyData, error: fuzzyError } = await supabase
        .from('staff')
        .select('ghl_id, name')
        .ilike('name', `%${normalizedName}%`);

      if (fuzzyError || !fuzzyData || fuzzyData.length === 0) {
        return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
      }

      // Take the first match
      return NextResponse.json({ ghl_id: fuzzyData[0].ghl_id });
    }

    return NextResponse.json({ ghl_id: data.ghl_id });
  } catch (error: any) {
    console.error('Error fetching staff ghl_id:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}