import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/server/tokens';
import { saveEventToDB } from '@/lib/server/appointments';

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function pick(obj: URLSearchParams | Record<string, any>, ...keys: string[]) {
  for (const k of keys) {
    const v = obj instanceof URLSearchParams ? obj.get(k) : obj[k];
    if (v !== undefined && v !== null && String(v).length > 0) return v as string;
  }
  return undefined;
}

// Helper functions for validation
function ymdInTZ(date: Date): string {
  const dtf = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton', year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = dtf.formatToParts(date);
  const y = parts.find((p) => p.type === 'year')?.value || '';
  const m = parts.find((p) => p.type === 'month')?.value || '';
  const d = parts.find((p) => p.type === 'day')?.value || '';
  return `${y}-${m}-${d}`;
}

function minutesInTZ(date: Date): number {
  const edmonton = new Date(date.toLocaleString('en-US', { timeZone: 'America/Edmonton' }));
  return edmonton.getHours() * 60 + edmonton.getMinutes();
}

function dayOfWeekInTZ(date: Date): number {
  const edmonton = new Date(date.toLocaleString('en-US', { timeZone: 'America/Edmonton' }));
  return edmonton.getDay();
}

async function validateBookingSlot(params: Record<string, any>): Promise<{ valid: boolean; error?: string }> {
  try {
    const { getSupabaseServiceClient } = await import('@/lib/server/supabase');
    const supabase = getSupabaseServiceClient();
    
    const startTime = new Date(params.startTime);
    const endTime = new Date(params.endTime);
    const startMinutes = minutesInTZ(startTime);
    const endMinutes = minutesInTZ(endTime);
    const dateKey = ymdInTZ(startTime);
    const dateId = dateKey.replace(/-/g, '');
    const dayOfWeek = dayOfWeekInTZ(startTime);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[dayOfWeek];

    // Check existing bookings in ghl_events
    if (params.assignedUserId) {
      const { data: existingBookings } = await supabase
        .from('ghl_events')
        .select('start_time, end_time, appointment_status')
        .eq('assigned_user_id', params.assignedUserId)
        .eq('date_id', dateId)
        .neq('appointment_status', 'canceled');

      if (existingBookings && existingBookings.length > 0) {
        for (const booking of existingBookings) {
          const bookingStart = minutesInTZ(new Date(booking.start_time));
          const bookingEnd = minutesInTZ(new Date(booking.end_time));
          // Check for overlap: new booking starts before existing ends AND new booking ends after existing starts
          if (startMinutes < bookingEnd && endMinutes > bookingStart) {
            return { valid: false, error: 'This time slot has already been booked. Please select another time.' };
          }
        }
      }
    }

    // Check time blocks
    if (params.assignedUserId) {
      const { data: timeBlocks } = await supabase
        .from('time_block')
        .select('*')
        .eq('ghl_id', params.assignedUserId);

      if (timeBlocks && timeBlocks.length > 0) {
        for (const block of timeBlocks) {
          const blockStart = parseInt(block['Block/Start']);
          const blockEnd = parseInt(block['Block/End']);
          const recurringRaw = block['Block/Recurring'];
          const recurring = recurringRaw === true || String(recurringRaw).toLowerCase().replace(/["']/g, '') === 'true';

          let isBlocked = false;

          if (recurring) {
            // Check if current day matches recurring days
            const recurringDayStr = block['Block/Recurring Day'];
            if (recurringDayStr) {
              const recurringDays = String(recurringDayStr).replace(/[{}]/g, '').split(',').map((d: string) => d.trim());
              if (recurringDays.includes(currentDayName)) {
                // Check for overlap
                if (startMinutes < blockEnd && endMinutes > blockStart) {
                  isBlocked = true;
                }
              }
            }
          } else {
            // Check specific date
            const blockDateId = block['Block/Date -> ID Check'];
            if (blockDateId && String(blockDateId) === dateId) {
              // Check for overlap
              if (startMinutes < blockEnd && endMinutes > blockStart) {
                isBlocked = true;
              }
            }
          }

          if (isBlocked) {
            const blockName = block['Block/Name'] || 'Time Block';
            return { valid: false, error: `This time slot is blocked (${blockName}). Please select another time.` };
          }
        }
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('Validation error:', error);
    // On validation error, allow booking but log the issue
    return { valid: true };
  }
}

async function createAppointment(params: Record<string, any>) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('Access token missing');

  const payload: any = {
    title: params.title || 'Booking from website',
    meetingLocationType: 'custom',
    meetingLocationId: 'custom_0',
    overrideLocationConfig: true,
    appointmentStatus: 'confirmed',
    address: 'Zoom',
    ignoreDateRange: true,
    toNotify: true,
    ignoreFreeSlotValidation: false,
    calendarId: params.calendarId,
    locationId: process.env.GHL_LOCATION_ID || 'iwqzlJBNFlXynsezheHv',
    contactId: params.contactId,
    startTime: params.startTime,
    endTime: params.endTime,
  };
  if (params.assignedUserId) payload.assignedUserId = params.assignedUserId;

  const resp = await fetch('https://services.leadconnectorhq.com/calendars/events/appointments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, Version: '2021-04-15', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`Booking failed: ${resp.status} ${msg}`);
  }
  const data = await resp.json();
  return data;
}

export async function OPTIONS() { return new NextResponse('', { headers: cors() }); }

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params: Record<string, any> = {};

  const p = (k: string) => url.searchParams.get(k) || undefined;
  const picker = (...keys: string[]) => keys.map((k) => url.searchParams.get(k)).find((v) => v !== null && v !== '') || undefined;

  params.contactId = picker('contactId', 'contact_id');
  params.calendarId = picker('calendarId', 'calendar_id');
  params.assignedUserId = picker('assignedUserId', 'assigned_user_id');
  params.startTime = picker('startTime', 'start_time');
  params.endTime = picker('endTime', 'end_time');
  params.title = p('title') || 'Booking from website';
  params.serviceName = picker('serviceName', 'service_name');
  params.serviceDuration = picker('serviceDuration', 'booking_duration');
  params.servicePrice = picker('servicePrice', 'booking_price');
  params.staffName = picker('staffName', 'assigned_barber_name');
  params.paymentStatus = picker('paymentStatus', 'payment_status');
  params.customerName = picker('customerName', 'customer_name');
  params.customerFirstName = picker('customerFirstName', 'first_name');
  params.customerLastName = picker('customerLastName', 'last_name');
  params.customerPhone = picker('customerPhone', 'phone');
  // DEBUG: Log incoming phone
  console.log('[appointment] incoming customerPhone:', params.customerPhone);
  // If customerPhone is missing, fetch from HighLevel contact, but always prefer user input
  if ((!params.customerPhone || params.customerPhone.length < 8) && params.contactId) {
    try {
      const accessToken = await (await import('@/lib/server/tokens')).getValidAccessToken();
      const resp = await fetch('https://services.leadconnectorhq.com/contacts/' + params.contactId, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Version: '2021-04-15',
          'Content-Type': 'application/json',
        },
      });
      if (resp.ok) {
        const contact = await resp.json();
        params.customerPhone = contact.phone || contact.phoneNumber || params.customerPhone || '';
      }
    } catch (e) {
      console.error('Failed to fetch customer phone from HighLevel:', e);
    }
  }
  // DEBUG: Log final phone before webhook
  console.log('[appointment] final customerPhone for webhook:', params.customerPhone);

  // --- Fix: Always use ghl_id from staff table as assignedUserId if staffName is provided ---
  if ((!params.assignedUserId || params.assignedUserId.length < 10) && params.staffName) {
    try {
      // Lazy import to avoid top-level import cost
      const { getSupabaseServiceClient } = await import('@/lib/server/supabase');
      const supabase = getSupabaseServiceClient();
      // Try to match staffName to name, firstname, or lastname (case-insensitive, trimmed)
      const { data: staff, error } = await supabase
        .from('staff')
        .select('ghl_id, name, firstname, lastname')
        .ilike('name', `%${params.staffName.trim()}%`);
      if (error) throw error;
      let match = staff && staff.length > 0 ? staff[0] : null;
      // Fallback: try firstname/lastname if not found
      if (!match && params.staffName) {
        const { data: staff2 } = await supabase
          .from('staff')
          .select('ghl_id, name, firstname, lastname')
          .or(`firstname.ilike.%${params.staffName.trim()}%,lastname.ilike.%${params.staffName.trim()}%`);
        if (staff2 && staff2.length > 0) match = staff2[0];
      }
      if (match && match.ghl_id) {
        params.assignedUserId = match.ghl_id;
      } else {
        return NextResponse.json({ error: 'Could not find the correct barber ID. Please contact support.' }, { status: 400, headers: cors() });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Could not find the correct barber ID. Please contact support.' }, { status: 400, headers: cors() });
    }
  }

  if (!params.contactId || !params.calendarId || !params.startTime || !params.endTime) {
    return NextResponse.json({ error: 'Missing required parameters: contactId, calendarId, startTime, endTime' }, { status: 400, headers: cors() });
  }

  try {
    console.log('[appointment] booking with params', {
      calendarId: params.calendarId,
      assignedUserId: params.assignedUserId,
      contactId: params.contactId,
      startTime: params.startTime,
      endTime: params.endTime,
      staffName: params.staffName,
      serviceName: params.serviceName,
      serviceDuration: params.serviceDuration,
    });
  } catch {}

  // Validate slot availability before booking
  const validation = await validateBookingSlot(params);
  if (!validation.valid) {
    console.log('[appointment] validation failed:', validation.error);
    return NextResponse.json({ error: validation.error }, { status: 409, headers: cors() });
  }

  // Helper to get minutes since midnight in America/Edmonton
  function getMinutesInEdmonton(dateString: string): number | null {
    if (!dateString) return null;
    const d = new Date(dateString);
    const edmonton = new Date(d.toLocaleString('en-US', { timeZone: 'America/Edmonton' }));
    return edmonton.getHours() * 60 + edmonton.getMinutes();
  }

  let booking;
  let enhanced;
  try {
    booking = await createAppointment(params);
    // Enrich and save to DB
    enhanced = {
      serviceName: params.serviceName,
      serviceDuration: params.serviceDuration ? Number(params.serviceDuration) : undefined,
      servicePrice: params.servicePrice ? Number(params.servicePrice) : undefined,
      staffName: params.staffName,
      paymentStatus: params.paymentStatus,
      customerName: params.customerName || [params.customerFirstName, params.customerLastName].filter(Boolean).join(' ') || undefined,
      customerPhone: params.customerPhone || '',
      startTime: params.startTime,
      endTime: params.endTime,
      assignedUserId: params.assignedUserId,
      apptId: booking?.id,
    };
  } catch (err: any) {
    console.error('❌ Booking failed:', err?.message || err);
    return NextResponse.json({ error: 'Booking failed', details: err?.message || 'Unknown' }, { status: 500, headers: cors() });
  }

  // Send to webhook (simple)
  try {
    const webhookPayload = {
      "Barber": params.staffName || params.assignedUserName || "",
      "Service": params.serviceName || params.title || "",
      "Customer": params.customerName || [params.customerFirstName, params.customerLastName].filter(Boolean).join(' ') || "",
      "CustomerPhone": params.customerPhone || "",
      "BookingId": booking?.id || "",
      "Date": (params.startTime ? new Date(params.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' }).replace(/-/g, '') : ""),
      "Start": getMinutesInEdmonton(params.startTime),
      "End (Buffer)": getMinutesInEdmonton(params.endTime),
      "Status ": params.appointmentStatus || booking.appointmentStatus || "Confirmed"
    };
    await fetch("https://primary-rmsi-production2.up.railway.app/webhook/e6aeb66b-e5c3-42e6-bc12-172900db6801", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload)
    });
  } catch (e) {
    console.error("Webhook send failed:", (e as Error).message);
  }

  try { await saveEventToDB({ ...booking, ...enhanced }); } catch (e) { console.error('DB save failed:', (e as Error).message); }

  try {
    console.log('[appointment] booking created', { id: booking?.id, status: booking?.appointmentStatus, assignedUserId: params.assignedUserId });
  } catch {}
  return NextResponse.json({ message: '✅ Booking success', response: booking }, { headers: cors() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const params = body || {};
    if (!params.contactId || !params.calendarId || !params.startTime || !params.endTime) {
      return NextResponse.json({ error: 'Missing required parameters: contactId, calendarId, startTime, endTime' }, { status: 400, headers: cors() });
    }
    
    // Validate slot availability before booking
    const validation = await validateBookingSlot(params);
    if (!validation.valid) {
      console.log('[appointment] POST validation failed:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 409, headers: cors() });
    }
    
    const booking = await createAppointment(params);
    try { await saveEventToDB(booking); } catch (e) { console.error('DB save failed:', (e as Error).message); }
    return NextResponse.json({ message: '✅ Booking success', response: booking }, { headers: cors() });
  } catch (err: any) {
    console.error('❌ Booking failed:', err?.message || err);
    return NextResponse.json({ error: 'Booking failed', details: err?.message || 'Unknown' }, { status: 500, headers: cors() });
  }
}
