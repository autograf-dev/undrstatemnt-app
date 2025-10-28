import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/server/tokens';

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

async function fetchWithRetry(url: string, headers: Record<string, string>, retries = 3, delay = 500) {
  try {
    const res = await fetch(url, { headers, cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    return res;
  } catch (e: any) {
    if (String(e.message) === '429' && retries > 0) {
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, headers, retries - 1, delay * 2);
    }
    throw e;
  }
}

export async function OPTIONS() {
  return new NextResponse('', { headers: cors() });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token missing' }, { status: 401, headers: cors() });
    }

    const locationId = url.searchParams.get('locationId') || process.env.GHL_LOCATION_ID || 'iwqzlJBNFlXynsezheHv';
    const calendarId = url.searchParams.get('calendarId') || url.searchParams.get('id');

    if (calendarId) {
      const resp = await fetchWithRetry(
        `https://services.leadconnectorhq.com/calendars/${calendarId}`,
        { Authorization: `Bearer ${accessToken}`, Version: '2021-04-15' }
      );
      const data = await resp.json();
      return NextResponse.json({ success: true, service: data, calendar: data }, { headers: cors() });
    }

    const resp = await fetchWithRetry(
      `https://services.leadconnectorhq.com/calendars/?locationId=${locationId}`,
      { Authorization: `Bearer ${accessToken}`, Version: '2021-04-15' }
    );
    const data = await resp.json();
    const calendars = data?.calendars || [];
    return NextResponse.json({ success: true, locationId, total: calendars.length, calendars, services: calendars }, { headers: cors() });
  } catch (err: any) {
    console.error('services error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500, headers: cors() });
  }
}
