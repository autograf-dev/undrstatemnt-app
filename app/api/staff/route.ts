import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/server/tokens';
import { getSupabaseServiceClient } from '@/lib/server/supabase';

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse('', { headers: cors() });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const source = (url.searchParams.get('source') || 'ghl').toLowerCase(); // 'supabase' | 'ghl'
    const userId = url.searchParams.get('id');

    if (source === 'supabase') {
      // Return all staff (or filter by id if provided) from Supabase
      const supabase = getSupabaseServiceClient();
      let query = supabase.from('staff').select('*');
      if (userId) {
        // Try matching either ghl_id or id
        query = query.or(`ghl_id.eq.${userId},id.eq.${userId}`);
      }
      query = query.order('name', { ascending: true });

      const { data, error, status } = await query;
      if (error) {
        console.error('Supabase staff error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: status || 500, headers: cors() });
      }
      return NextResponse.json(data ?? [], { headers: cors() });
    }

    // Default/highlevel path: require userId
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId in query string (?id=...)' }, { status: 400, headers: cors() });
    }

    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token missing' }, { status: 401, headers: cors() });
    }

    const resp = await fetch(`https://services.leadconnectorhq.com/users/${userId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}`, Version: '2021-04-15' },
      cache: 'no-store',
    });

    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json({ error: data }, { status: resp.status, headers: cors() });
    }
    return NextResponse.json(data, { headers: cors() });
  } catch (err: any) {
    console.error('❌ Error in staff route:', err?.message || err);
    return NextResponse.json({ error: 'Failed to fetch staff info' }, { status: 500, headers: cors() });
  }
}

