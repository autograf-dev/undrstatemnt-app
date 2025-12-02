import { NextResponse } from 'next/server';
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

const TARGET_TZ = 'America/Edmonton';

function ymdInTZ(date: Date) {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: TARGET_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = dtf.formatToParts(date);
  const y = parts.find((p) => p.type === 'year')!.value;
  const m = parts.find((p) => p.type === 'month')!.value;
  const d = parts.find((p) => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
}

function normalizeYmdToken(token: string): string | null {
  const digits = String(token || '').replace(/\D/g, '');
  if (digits.length === 8) return digits;
  if (digits.length === 7) {
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6);
    return `${y}${m}${d.padStart(2, '0')}`;
  }
  return null;
}

function minutesInTZ(date: Date) {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: TARGET_TZ,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = dtf.formatToParts(date);
  const hh = parseInt(parts.find((p) => p.type === 'hour')!.value, 10);
  const mm = parseInt(parts.find((p) => p.type === 'minute')!.value, 10);
  return hh * 60 + mm;
}

function displayFromMinutes(mins: number) {
  let h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function dayOfWeekInTZ(date: Date) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: TARGET_TZ,
    weekday: 'long',
  });
  const name = dtf.format(date);
  const map: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  return map[name];
}

function tzTodayDate() {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: TARGET_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return dtf.format(new Date());
}

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServiceClient();
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId');
    const userId = searchParams.get('userId');
    const serviceDurationMinutes = parseInt(searchParams.get('serviceDuration') || '60', 10);

    if (!calendarId) {
      return NextResponse.json({ error: 'Missing calendarId' }, { status: 400, headers: cors() });
    }

    const now = new Date();
    const nowMinutes = minutesInTZ(now);
    const todayYmd = ymdInTZ(now);

    // Get business hours
    const { data: bizHours } = await supabase
      .from('Trading_hours')
      .select('*')
      .eq('barber_id', calendarId)
      .single();

    if (!bizHours) {
      return NextResponse.json({ error: 'No business hours found' }, { status: 404, headers: cors() });
    }

    // Get barber details if userId provided
    let barberHours = null;
    if (userId && userId !== 'any') {
      const { data: barber } = await supabase
        .from('Data_barbers')
        .select('*')
        .eq('id', userId)
        .single();
      if (barber) barberHours = barber;
    }

    // Get time-off
    const { data: timeOffData } = await supabase
      .from('time_off')
      .select('*')
      .eq('user_id', userId || calendarId);

    // Get time blocks
    const { data: timeBlocksData } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', userId || calendarId);

    // Get existing bookings
    const { data: ghlEvents } = await supabase
      .from('ghl_events')
      .select('*')
      .eq('calendar_id', calendarId)
      .gte('start_time', new Date().toISOString());

    // Search up to 120 days for first available slot
    let foundSlot = false;
    let firstDate = '';
    let firstTime = '';
    
    for (let dayOffset = 0; dayOffset < 120 && !foundSlot; dayOffset++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() + dayOffset);
      const checkYmd = ymdInTZ(checkDate);
      const dow = dayOfWeekInTZ(checkDate);
      const dowName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dow];
      
      // Check if business is open this day
      const dayHours = bizHours[dowName];
      if (!dayHours || dayHours.closed) continue;
      
      // Check barber hours if specified
      if (barberHours) {
        const barberDayHours = barberHours[dowName];
        if (!barberDayHours || barberDayHours.closed) continue;
      }
      
      // Check time-off
      const checkYmdInt = parseInt(checkYmd.replace(/-/g, ''), 10);
      const isTimeOff = timeOffData?.some((off) => {
        const startInt = normalizeYmdToken(off.start_date);
        const endInt = normalizeYmdToken(off.end_date);
        if (!startInt || !endInt) return false;
        return checkYmdInt >= parseInt(startInt, 10) && checkYmdInt <= parseInt(endInt, 10);
      });
      if (isTimeOff) continue;
      
      // Parse hours
      const bizStart = parseInt(dayHours.open.split(':')[0]) * 60 + parseInt(dayHours.open.split(':')[1]);
      const bizEnd = parseInt(dayHours.close.split(':')[0]) * 60 + parseInt(dayHours.close.split(':')[1]);
      
      let effectiveStart = bizStart;
      let effectiveEnd = bizEnd;
      
      if (barberHours && barberHours[dowName] && !barberHours[dowName].closed) {
        const barberStart = parseInt(barberHours[dowName].open.split(':')[0]) * 60 + parseInt(barberHours[dowName].open.split(':')[1]);
        const barberEnd = parseInt(barberHours[dowName].close.split(':')[0]) * 60 + parseInt(barberHours[dowName].close.split(':')[1]);
        effectiveStart = Math.max(effectiveStart, barberStart);
        effectiveEnd = Math.min(effectiveEnd, barberEnd);
      }
      
      // If today, start from current time + 15 min buffer
      let startMinute = effectiveStart;
      if (checkYmd === todayYmd) {
        startMinute = Math.max(effectiveStart, nowMinutes + 15);
      }
      
      // Generate 15-min slots
      for (let slotStart = startMinute; slotStart < effectiveEnd; slotStart += 15) {
        const slotEnd = slotStart + serviceDurationMinutes;
        if (slotEnd > effectiveEnd) break;
        
        // Check time blocks
        const isBlocked = timeBlocksData?.some((block) => {
          const blockYmdInt = normalizeYmdToken(block.date);
          if (!blockYmdInt || parseInt(blockYmdInt, 10) !== checkYmdInt) return false;
          
          const blockStart = parseInt(block.start_time.split(':')[0]) * 60 + parseInt(block.start_time.split(':')[1]);
          const blockEnd = parseInt(block.end_time.split(':')[0]) * 60 + parseInt(block.end_time.split(':')[1]);
          
          return !(slotEnd <= blockStart || slotStart >= blockEnd);
        });
        if (isBlocked) continue;
        
        // Check existing bookings
        const slotTime = displayFromMinutes(slotStart);
        const isBooked = ghlEvents?.some((event) => {
          const eventDate = event.start_time ? event.start_time.split('T')[0] : '';
          if (eventDate !== checkYmd) return false;
          
          const eventStartTime = new Date(event.start_time).toLocaleTimeString('en-US', {
            timeZone: TARGET_TZ,
            hour12: true,
            hour: '2-digit',
            minute: '2-digit'
          });
          
          return eventStartTime === slotTime;
        });
        if (isBooked) continue;
        
        // Found first available slot!
        foundSlot = true;
        firstDate = checkYmd;
        firstTime = slotTime;
        break;
      }
    }
    
    if (!foundSlot) {
      return NextResponse.json({
        available: false,
        message: 'No available slots found in the next 120 days'
      }, { headers: cors() });
    }
    
    return NextResponse.json({
      available: true,
      date: firstDate,
      time: firstTime,
      calendarId
    }, { headers: cors() });
    
  } catch (error) {
    console.error('Error finding first available slot:', error);
    return NextResponse.json(
      { error: 'Failed to find first available slot' },
      { status: 500, headers: cors() }
    );
  }
}
