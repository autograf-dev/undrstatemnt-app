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
  const parts = dtf.formatToParts(new Date());
  const y = parseInt(parts.find((p) => p.type === 'year')!.value, 10);
  const m = parseInt(parts.find((p) => p.type === 'month')!.value, 10);
  const d = parseInt(parts.find((p) => p.type === 'day')!.value, 10);
  return new Date(y, m - 1, d);
}

function isWithinRangeExclusiveEnd(minutes: number, start: number, end: number) {
  return minutes >= start && minutes < end;
}

function buildStaticSlotsMinutes(days: Date[], intervalMinutes = 30) {
  const out: Record<string, { minutes: number[] }> = {};
  for (const day of days) {
    const dateKey = ymdInTZ(day);
    const minutes: number[] = [];
    for (let t = 0; t <= 23 * 60 + 59; t += intervalMinutes) minutes.push(t);
    out[dateKey] = { minutes };
  }
  return out;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const calendarId = url.searchParams.get('calendarId') || '';
  const userId = url.searchParams.get('userId') || undefined;
  const date = url.searchParams.get('date') || undefined;
  const serviceDurationParam = url.searchParams.get('serviceDuration') || undefined;

  if (!calendarId) {
    return NextResponse.json({ error: 'calendarId is required' }, { status: 400, headers: cors() });
  }

  const serviceDurationMinutes = serviceDurationParam ? parseInt(serviceDurationParam) : 30;

  try {
    const supabase = getSupabaseServiceClient();

    let startDate = tzTodayDate();
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3) startDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }

    const totalDays = 30;
    const daysToCheck: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate); d.setDate(startDate.getDate() + i); daysToCheck.push(d);
    }

    const startOfRange = new Date(daysToCheck[0].getFullYear(), daysToCheck[0].getMonth(), daysToCheck[0].getDate(), 0, 0, 0);
    const endOfRange = new Date(daysToCheck[daysToCheck.length - 1].getFullYear(), daysToCheck[daysToCheck.length - 1].getMonth(), daysToCheck[daysToCheck.length - 1].getDate(), 23, 59, 59);

    const slotsData = buildStaticSlotsMinutes(daysToCheck, 30);

    // Business hours: use "Trading_hours" table
    const businessHoursMap: Record<number, { open_time: number; close_time: number }> = {};
    {
      const nameToIndex: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
      const { data: tradingHoursData, error: thError } = await supabase.from('Trading_hours').select('*');
      if (thError) throw new Error('Failed to fetch Trading_hours');
      (tradingHoursData || []).forEach((item: any) => {
        const idx = nameToIndex[item['Day/Name']] ?? undefined;
        if (idx === undefined) return;
        const openRaw = item['Day/Start'];
        const closeRaw = item['Day/End'];
        // If either is null/undefined/NaN, treat day as closed
        if (openRaw == null || closeRaw == null) return;
        const open_time = Number(openRaw);
        const close_time = Number(closeRaw);
        if (!Number.isFinite(open_time) || !Number.isFinite(close_time)) return;
        businessHoursMap[idx] = { open_time, close_time };
      });
    }

    // Barber hours from Data_barbers + simple day-off via zeros or flags
    let barberHoursMap: Record<number, { start: number; end: number }> = {};
    let barberWeekendIndexes: number[] = [];
    let hasBarber = false;
    let resolvedBarberData: any = null;
    if (userId) {
      // Try by GHL_id first, then by User/ID; be lenient on errors
      let barberData: any = null;
      try {
        let res = await supabase
          .from('Data_barbers')
          .select('*')
          .eq('GHL_id', userId)
          .maybeSingle();
        if (res.data) barberData = res.data;
        if (!barberData) {
          res = await supabase
            .from('Data_barbers')
            .select('*')
            .eq('User/ID', userId)
            .maybeSingle();
          if (res.data) barberData = res.data;
        }
      } catch (_) {
        // swallow and proceed without barber-specific hours
      }
      if (barberData) { hasBarber = true; resolvedBarberData = barberData; }
      if (barberData) { hasBarber = true; resolvedBarberData = barberData; }

      const dayNameToIndex: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
      barberHoursMap = {
        0: { start: parseInt(barberData?.['Sunday/Start Value']) || 0, end: parseInt(barberData?.['Sunday/End Value']) || 0 },
        1: { start: parseInt(barberData?.['Monday/Start Value']) || 0, end: parseInt(barberData?.['Monday/End Value']) || 0 },
        2: { start: parseInt(barberData?.['Tuesday/Start Value']) || 0, end: parseInt(barberData?.['Tuesday/End Value']) || 0 },
        3: { start: parseInt(barberData?.['Wednesday/Start Value']) || 0, end: parseInt(barberData?.['Wednesday/End Value']) || 0 },
        4: { start: parseInt(barberData?.['Thursday/Start Value']) || 0, end: parseInt(barberData?.['Thursday/End Value']) || 0 },
        5: { start: parseInt(barberData?.['Friday/Start Value']) || 0, end: parseInt(barberData?.['Friday/End Value']) || 0 },
        6: { start: parseInt(barberData?.['Saturday/Start Value']) || 0, end: parseInt(barberData?.['Saturday/End Value']) || 0 },
      };

      // Optional: treat "Sunday/Day Off" or Availability booleans as day-off flags
      if (barberData && String(barberData?.['Sunday/Day Off']).toLowerCase().includes('day off')) barberWeekendIndexes.push(0);
    }

    // Time off: read directly from the resolved Data_barbers row
    let timeOffList: { start: Date; end: Date }[] = [];
    if (hasBarber) {
      const raw = (resolvedBarberData as any)?.['Time Off/Unavailable Dates'] as string | undefined;
      if (raw) {
        const items = String(raw).split(',').map((s) => s.trim()).filter((s) => /^\d{8}$/.test(s));
        timeOffList = items.map((v) => {
          const y = v.slice(0, 4), m = v.slice(4, 6), d = v.slice(6, 8);
          return { start: new Date(`${y}-${m}-${d}T00:00:00`), end: new Date(`${y}-${m}-${d}T23:59:59`) };
        });
      }
    }
    const isDateInTimeOff = (date: Date) => {
      const dayKey = ymdInTZ(date);
      for (const p of timeOffList) {
        const s = ymdInTZ(p.start); const e = ymdInTZ(p.end);
        if (dayKey >= s && dayKey < e) return true;
      }
      return false;
    };

    // Time blocks: match by barber's GHL_id, request userId, or Barber/ID (Data_barbers row id)
    let timeBlockList: any[] = [];
    if (hasBarber) {
      const barberRowId: string | undefined = (resolvedBarberData as any)?.['\uD83D\uDD12 Row ID'] || (resolvedBarberData as any)?.['🔒 Row ID'];
      const barberGhlId: string | undefined = (resolvedBarberData as any)?.['GHL_id'];
      let blockData: any[] | null = null;
      try {
        const filters: string[] = [];
        // eq on ghl_id using either resolved barberGhlId or provided userId
        if (barberGhlId) filters.push(`ghl_id.eq.${barberGhlId}`);
        if (userId) filters.push(`ghl_id.eq.${userId}`);
        if (barberRowId) filters.push(`Barber/ID.eq.${barberRowId}`);
        if (filters.length > 0) {
          const { data } = await supabase
            .from('time_block')
            .select('*')
            .or(filters.join(','));
          if (Array.isArray(data)) blockData = data;
        } else {
          const { data } = await supabase.from('time_block').select('*');
          if (Array.isArray(data)) blockData = data;
        }
      } catch (_) {
        blockData = [];
      }
      timeBlockList = (blockData || []).map((item: any) => {
        const raw = item['Block/Recurring'];
        const recurring = raw === true || String(raw).toLowerCase().replace(/["']/g, '') === 'true';
        let recurringDays: string[] = [];
        if (recurring && item['Block/Recurring Day']) recurringDays = String(item['Block/Recurring Day']).split(',').map((d) => d.trim());
        return {
          start: parseInt(item['Block/Start']),
          end: parseInt(item['Block/End']),
          date: item['Block/Date'] || null,
          recurring,
          recurringDays,
          name: item['Block/Name'] || 'Time Block',
        };
      });
    }

    // Existing bookings: skip for now per request
    const existingBookings: any[] = [];

    const isSlotBooked = (slotDate: Date, slotMinutes: number, durMinutes: number) => {
      const slotDayKey = ymdInTZ(slotDate);
      const slotEnd = slotMinutes + durMinutes;
      for (const b of existingBookings) {
        if (b.startDayKey === slotDayKey) if (slotMinutes < b.endMinutes && slotEnd > b.startMinutes) return true;
      }
      return false;
    };

    const isSlotBlocked = (slotDate: Date, slotMinutes: number) => {
      for (const block of timeBlockList) {
        if (block.recurring) {
          const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
          const currentDayName = dayNames[dayOfWeekInTZ(slotDate)];
          let list: any = block.recurringDays;
          if (typeof list === 'string') list = list.split(',').map((d: string) => d.trim());
          if (list && list.includes(currentDayName)) if (isWithinRangeExclusiveEnd(slotMinutes, block.start, block.end)) return true;
        } else if (block.date) {
          let key: string | null = null; try { key = ymdInTZ(new Date(block.date)); } catch {}
          if (key && key === ymdInTZ(slotDate) && isWithinRangeExclusiveEnd(slotMinutes, block.start, block.end)) return true;
        }
      }
      return false;
    };

    // Build results
    const filteredSlots: Record<string, string[]> = {};
    for (const day of daysToCheck) {
      const dateKey = ymdInTZ(day);
      const dowNum: number = Number(dayOfWeekInTZ(day));
      const bh = businessHoursMap[dowNum];
      if (!bh) continue;
      const openTime = bh.open_time;
      const closeTime = bh.close_time;

      let validMins = (slotsData[dateKey]?.minutes || []).slice();
      validMins = validMins.filter((mins) => {
        const end = mins + serviceDurationMinutes;
        if (!hasBarber) return mins >= openTime && end <= closeTime;
        return mins >= openTime && mins <= closeTime;
      });

      if (hasBarber) {
        if ((barberWeekendIndexes || []).includes(dowNum)) continue;
        const bhours = barberHoursMap[dowNum];
        if (!bhours || (bhours.start === 0 && bhours.end === 0)) continue;
        if (isDateInTimeOff(day)) continue;
        validMins = validMins.filter((mins) => {
          const blocked = isSlotBlocked(day, mins);
          const booked = isSlotBooked(day, mins, serviceDurationMinutes);
          const end = mins + serviceDurationMinutes;
          return mins >= bhours.start && end <= bhours.end && !blocked && !booked;
        });
      }

      validMins.sort((a, b) => a - b);
      if (validMins.length > 0) filteredSlots[dateKey] = validMins.map(displayFromMinutes);
    }

    return NextResponse.json({
      calendarId,
      startDate: daysToCheck[0].toISOString().split('T')[0],
      slots: filteredSlots,
      targetTimeZone: TARGET_TZ,
    }, { headers: cors() });
  } catch (err: any) {
    console.error('free-slots error:', err?.message || err);
    return NextResponse.json({ error: 'Failed to fetch free slots', details: err?.message || 'Unknown' }, { status: 500, headers: cors() });
  }
}


