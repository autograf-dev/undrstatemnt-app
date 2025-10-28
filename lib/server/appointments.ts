import { getSupabaseServiceClient } from './supabase';

export async function saveEventToDB(booking: any) {
  const supabase = getSupabaseServiceClient();
  const mapped = {
    id: booking.id,
    location_id: booking.locationId ?? null,
    contact_id: booking.contactId ?? null,
    assigned_user_id: booking.assignedUserId ?? null,
    appointment_status: booking.appointmentStatus ?? null,
    title: booking.title ?? null,
    start_time: booking.startTime ?? null,
    end_time: booking.endTime ?? null,
    raw: booking.raw ?? booking ?? {},
  };
  const { data, error } = await supabase.from('ghl_events').insert([mapped]).select();
  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data;
}
