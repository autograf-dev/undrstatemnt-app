import { NextResponse } from 'next/server';
import { getValidAccessToken, getStoredTokens } from '@/lib/server/tokens';

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

function toE164(phoneRaw: string) {
  const digits = (phoneRaw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+1${digits}`; // assume CA/US
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.startsWith('0')) return digits; // leave as-is (unlikely, but avoid breaking)
  return digits.startsWith('+') ? digits : `+${digits}`;
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
    // If duplicate contact is disallowed but we get an existing contact ID back, treat as success
    try {
      const json = JSON.parse(msg);
      const dupId = json?.meta?.contactId || json?.contactId;
      if (dupId) {
        return { id: dupId, contactId: dupId, status: 'exists' };
      }
    } catch {}
    throw new Error(`Create contact failed: ${resp.status} ${msg}`);
  }
  return resp.json();
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const firstName = (url.searchParams.get('firstName') || '').trim();
    const lastName = (url.searchParams.get('lastName') || '').trim();
    const phoneRaw = url.searchParams.get('phone') || '';
    const phoneDigits = phoneRaw.replace(/\D/g, '');
    if (!phoneDigits) return NextResponse.json({ error: 'phone is required' }, { status: 400, headers: cors() });

    const phoneE164 = toE164(phoneRaw);

    const accessToken = await getValidAccessToken();
    if (!accessToken) return NextResponse.json({ error: 'Access token missing' }, { status: 401, headers: cors() });

    // prefer env; else use the most recent token's location_id; finally a static fallback
    const stored = await getStoredTokens().catch(() => null as any);
    const locationId = process.env.GHL_LOCATION_ID || stored?.location_id || 'iwqzlJBNFlXynsezheHv';

    // Try to find by phone first; if not found, create
    // Try E.164 first, then raw digits as a fallback
    let found = await findContactByQuery(accessToken, locationId, phoneE164);
    if (!found) found = await findContactByQuery(accessToken, locationId, phoneDigits);
    if (found) return NextResponse.json(found, { headers: cors() });

    const created = await createContact(accessToken, locationId, firstName || 'Guest', lastName || 'User', phoneE164);
    return NextResponse.json(created, { headers: cors() });
  } catch (err: any) {
    // If upstream returned structured JSON inside message, try to pass it along
    const msg = err?.message || 'Unknown error';
    console.error('customer error:', msg);
    const isClientIssue = /Create contact failed: 4\d\d/.test(msg) || /phone is required/.test(msg);
    return NextResponse.json({ error: 'Failed to upsert customer', details: msg }, { status: isClientIssue ? 400 : 500, headers: cors() });
  }
}
