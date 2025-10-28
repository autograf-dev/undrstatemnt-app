import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceClient } from '@/lib/server/supabase';

const TARGET_TZ = 'America/Edmonton';

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function ymdInTZ(date: Date) {
  const dtf = new Intl.DateTimeFormat('en-CA', { timeZone: TARGET_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = dtf.formatToParts(date);
  const y = parts.find((p) => p.type === 'year')!.value;
  const m = parts.find((p) => p.type === 'month')!.value;
  const d = parts.find((p) => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
}

function minutesInTZ(date: Date) {
  const dtf = new Intl.DateTimeFormat('en-CA', { timeZone: TARGET_TZ, hour12: false, hour: '2-digit', minute: '2-digit' });
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
  const dtf = new Intl.DateTimeFormat('en-US', { timeZone: TARGET_TZ, weekday: 'long' });
  const name = dtf.format(date);
  const map: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  return map[name];
}

function tzTodayDate() {
  const dtf = new Intl.DateTimeFormat('en-CA', { timeZone: TARGET_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
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
    for (let t = 0; t <= 23 * 60 + 59; t += intervalMinutes) {
      minutes.push(t);
    }
    out[dateKey] = { minutes };
  }
  return out;
}

export async function OPTIONS() { return new NextResponse('', { headers: cors() }); }

export async function GET(req: Request) {
  const supabase = getSupabaseServiceClient();
  try {
    const url = new URL(req.url);
    const calendarId = url.searchParams.get('calendarId');
    const userId = url.searchParams.get('userId');
    const date = url.searchParams.get('date');
    const serviceDurationStr = url.searchParams.get('serviceDuration');

    if (!calendarId) {
      return NextResponse.json({ error: 'calendarId is required' }, { status: 400, headers: cors() });
    }

    const serviceDurationMinutes = serviceDurationStr ? parseInt(serviceDurationStr) : 30;

    let startDate = tzTodayDate();
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3) {
        startDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      }
    }

    const totalDays = 30;
    const daysToCheck: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      daysToCheck.push(d);
    }

    const startOfRange = new Date(daysToCheck[0].getFullYear(), daysToCheck[0].getMonth(), daysToCheck[0].getDate(), 0, 0, 0);
    const endOfRange = new Date(daysToCheck[daysToCheck.length - 1].getFullYear(), daysToCheck[daysToCheck.length - 1].getMonth(), daysToCheck[daysToCheck.length - 1].getDate(), 23, 59, 59);

    const slotsData = buildStaticSlotsMinutes(daysToCheck, 30);

    const { data: businessHoursData, error: bhError } = await supabase.from('business_hours').select('*').eq('is_open', true);
    if (bhError) throw new Error('Failed to fetch business hours');

    const businessHoursMap: Record<number, { open_time: number; close_time: number }> = {} as any;
    (businessHoursData || []).forEach((item: any) => {
      item.open_time = Number(item.open_time);
      item.close_time = Number(item.close_time);
      businessHoursMap[item.day_of_week] = item;
    });

    let barberHoursMap: Record<number, { start: number; end: number }> = {};
    let barberWeekendIndexes: number[] = [];
    let timeOffList: { start: Date; end: Date }[] = [];
    let timeBlockList: any[] = [];
    let existingBookings: any[] = [];

    if (userId) {
      const { data: barberData, error: barberError } = await supabase.from('barber_hours').select('*').eq('ghl_id', userId).single();
      if (barberError) throw new Error('Failed to fetch barber hours');

      let barberWeekends: string[] = [];
      if (barberData?.weekend_days) {
        try {
          let weekendString = barberData.weekend_days.replace(/^['"]|['"]$/g, '');
          if (weekendString.includes('{') && weekendString.includes('}')) {
            weekendString = weekendString.replace(/^['"]*\{/, '[').replace(/\}['"]*.*$/, ']').replace(/\\"/g, '"');
          }
          barberWeekends = JSON.parse(weekendString);
        } catch {
          barberWeekends = [];
        }
      }
      const dayNameToIndex: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
      barberWeekendIndexes = barberWeekends.map((d) => dayNameToIndex[d]).filter((v) => v !== undefined);

      barberHoursMap = {
        0: { start: parseInt(barberData["Sunday/Start Value"]) || 0, end: parseInt(barberData["Sunday/End Value"]) || 0 },
        1: { start: parseInt(barberData["Monday/Start Value"]) || 0, end: parseInt(barberData["Monday/End Value"]) || 0 },
        2: { start: parseInt(barberData["Tuesday/Start Value"]) || 0, end: parseInt(barberData["Tuesday/End Value"]) || 0 },
        3: { start: parseInt(barberData["Wednesday/Start Value"]) || 0, end: parseInt(barberData["Wednesday/End Value"]) || 0 },
        4: { start: parseInt(barberData["Thursday/Start Value"]) || 0, end: parseInt(barberData["Thursday/End Value"]) || 0 },
        5: { start: parseInt(barberData["Friday/Start Value"]) || 0, end: parseInt(barberData["Friday/End Value"]) || 0 },
        6: { start: parseInt(barberData["Saturday/Start Value"]) || 0, end: parseInt(barberData["Saturday/End Value"]) || 0 },
      };

      const { data: timeOffData } = await supabase.from('time_off').select('*').eq('ghl_id', userId);
      timeOffList = (timeOffData || []).map((item: any) => ({ start: new Date(item['Event/Start']), end: new Date(item['Event/End']) }));

      const { data: blockData } = await supabase.from('time_block').select('*').eq('ghl_id', userId);
      timeBlockList = (blockData || []).map((item: any) => {
        const recurringRaw = item['Block/Recurring'];
        const recurring = recurringRaw === true || recurringRaw === 'true' || recurringRaw === '"true"' || String(recurringRaw).toLowerCase().replace(/["']/g, '') === 'true';
        let recurringDays: string[] = [];
        if (recurring && item['Block/Recurring Day']) recurringDays = item['Block/Recurring Day'].split(',').map((d: string) => d.trim());
        return {
          start: parseInt(item['Block/Start']),
          end: parseInt(item['Block/End']),
          date: item['Block/Date'] || null,
          recurring,
          recurringDays,
          name: item['Block/Name'] || 'Time Block',
          version: '3.1',
        };
      });

      const { data: bookingsData } = await supabase
        .from('restyle_bookings')
        .select('start_time, booking_duration, assigned_user_id, status, appointment_status')
        .eq('assigned_user_id', userId)
        .in('status', ['booked', 'confirmed'])
        .in('appointment_status', ['confirmed', 'pending'])
        .gte('start_time', startOfRange.toISOString())
        .lte('start_time', endOfRange.toISOString());

      existingBookings = (bookingsData || []).map((booking: any) => {
        const startTime = new Date(booking.start_time);
        const duration = parseInt(booking.booking_duration) || 30;
        const endTime = new Date(startTime.getTime() + duration * 60000);
        return {
          startTime,
          endTime,
          startDayKey: ymdInTZ(startTime),
          endDayKey: ymdInTZ(endTime),
          startMinutes: minutesInTZ(startTime),
          endMinutes: minutesInTZ(endTime),
        };
      });
    }

    const isSlotBooked = (slotDate: Date, slotMinutes: number, durMinutes: number) => {
      const slotDayKey = ymdInTZ(slotDate);
      const slotEnd = slotMinutes + durMinutes;
      for (const booking of existingBookings) {
        if (booking.startDayKey === slotDayKey) {
          if (slotMinutes < booking.endMinutes && slotEnd > booking.startMinutes) return true;
        }
      }
      return false;
    };

    const isSlotBlocked = (slotDate: Date, slotMinutes: number) => {
      for (const block of timeBlockList) {
        if (block.recurring) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const currentDayName = dayNames[dayOfWeekInTZ(slotDate)];
          let recurringDaysList: string[] | string = block.recurringDays || (block as any).recurringDay;
          if (typeof recurringDaysList === 'string') recurringDaysList = recurringDaysList.split(',').map((d) => d.trim());
          if (Array.isArray(recurringDaysList) && recurringDaysList.includes(currentDayName)) {
            if (isWithinRangeExclusiveEnd(slotMinutes, block.start, block.end)) return true;
          }
        } else if (block.date) {
          let blockDateOnlyKey: string | undefined;
          try { blockDateOnlyKey = ymdInTZ(new Date(block.date)); } catch {}
          const currDateOnlyKey = ymdInTZ(slotDate);
          if (blockDateOnlyKey && blockDateOnlyKey === currDateOnlyKey && isWithinRangeExclusiveEnd(slotMinutes, block.start, block.end)) return true;
        }
      }
      return false;
    };

    const filteredSlots: Record<string, string[]> = {};
    for (const day of daysToCheck) {
      const dateKey = ymdInTZ(day);
      const dow = dayOfWeekInTZ(day);

      const bh = (businessHoursMap as any)[dow];
      if (!bh) continue;
      const openTime = bh.open_time;
      const closeTime = bh.close_time;

      let validMins = (slotsData[dateKey]?.minutes || []).slice();

      validMins = validMins.filter((mins) => {
        const serviceEndTime = mins + serviceDurationMinutes;
        if (!userId) return mins >= openTime && serviceEndTime <= closeTime;
        return mins >= openTime && mins <= closeTime;
      });

      if (userId) {
        if (barberWeekendIndexes.includes(dow)) continue;
        const barberHours = (barberHoursMap as any)[dow];
        if (!barberHours || (barberHours.start === 0 && barberHours.end === 0)) continue;
        // time off
        const isDateInTimeOff = (dateObj: Date) => {
          const dayKey = ymdInTZ(dateObj);
          for (const period of timeOffList) {
            const startKey = ymdInTZ(period.start);
            const endKey = ymdInTZ(period.end);
            if (dayKey >= startKey && dayKey < endKey) return true;
          }
          return false;
        };
        if (isDateInTimeOff(day)) continue;

        validMins = validMins.filter((mins) => {
          const serviceEndTime = mins + serviceDurationMinutes;
          const withinRange = mins >= barberHours.start && serviceEndTime <= barberHours.end;
          return withinRange && !isSlotBlocked(day, mins) && !isSlotBooked(day, mins, serviceDurationMinutes);
        });
      }

      validMins.sort((a, b) => a - b);
      if (validMins.length > 0) {
        filteredSlots[dateKey] = validMins.map(displayFromMinutes);
      }
    }

    return NextResponse.json({
      calendarId,
      activeDay: 'allDays',
      startDate: startDate.toISOString().split('T')[0],
      slots: filteredSlots,
    }, { headers: cors() });
  } catch (err: any) {
    console.error('staff-slots error:', err?.message || err);
    return NextResponse.json({ error: 'Failed to fetch working slots', details: err?.message }, { status: 500, headers: cors() });
  }
}
