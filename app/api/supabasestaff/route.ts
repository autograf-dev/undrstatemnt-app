import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/server/supabase';

// Always return staff enriched from Data_barbers so we have services membership and the Data_barbers Row ID
export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();

    // Source of truth for service membership is Data_barbers."Services/List"
    const barbersRes = await supabase
      .from('Data_barbers')
      // Columns with special characters MUST be quoted for PostgREST
      .select('"User/ID", "Barber/Name", "🔒 Row ID", "Services/List"');

    if (barbersRes.error) {
      console.error('[supabasestaff] query error:', barbersRes.error);
      return NextResponse.json(
        { error: 'Failed to fetch staff' },
        { status: 500 }
      );
    }

    const barbers = Array.isArray(barbersRes.data) ? barbersRes.data : [];

    const rows = barbers.map((r: any) => {
      const rawServices = r?.['Services/List'];
      const servicesList: string[] = Array.isArray(rawServices)
        ? rawServices.map((s: any) => String(s).trim()).filter(Boolean)
        : typeof rawServices === 'string'
          ? String(rawServices)
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];

      return {
        id: r?.['User/ID'] || r?.id || r?.userId || r?.user_id || '', // HighLevel user id for booking
        ghl_id: r?.['User/ID'] || '',
        name: r?.['Barber/Name'] || 'Staff',
        barberRowId: r?.['🔒 Row ID'] || null, // This is the key to join overrides
        servicesList,
      };
    });

    // Sort by name client-side to avoid quoting issues in order()
    rows.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}