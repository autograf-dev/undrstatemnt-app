/**
 * Shared slot validation logic used by both free-slots and appointment endpoints
 * to ensure consistent availability checks across the booking system.
 */

import { getSupabaseServiceClient } from './supabase';

const TARGET_TZ = 'America/Edmonton';

// ============== Date/Time Helpers ==============

export function ymdInTZ(date: Date): string {
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

export function minutesInTZ(date: Date): number {
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

export function dayOfWeekInTZ(date: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: TARGET_TZ,
    weekday: 'long',
  });
  const name = dtf.format(date);
  const map: Record<string, number> = { 
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 
  };
  return map[name];
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

function isWithinRangeExclusiveEnd(minutes: number, start: number, end: number): boolean {
  return minutes >= start && minutes < end;
}

// ============== Business Hours Validation ==============

export interface BusinessHours {
  open_time: number;
  close_time: number;
}

export async function getBusinessHours(): Promise<Record<number, BusinessHours>> {
  const supabase = getSupabaseServiceClient();
  const businessHoursMap: Record<number, BusinessHours> = {};
  
  const nameToIndex: Record<string, number> = { 
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 
  };
  
  const { data: tradingHoursData, error: thError } = await supabase.from('Trading_hours').select('*');
  if (thError) throw new Error('Failed to fetch Trading_hours');
  
  (tradingHoursData || []).forEach((item: any) => {
    const idx = nameToIndex[item['Day/Name']] ?? undefined;
    if (idx === undefined) return;
    const openRaw = item['Day/Start'];
    const closeRaw = item['Day/End'];
    if (openRaw == null || closeRaw == null) return;
    const open_time = Number(openRaw);
    const close_time = Number(closeRaw);
    if (!Number.isFinite(open_time) || !Number.isFinite(close_time)) return;
    businessHoursMap[idx] = { open_time, close_time };
  });
  
  return businessHoursMap;
}

export function isWithinBusinessHours(
  slotDate: Date,
  slotMinutes: number,
  durationMinutes: number,
  businessHoursMap: Record<number, BusinessHours>
): boolean {
  const dowNum = dayOfWeekInTZ(slotDate);
  const bh = businessHoursMap[dowNum];
  if (!bh) return false;
  
  const slotEnd = slotMinutes + durationMinutes;
  return slotMinutes >= bh.open_time && slotEnd <= bh.close_time;
}

// ============== Barber Hours & Data ==============

export interface BarberHours {
  start: number;
  end: number;
}

export interface BarberData {
  barberHoursMap: Record<number, BarberHours>;
  barberWeekendIndexes: number[];
  barberRowId?: string;
  barberGhlId?: string;
  rawData?: any;
}

export async function getBarberData(userId: string): Promise<BarberData | null> {
  const supabase = getSupabaseServiceClient();
  
  // Try by GHL_id, glide_user_id, then User/ID
  let barberData: any = null;
  try {
    let res = await supabase.from('Data_barbers').select('*').eq('GHL_id', userId).maybeSingle();
    if (res.data) barberData = res.data;
    
    if (!barberData) {
      res = await supabase.from('Data_barbers').select('*').eq('glide_user_id', userId).maybeSingle();
      if (res.data) barberData = res.data;
    }
    
    if (!barberData) {
      res = await supabase.from('Data_barbers').select('*').eq('User/ID', userId).maybeSingle();
      if (res.data) barberData = res.data;
    }
  } catch (_) {
    return null;
  }
  
  if (!barberData) return null;
  
  const barberHoursMap: Record<number, BarberHours> = {
    0: { start: parseInt(barberData?.['Sunday/Start Value']) || 0, end: parseInt(barberData?.['Sunday/End Value']) || 0 },
    1: { start: parseInt(barberData?.['Monday/Start Value']) || 0, end: parseInt(barberData?.['Monday/End Value']) || 0 },
    2: { start: parseInt(barberData?.['Tuesday/Start Value']) || 0, end: parseInt(barberData?.['Tuesday/End Value']) || 0 },
    3: { start: parseInt(barberData?.['Wednesday/Start Value']) || 0, end: parseInt(barberData?.['Wednesday/End Value']) || 0 },
    4: { start: parseInt(barberData?.['Thursday/Start Value']) || 0, end: parseInt(barberData?.['Thursday/End Value']) || 0 },
    5: { start: parseInt(barberData?.['Friday/Start Value']) || 0, end: parseInt(barberData?.['Friday/End Value']) || 0 },
    6: { start: parseInt(barberData?.['Saturday/Start Value']) || 0, end: parseInt(barberData?.['Saturday/End Value']) || 0 },
  };
  
  const barberWeekendIndexes: number[] = [];
  if (barberData && String(barberData?.['Sunday/Day Off']).toLowerCase().includes('day off')) {
    barberWeekendIndexes.push(0);
  }
  
  const barberRowId = barberData?.['\uD83D\uDD12 Row ID'] || barberData?.['🔒 Row ID'];
  const barberGhlId = barberData?.['GHL_id'];
  
  return {
    barberHoursMap,
    barberWeekendIndexes,
    barberRowId,
    barberGhlId,
    rawData: barberData,
  };
}

export function isWithinBarberHours(
  slotDate: Date,
  slotMinutes: number,
  durationMinutes: number,
  barberData: BarberData
): boolean {
  const dowNum = dayOfWeekInTZ(slotDate);
  
  // Check if barber is off on this day
  if (barberData.barberWeekendIndexes.includes(dowNum)) return false;
  
  const bhours = barberData.barberHoursMap[dowNum];
  if (!bhours || (bhours.start === 0 && bhours.end === 0)) return false;
  
  const slotEnd = slotMinutes + durationMinutes;
  return slotMinutes >= bhours.start && slotEnd <= bhours.end;
}

// ============== Time Off Validation ==============

export interface TimeOffPeriod {
  start: Date;
  end: Date;
}

export async function getTimeOff(userId: string, barberData?: BarberData | null): Promise<TimeOffPeriod[]> {
  const supabase = getSupabaseServiceClient();
  const timeOffList: TimeOffPeriod[] = [];
  
  // 1) From Data_barbers field (YYYYMMDD comma list)
  if (barberData?.rawData) {
    const raw = barberData.rawData?.['Time Off/Unavailable Dates'] as string | undefined;
    if (raw) {
      const items = String(raw).split(',').map((s) => normalizeYmdToken(s.trim())).filter(Boolean) as string[];
      for (const v of items) {
        const y = v.slice(0, 4), m = v.slice(4, 6), d = v.slice(6, 8);
        timeOffList.push({ 
          start: new Date(`${y}-${m}-${d}T00:00:00`), 
          end: new Date(`${y}-${m}-${d}T23:59:59`) 
        });
      }
    }
  }
  
  // 2) From time_off table
  try {
    const barberRowId = barberData?.barberRowId;
    const barberGhlId = barberData?.barberGhlId;
    let offRows: any[] = [];
    
    // Fetch by provided userId (ghl_id)
    if (userId) {
      const { data } = await supabase.from('time_off').select('*').eq('ghl_id', userId);
      if (Array.isArray(data)) offRows = offRows.concat(data as any[]);
    }
    
    // If barber has a different ghl_id, include those
    if (barberGhlId && barberGhlId !== userId) {
      const { data } = await supabase.from('time_off').select('*').eq('ghl_id', barberGhlId);
      if (Array.isArray(data)) offRows = offRows.concat(data as any[]);
    }
    
    // Include by Barber/ID if available
    if (barberRowId) {
      const { data } = await supabase.from('time_off').select('*').eq('Barber/ID', barberRowId);
      if (Array.isArray(data)) offRows = offRows.concat(data as any[]);
    }
    
    for (const row of offRows) {
      // Prefer Dates/Unavailable (comma list of YYYYMMDD)
      const datesList: string | undefined = (row as any)['Dates/Unavailable'];
      if (datesList) {
        const ids = String(datesList).split(',').map(s => normalizeYmdToken(s.trim())).filter(Boolean) as string[];
        for (const v of ids) {
          const y = v.slice(0, 4), m = v.slice(4, 6), d = v.slice(6, 8);
          timeOffList.push({ 
            start: new Date(`${y}-${m}-${d}T00:00:00`), 
            end: new Date(`${y}-${m}-${d}T23:59:59`) 
          });
        }
        continue;
      }
      
      // Fallback: Event/Start, Event/End as locale strings
      const startRaw = (row as any)['Event/Start'];
      const endRaw = (row as any)['Event/End'];
      if (startRaw && endRaw) {
        const s = new Date(startRaw);
        const e = new Date(endRaw);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
          const cur = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
          const last = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate()));
          while (cur <= last) {
            const y = cur.getUTCFullYear();
            const m = String(cur.getUTCMonth() + 1).padStart(2, '0');
            const d = String(cur.getUTCDate()).padStart(2, '0');
            timeOffList.push({ 
              start: new Date(`${y}-${m}-${d}T00:00:00`), 
              end: new Date(`${y}-${m}-${d}T23:59:59`) 
            });
            cur.setUTCDate(cur.getUTCDate() + 1);
          }
        }
      }
    }
  } catch {
    // ignore time_off failures
  }
  
  return timeOffList;
}

export function isDateInTimeOff(slotDate: Date, timeOffList: TimeOffPeriod[]): boolean {
  const dayKey = ymdInTZ(slotDate);
  for (const p of timeOffList) {
    const s = ymdInTZ(p.start);
    const e = ymdInTZ(p.end);
    if (dayKey >= s && dayKey <= e) return true;
  }
  return false;
}

// ============== Time Blocks Validation ==============

export interface TimeBlock {
  start: number;
  end: number;
  date: string | null;
  recurring: boolean;
  recurringDays: string[];
  name: string;
}

export async function getTimeBlocks(userId: string, barberData?: BarberData | null): Promise<TimeBlock[]> {
  const supabase = getSupabaseServiceClient();
  const barberRowId = barberData?.barberRowId;
  const barberGhlId = barberData?.barberGhlId;
  let blockData: any[] = [];
  
  // Fetch from both time_block (singular) and time_blocks (plural) tables
  try {
    if (userId) {
      const { data } = await supabase.from('time_block').select('*').eq('ghl_id', userId);
      if (Array.isArray(data)) blockData = blockData.concat(data as any[]);
    }
    if (barberGhlId && barberGhlId !== userId) {
      const { data } = await supabase.from('time_block').select('*').eq('ghl_id', barberGhlId);
      if (Array.isArray(data)) blockData = blockData.concat(data as any[]);
    }
    if (barberRowId) {
      const { data } = await supabase.from('time_block').select('*').eq('Barber/ID', barberRowId);
      if (Array.isArray(data)) blockData = blockData.concat(data as any[]);
    }
  } catch (_) {}
  
  try {
    if (userId) {
      const { data } = await supabase.from('time_blocks').select('*').eq('ghl_id', userId);
      if (Array.isArray(data)) blockData = blockData.concat(data as any[]);
    }
    if (barberGhlId && barberGhlId !== userId) {
      const { data } = await supabase.from('time_blocks').select('*').eq('ghl_id', barberGhlId);
      if (Array.isArray(data)) blockData = blockData.concat(data as any[]);
    }
    if (barberRowId) {
      const { data } = await supabase.from('time_blocks').select('*').eq('Barber/ID', barberRowId);
      if (Array.isArray(data)) blockData = blockData.concat(data as any[]);
    }
  } catch {}
  
  return (blockData || []).map((item: any) => {
    const raw = item['Block/Recurring'];
    const recurring = raw === true || String(raw).toLowerCase().replace(/["']/g, '') === 'true';
    let recurringDays: string[] = [];
    if (recurring && item['Block/Recurring Day']) {
      recurringDays = String(item['Block/Recurring Day']).split(',').map((d) => d.trim());
    }
    
    let dateKey: string | null = null;
    const rawIdDate = item['Block/Date -> ID Check'];
    if (rawIdDate && /^\d{8}$/.test(String(rawIdDate))) {
      const v = String(rawIdDate);
      dateKey = `${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}`;
    } else if (item['Block/Date']) {
      try { dateKey = ymdInTZ(new Date(item['Block/Date'])); } catch {}
    }
    
    return {
      start: parseInt(item['Block/Start']) || 0,
      end: parseInt(item['Block/End']) || 0,
      date: dateKey,
      recurring,
      recurringDays,
      name: item['Block/Name'] || 'Time Block',
    };
  });
}

export function isSlotBlocked(slotDate: Date, slotMinutes: number, timeBlockList: TimeBlock[]): boolean {
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const currentDayName = dayNames[dayOfWeekInTZ(slotDate)];
  
  for (const block of timeBlockList) {
    if (block.recurring) {
      let list: any = block.recurringDays;
      if (typeof list === 'string') list = list.split(',').map((d: string) => d.trim());
      if (list && list.includes(currentDayName)) {
        if (isWithinRangeExclusiveEnd(slotMinutes, block.start, block.end)) return true;
      }
    } else if (block.date) {
      if (block.date === ymdInTZ(slotDate)) {
        if (isWithinRangeExclusiveEnd(slotMinutes, block.start, block.end)) return true;
      }
    }
  }
  return false;
}

// ============== Existing Bookings Validation ==============

export interface ExistingBooking {
  startDayKey: string;
  startMinutes: number;
  endMinutes: number;
}

export async function getExistingBookings(
  startDate: Date,
  endDate: Date,
  userId?: string
): Promise<ExistingBooking[]> {
  const supabase = getSupabaseServiceClient();
  const existingBookings: ExistingBooking[] = [];
  
  try {
    // Build date range for query
    const dateIds: string[] = [];
    const cur = new Date(startDate);
    while (cur <= endDate) {
      dateIds.push(ymdInTZ(cur).replace(/-/g, ''));
      cur.setDate(cur.getDate() + 1);
    }
    
    let q = supabase.from('ghl_events').select('*').in('date_id', dateIds);
    if (userId) q = q.eq('assigned_user_id', userId);
    
    // Include NULL status (active bookings) and explicitly exclude only 'canceled'
    q = q.or('appointment_status.is.null,appointment_status.neq.canceled');
    
    const { data } = await q;
    const rows: any[] = Array.isArray(data) ? (data as any[]) : [];
    
    for (const row of rows) {
      const status = row?.['appointment_status'] || '';
      const statusLower = String(status).toLowerCase();
      if (statusLower === 'canceled') continue;
      
      const st = row?.['start_time'] ? new Date(row['start_time']) : null;
      const et = row?.['end_time'] ? new Date(row['end_time']) : null;
      let startDayKey = '';
      let startMinutes = 0;
      let endMinutes = 0;
      
      if (st && et && !isNaN(st.getTime()) && !isNaN(et.getTime())) {
        startDayKey = ymdInTZ(st);
        startMinutes = minutesInTZ(st);
        endMinutes = minutesInTZ(et);
      } else {
        const summaryRaw = row?.['summary'];
        if (summaryRaw) {
          try {
            const s = JSON.parse(summaryRaw);
            if (s?.Date && /^\d{8}$/.test(String(s.Date))) {
              const v = String(s.Date);
              startDayKey = `${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}`;
            }
            if (Number.isFinite(Number(s?.Start))) startMinutes = Number(s.Start);
            const endBuf = s?.['End (Buffer)'];
            if (Number.isFinite(Number(endBuf))) endMinutes = Number(endBuf);
          } catch {}
        }
      }
      
      if (startDayKey && Number.isFinite(startMinutes) && Number.isFinite(endMinutes)) {
        existingBookings.push({ startDayKey, startMinutes, endMinutes });
      }
    }
  } catch (err) {
    console.error('Error fetching existing bookings:', err);
  }
  
  return existingBookings;
}

export function isSlotBooked(
  slotDate: Date,
  slotMinutes: number,
  durationMinutes: number,
  existingBookings: ExistingBooking[]
): boolean {
  const slotDayKey = ymdInTZ(slotDate);
  const slotEnd = slotMinutes + durationMinutes;
  
  for (const b of existingBookings) {
    if (b.startDayKey === slotDayKey) {
      if (slotMinutes < b.endMinutes && slotEnd > b.startMinutes) return true;
    }
  }
  return false;
}

// ============== Complete Validation ==============

export interface ValidationContext {
  businessHours: Record<number, BusinessHours>;
  barberData: BarberData | null;
  timeOff: TimeOffPeriod[];
  timeBlocks: TimeBlock[];
  existingBookings: ExistingBooking[];
}

export async function buildValidationContext(
  userId: string | undefined,
  startDate: Date,
  endDate: Date
): Promise<ValidationContext> {
  const businessHours = await getBusinessHours();
  const barberData = userId ? await getBarberData(userId) : null;
  const timeOff = userId ? await getTimeOff(userId, barberData) : [];
  const timeBlocks = userId ? await getTimeBlocks(userId, barberData) : [];
  const existingBookings = await getExistingBookings(startDate, endDate, userId);
  
  return {
    businessHours,
    barberData,
    timeOff,
    timeBlocks,
    existingBookings,
  };
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateSlot(
  slotStartTime: Date,
  durationMinutes: number,
  context: ValidationContext
): ValidationResult {
  const slotMinutes = minutesInTZ(slotStartTime);
  
  // 1. Check business hours
  if (!isWithinBusinessHours(slotStartTime, slotMinutes, durationMinutes, context.businessHours)) {
    return { valid: false, reason: 'This time slot is no longer available, please try another time slot' };
  }
  
  // 2. Check barber hours (if barber selected)
  if (context.barberData) {
    if (!isWithinBarberHours(slotStartTime, slotMinutes, durationMinutes, context.barberData)) {
      return { valid: false, reason: 'This time slot is no longer available, please try another time slot' };
    }
  }
  
  // 3. Check time off
  if (isDateInTimeOff(slotStartTime, context.timeOff)) {
    return { valid: false, reason: 'This time slot is no longer available, please try another time slot' };
  }
  
  // 4. Check time blocks
  if (isSlotBlocked(slotStartTime, slotMinutes, context.timeBlocks)) {
    return { valid: false, reason: 'This time slot is no longer available, please try another time slot' };
  }
  
  // 5. Check existing bookings (double-booking prevention)
  if (isSlotBooked(slotStartTime, slotMinutes, durationMinutes, context.existingBookings)) {
    return { valid: false, reason: 'This time slot is no longer available, please try another time slot' };
  }
  
  return { valid: true };
}
