import { getSupabaseServiceClient } from './supabase';

const {
  CLIENT_ID,
  CLIENT_SECRET,
  TOKEN_ENDPOINT,
} = process.env;

export async function saveTokensToDB(data: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id?: string;
  location_id?: string;
}) {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from('tokens').insert([
    {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      user_id: data.user_id ?? null,
      location_id: data.location_id ?? null,
      created_at: new Date().toISOString(),
    },
  ]);
  if (error) throw new Error(`DB Save Error: ${error.message}`);
}

export async function getStoredTokens() {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw new Error(`DB Read Error: ${error.message}`);
  return data?.[0] || null;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!CLIENT_ID || !CLIENT_SECRET || !TOKEN_ENDPOINT) {
    throw new Error('Missing CLIENT_ID, CLIENT_SECRET or TOKEN_ENDPOINT');
  }
  const stored = await getStoredTokens();
  const currentRefreshToken = stored?.refresh_token;
  if (!currentRefreshToken) throw new Error('No refresh token available in DB');

  const payload = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: currentRefreshToken,
    user_type: 'Location',
  });

  const resp = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: payload.toString(),
  });

  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`Token refresh failed: ${resp.status} ${msg}`);
  }
  const data = await resp.json();
  const tokens = {
    access_token: data.access_token as string,
    refresh_token: data.refresh_token as string,
    expires_in: Number(data.expires_in),
    user_id: data.userId as string | undefined,
    location_id: data.locationId as string | undefined,
  };
  await saveTokensToDB(tokens);
  return tokens.access_token;
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getStoredTokens();
  if (!tokens) return await refreshAccessToken();
  const fetchedTime = new Date(tokens.created_at).getTime();
  const expiresInMs = Number(tokens.expires_in) * 1000;
  const now = Date.now();
  if (now - fetchedTime > expiresInMs - 60000) {
    return await refreshAccessToken();
  }
  return tokens.access_token as string;
}
