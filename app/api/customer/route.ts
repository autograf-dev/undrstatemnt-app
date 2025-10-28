import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/server/tokens';

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

async function findContactByQuery(accessToken: string, locationId: string, query: string) {
  try {
    // HighLevel supports searching contacts via POST /contacts/search with a query string
    const resp = await fetch('https://services.leadconnectorhq.com/contacts/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Version: '2021-04-15',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locationId, query }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const items = Array.isArray(data.contacts) ? data.contacts : Array.isArray(data) ? data : [];
    return items?.[0] ?? null;
  } catch {
    return null;
  }
}

async function createContact(accessToken: string, locationId: string, firstName: string, lastName: string, phone: string) {
  const payload = {
    firstName,
    lastName,
    phone,
    locationId,
  };
  const resp = await fetch('https://services.leadconnectorhq.com/contacts/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Version: '2021-04-15',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`Create contact failed: ${resp.status} ${msg}`);
  }
  return resp.json();
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const firstName = (url.searchParams.get('firstName') || '').trim();
    const lastName = (url.searchParams.get('lastName') || '').trim();
    const phone = (url.searchParams.get('phone') || '').replace(/\D/g, '');
    if (!phone) return NextResponse.json({ error: 'phone is required' }, { status: 400, headers: cors() });

    const accessToken = await getValidAccessToken();
    if (!accessToken) return NextResponse.json({ error: 'Access token missing' }, { status: 401, headers: cors() });

    const locationId = process.env.GHL_LOCATION_ID || 'iwqzlJBNFlXynsezheHv';

    // Try to find by phone first; if not found, create
    const found = await findContactByQuery(accessToken, locationId, phone);
    if (found) return NextResponse.json(found, { headers: cors() });

    const created = await createContact(accessToken, locationId, firstName || 'Guest', lastName || 'User', phone);
    return NextResponse.json(created, { headers: cors() });
  } catch (err: any) {
    console.error('customer error:', err?.message || err);
    return NextResponse.json({ error: 'Failed to upsert customer', details: err?.message }, { status: 500, headers: cors() });
  }
}
