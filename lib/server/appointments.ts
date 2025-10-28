import { getSupabaseServiceClient } from './supabase';
import { getStoredTokens } from './tokens';

const TARGET_TZ = 'America/Edmonton';

function dateIdInTz(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const dtf = new Intl.DateTimeFormat('en-CA', { timeZone: TARGET_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = dtf.formatToParts(d);
  const y = parts.find((p) => p.type === 'year')?.value || '';
  const m = parts.find((p) => p.type === 'month')?.value || '';
  const dd = parts.find((p) => p.type === 'day')?.value || '';
  return y && m && dd ? `${y}${m}${dd}` : null;
}

export async function saveEventToDB(booking: any) {
  const supabase = getSupabaseServiceClient();
  const stored = await getStoredTokens().catch(() => null as any);
  const fallbackLocationId = process.env.GHL_LOCATION_ID || stored?.location_id || null;
  const glideRowId = booking.id || booking.apptId || `${Date.now()}_${booking.contactId || 'contact'}_${booking.calendarId || 'cal'}`;
  const mapped = {
    id: booking.id,
    location_id: booking.locationId ?? fallbackLocationId,
    contact_id: booking.contactId ?? null,
    assigned_user_id: booking.assignedUserId ?? null,
    appointment_status: booking.appointmentStatus ?? null,
    title: booking.title ?? null,
    start_time: booking.startTime ?? null,
    end_time: booking.endTime ?? null,
    calendar_id: booking.calendarId ?? null,
    payment_status: booking.paymentStatus ?? null,
    date_id: dateIdInTz(booking.startTime),
    glide_row_id: glideRowId,
    raw: booking.raw ?? booking ?? {},
  };
  const { data, error } = await supabase.from('ghl_events').insert([mapped]).select();
  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data;
}
