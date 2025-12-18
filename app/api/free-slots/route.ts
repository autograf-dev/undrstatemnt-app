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
  const parts = dtf.formatToParts(new Date());
  const y = parseInt(parts.find((p) => p.type === 'year')!.value, 10);
  const m = parseInt(parts.find((p) => p.type === 'month')!.value, 10);
  const d = parseInt(parts.find((p) => p.type === 'day')!.value, 10);
  // Create date at noon to avoid timezone boundary issues
  return new Date(y, m - 1, d, 12, 0, 0);
}

function isWithinRangeExclusiveEnd(minutes: number, start: number, end: number) {
  return minutes >= start && minutes < end;
}

function buildStaticSlotsMinutes(days: Date[], intervalMinutes = 15) {
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
  const daysParam = url.searchParams.get('days') || undefined;

  if (!calendarId) {
    return NextResponse.json({ error: 'calendarId is required' }, { status: 400, headers: cors() });
  }

  let serviceDurationMinutes = serviceDurationParam ? parseInt(serviceDurationParam) : 30;

  try {
    const supabase = getSupabaseServiceClient();

    let startDate = tzTodayDate();
    if (date) {
      const parts = date.split('-');
      // Create date at noon to avoid timezone boundary issues when comparing
      if (parts.length === 3) startDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
    }

    // Support days parameter (default 7, max 120 for performance)
    const totalDays = daysParam ? Math.min(Math.max(1, parseInt(daysParam)), 120) : 7;
    const daysToCheck: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate); d.setDate(startDate.getDate() + i); daysToCheck.push(d);
    }

    const startOfRange = new Date(daysToCheck[0].getFullYear(), daysToCheck[0].getMonth(), daysToCheck[0].getDate(), 0, 0, 0);
    const endOfRange = new Date(daysToCheck[daysToCheck.length - 1].getFullYear(), daysToCheck[daysToCheck.length - 1].getMonth(), daysToCheck[daysToCheck.length - 1].getDate(), 23, 59, 59);

    const slotsData = buildStaticSlotsMinutes(daysToCheck, 15);

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

      // Check for custom duration for this service+barber combination
      if (barberData && calendarId) {
        try {
          const barberRowId: string | undefined = barberData?.['\uD83D\uDD12 Row ID'] || barberData?.['🔒 Row ID'];
          const barberGhlId: string | undefined = barberData?.['GHL_id'];

          // Try to find custom duration from Data_Services_Custom
          let customDuration: number | null = null;

          // Query by Barber/ID if we have it
          if (barberRowId) {
            const { data: customRows } = await supabase
              .from('Data_Services_Custom')
              .select('Barber/Duration, Barber/ID, ghl_calendar_id, Service/Lookup')
              .eq('Barber/ID', barberRowId);

            if (Array.isArray(customRows) && customRows.length > 0) {
              // Find matching custom row by calendarId (ghl_calendar_id) or Service/Lookup
              const match = customRows.find((row: any) => {
                const calIdMatch = String((row as any)?.['ghl_calendar_id'] || '') === String(calendarId);
                const lookupMatch = String((row as any)?.['Service/Lookup'] || '') === String(calendarId);
                return calIdMatch || lookupMatch;
              });

              if (match && Number.isFinite(Number((match as any)['Barber/Duration']))) {
                customDuration = Number((match as any)['Barber/Duration']);
              }
            }
          }

          // Also try by GHL_id if no match found
          if (!customDuration && barberGhlId) {
            // Try querying by ghl_id field
            const { data: customRowsByGhl } = await supabase
              .from('Data_Services_Custom')
              .select('Barber/Duration, Barber/ID, ghl_calendar_id, Service/Lookup, ghl_id')
              .eq('ghl_id', barberGhlId);

            if (Array.isArray(customRowsByGhl) && customRowsByGhl.length > 0) {
              const match = customRowsByGhl.find((row: any) => {
                const calIdMatch = String((row as any)?.['ghl_calendar_id'] || '') === String(calendarId);
                const lookupMatch = String((row as any)?.['Service/Lookup'] || '') === String(calendarId);
                return calIdMatch || lookupMatch;
              });

              if (match && Number.isFinite(Number((match as any)['Barber/Duration']))) {
                customDuration = Number((match as any)['Barber/Duration']);
              }
            }
          }

          // Use custom duration if found
          if (customDuration !== null && customDuration > 0) {
            serviceDurationMinutes = customDuration;
            console.log(`[free-slots] Using custom duration: ${customDuration} minutes (barber: ${userId}, service: ${calendarId})`);
          }
        } catch (err) {
          // If custom duration lookup fails, continue with default
          console.error('Error fetching custom duration:', err);
        }
      }

      // Log the final duration being used for slot calculations
      console.log(`[free-slots] Final service duration for slot calculations: ${serviceDurationMinutes} minutes (userId: ${userId || 'none'}, calendarId: ${calendarId})`);

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

    // Time off: combine from Data_barbers and public.time_off (full-day leaves)
    // Also consider ghl_id from userId even if no Data_barbers row is found
    let timeOffList: { start: Date; end: Date }[] = [];
    if (hasBarber || userId) {
      // 1) From Data_barbers field (YYYYMMDD comma list)
      const raw = (resolvedBarberData as any)?.['Time Off/Unavailable Dates'] as string | undefined;
      if (raw) {
        const items = String(raw).split(',').map((s) => normalizeYmdToken(s.trim())).filter(Boolean) as string[];
        for (const v of items) {
          const y = v.slice(0, 4), m = v.slice(4, 6), d = v.slice(6, 8);
          timeOffList.push({ start: new Date(`${y}-${m}-${d}T00:00:00`), end: new Date(`${y}-${m}-${d}T23:59:59`) });
        }
      }
      // 2) From time_off table:
      try {
        const barberRowId: string | undefined = (resolvedBarberData as any)?.['\uD83D\uDD12 Row ID'] || (resolvedBarberData as any)?.['🔒 Row ID'];
        const barberGhlId: string | undefined = (resolvedBarberData as any)?.['GHL_id'];
        let offRows: any[] = [];
        // Always fetch by provided userId (ghl_id)
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
              timeOffList.push({ start: new Date(`${y}-${m}-${d}T00:00:00`), end: new Date(`${y}-${m}-${d}T23:59:59`) });
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
              // Convert range to per-day entries
              const cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
              const last = new Date(e.getFullYear(), e.getMonth(), e.getDate());
              while (cur <= last) {
                const y = cur.getFullYear();
                const m = String(cur.getMonth() + 1).padStart(2, '0');
                const d = String(cur.getDate()).padStart(2, '0');
                timeOffList.push({ start: new Date(`${y}-${m}-${d}T00:00:00`), end: new Date(`${y}-${m}-${d}T23:59:59`) });
                cur.setDate(cur.getDate() + 1);
              }
            }
          }
        }
      } catch {
        // ignore time_off failures
      }
    }
    const isDateInTimeOff = (date: Date) => {
      const dayKey = ymdInTZ(date);
      for (const p of timeOffList) {
        const s = ymdInTZ(p.start); const e = ymdInTZ(p.end);
        // Treat the end date as inclusive so single-day entries are respected
        if (dayKey >= s && dayKey <= e) return true;
      }
      return false;
    };

    // Time blocks: merge from time_block (singular) and time_blocks (plural)
    let timeBlockList: any[] = [];
    if (hasBarber || userId) {
      const barberRowId: string | undefined = (resolvedBarberData as any)?.['\uD83D\uDD12 Row ID'] || (resolvedBarberData as any)?.['🔒 Row ID'];
      const barberGhlId: string | undefined = (resolvedBarberData as any)?.['GHL_id'];
      console.log(`[free-slots] Querying time blocks - userId: ${userId}, barberGhlId: ${barberGhlId}, barberRowId: ${barberRowId}`);
      let blockData: any[] = [];
      try {
        if (userId) {
          const { data, error } = await supabase.from('time_block').select('*').eq('ghl_id', userId);
          if (error) console.log(`[free-slots] Error querying time_block by ghl_id (${userId}):`, error);
          if (Array.isArray(data)) {
            console.log(`[free-slots] Found ${data.length} blocks in time_block table by ghl_id (${userId})`);
            blockData = blockData.concat(data as any[]);
          }
        }
        if (barberGhlId && barberGhlId !== userId) {
          const { data, error } = await supabase.from('time_block').select('*').eq('ghl_id', barberGhlId);
          if (error) console.log(`[free-slots] Error querying time_block by barberGhlId (${barberGhlId}):`, error);
          if (Array.isArray(data)) {
            console.log(`[free-slots] Found ${data.length} blocks in time_block table by barberGhlId (${barberGhlId})`);
            blockData = blockData.concat(data as any[]);
          }
        }
        if (barberRowId) {
          // Note: Supabase should handle column names with slashes, but if it fails, we'll catch it
          const { data, error } = await supabase.from('time_block').select('*').eq('Barber/ID', barberRowId);
          if (error) {
            console.log(`[free-slots] Error querying time_block by Barber/ID (${barberRowId}):`, error);
            // Try alternative: query all and filter client-side
            const { data: allData } = await supabase.from('time_block').select('*');
            if (Array.isArray(allData)) {
              const filtered = allData.filter((item: any) => item['Barber/ID'] === barberRowId);
              if (filtered.length > 0) {
                console.log(`[free-slots] Found ${filtered.length} blocks in time_block table by Barber/ID (client-side filter)`);
                blockData = blockData.concat(filtered);
              }
            }
          } else if (Array.isArray(data)) {
            console.log(`[free-slots] Found ${data.length} blocks in time_block table by Barber/ID (${barberRowId})`);
            blockData = blockData.concat(data as any[]);
          }
        }
      } catch (err) {
        console.log(`[free-slots] Exception querying time_block:`, err);
      }
      // Also attempt plural table time_blocks
      try {
        if (userId) {
          const { data, error } = await supabase.from('time_blocks').select('*').like('ghl_id', `${userId}%`);
          if (error) console.log(`[free-slots] Error querying time_blocks by ghl_id (${userId}):`, error);
          if (Array.isArray(data)) {
            console.log(`[free-slots] Found ${data.length} blocks in time_blocks table by ghl_id (${userId})`);
            blockData = blockData.concat(data as any[]);
          }
        }
        if (barberGhlId && barberGhlId !== userId) {
          const { data, error } = await supabase.from('time_blocks').select('*').like('ghl_id', `${barberGhlId}%`);
          if (error) console.log(`[free-slots] Error querying time_blocks by barberGhlId (${barberGhlId}):`, error);
          if (Array.isArray(data)) {
            console.log(`[free-slots] Found ${data.length} blocks in time_blocks table by barberGhlId (${barberGhlId})`);
            blockData = blockData.concat(data as any[]);
          }
        }
        if (barberRowId) {
          const { data, error } = await supabase.from('time_blocks').select('*').eq('"Barber/ID"', barberRowId);
          if (error) {
            console.log(`[free-slots] Error querying time_blocks by Barber/ID (${barberRowId}):`, error);
            // Try alternative: query all and filter client-side
            const { data: allData } = await supabase.from('time_blocks').select('*');
            if (Array.isArray(allData)) {
              const filtered = allData.filter((item: any) => item['Barber/ID'] === barberRowId);
              if (filtered.length > 0) {
                console.log(`[free-slots] Found ${filtered.length} blocks in time_blocks table by Barber/ID (client-side filter)`);
                blockData = blockData.concat(filtered);
              }
            }
          } else if (Array.isArray(data)) {
            console.log(`[free-slots] Found ${data.length} blocks in time_blocks table by Barber/ID (${barberRowId})`);
            blockData = blockData.concat(data as any[]);
          }
        }
      } catch (err) {
        console.log(`[free-slots] Exception querying time_blocks:`, err);
      }

      // Debug: Check if recurring lunch block exists in database (for Martin)
      if (userId === 'VQYDmgfngKScT0Ropy0A') {
        try {
          // Query by ghl_id
          const { data: blocksByGhl, error: err1 } = await supabase
            .from('time_blocks')
            .select('*')
            .eq('ghl_id', userId);

          // Query by Barber/ID
          const { data: blocksByBarber, error: err2 } = await supabase
            .from('time_blocks')
            .select('*')
            .eq('Barber/ID', '76dMfR2pTKmfVM48SFgokQ');

          // If that fails, try client-side filtering
          let blocksByBarberFiltered: any[] = [];
          if (err2) {
            console.log(`[free-slots] Direct query failed, trying client-side filter:`, err2);
            const { data: allBlocksData } = await supabase.from('time_blocks').select('*');
            if (Array.isArray(allBlocksData)) {
              blocksByBarberFiltered = allBlocksData.filter((b: any) =>
                b['Barber/ID'] === '76dMfR2pTKmfVM48SFgokQ' || b['ghl_id'] === userId
              );
            }
          }

          const allBlocks = [...(blocksByGhl || []), ...(blocksByBarber || []), ...blocksByBarberFiltered];

          if (err1 || err2) {
            console.log(`[free-slots] Errors checking all blocks for Martin:`, err1 || err2);
          }

          console.log(`[free-slots] All blocks for Martin (VQYDmgfngKScT0Ropy0A):`, allBlocks.map((b: any) => ({
            name: b['Block/Name'],
            recurring: b['Block/Recurring'],
            recurringDay: b['Block/Recurring Day'],
            start: b['Block/Start'],
            end: b['Block/End'],
            ghl_id: b['ghl_id'],
            barberId: b['Barber/ID']
          })));

          // Specifically check for the lunch block
          const lunchBlock = allBlocks.find((b: any) =>
            b['Block/Name'] === 'Lunch' &&
            (b['ghl_id'] === userId || b['Barber/ID'] === '76dMfR2pTKmfVM48SFgokQ')
          );
          if (lunchBlock) {
            console.log(`[free-slots] ✓ Found Lunch block:`, {
              name: lunchBlock['Block/Name'],
              recurring: lunchBlock['Block/Recurring'],
              recurringDay: lunchBlock['Block/Recurring Day'],
              start: lunchBlock['Block/Start'],
              end: lunchBlock['Block/End']
            });
          } else {
            console.log(`[free-slots] ✗ Lunch block NOT FOUND in database for Martin`);
          }
        } catch (err) {
          console.log(`[free-slots] Exception checking all blocks:`, err);
        }
      }

      // Debug: log how many blocks were fetched and their raw data
      if (blockData && blockData.length > 0) {
        console.log(`[free-slots] Fetched ${blockData.length} time blocks for userId: ${userId}`);
        console.log(`[free-slots] Raw block data:`, JSON.stringify(blockData.map((item: any) => ({
          name: item['Block/Name'],
          recurring: item['Block/Recurring'],
          recurringDay: item['Block/Recurring Day'],
          date: item['Block/Date -> ID Check'],
          start: item['Block/Start'],
          end: item['Block/End'],
          barberId: item['Barber/ID'],
          ghlId: item['ghl_id']
        })), null, 2));
      }

      timeBlockList = (blockData || []).map((item: any) => {
        const raw = item['Block/Recurring'];
        // Handle various formats: true, "true", 'true', false, "false", etc.
        const rawStr = String(raw || '').toLowerCase().replace(/["']/g, '').trim();
        const recurring = raw === true || rawStr === 'true';
        let recurringDays: string[] = [];
        if (recurring && item['Block/Recurring Day']) {
          // Strip PostgreSQL array curly braces before splitting
          const dayStr = String(item['Block/Recurring Day']).replace(/[{}]/g, '').trim();
          // Normalize day names: capitalize first letter, lowercase rest
          const dayNameMap: Record<string, string> = {
            'sunday': 'Sunday',
            'monday': 'Monday',
            'tuesday': 'Tuesday',
            'wednesday': 'Wednesday',
            'thursday': 'Thursday',
            'friday': 'Friday',
            'saturday': 'Saturday'
          };
          recurringDays = dayStr.split(',').map((d: string) => {
            const trimmed = d.trim();
            const normalized = dayNameMap[trimmed.toLowerCase()];
            return normalized || trimmed;
          }).filter(Boolean);
        }
        // Build a stable dateKey (YYYY-MM-DD) without timezone shifts
        let dateKey: string | null = null;
        const rawIdDate = item['Block/Date -> ID Check'];
        if (rawIdDate && /^\d{8}$/.test(String(rawIdDate))) {
          const v = String(rawIdDate);
          dateKey = `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
        } else if (item['Block/Date']) {
          try { dateKey = ymdInTZ(new Date(item['Block/Date'])); } catch { }
        }
        const block = {
          start: parseInt(item['Block/Start']) || 0,
          end: parseInt(item['Block/End']) || 0,
          date: dateKey,
          recurring,
          recurringDays,
          name: item['Block/Name'] || 'Time Block',
        };
        // Debug log for all blocks
        if (recurring && recurringDays.length > 0) {
          console.log(`[free-slots] Processed RECURRING block: "${block.name}" | Days: [${recurringDays.join(', ')}] | Time: ${displayFromMinutes(block.start)} - ${displayFromMinutes(block.end)} (${block.start}-${block.end} min)`);
        } else if (block.date) {
          console.log(`[free-slots] Processed ONE-TIME block: "${block.name}" | Date: ${block.date} | Time: ${displayFromMinutes(block.start)} - ${displayFromMinutes(block.end)} (${block.start}-${block.end} min)`);
        } else {
          console.log(`[free-slots] Processed block (no date/recurring): "${block.name}" | Recurring: ${recurring} | Days: [${recurringDays.join(', ')}] | Time: ${displayFromMinutes(block.start)} - ${displayFromMinutes(block.end)} (${block.start}-${block.end} min)`);
        }
        return block;
      });

      // Log summary of processed blocks
      console.log(`[free-slots] Total processed blocks: ${timeBlockList.length} (${timeBlockList.filter(b => b.recurring).length} recurring, ${timeBlockList.filter(b => !b.recurring && b.date).length} one-time)`);
    }

    // Overtime periods from time_overtime table
    // These slots bypass ALL restrictions (work schedule, business hours, breaks, holidays)
    let overtimeList: { date: string; start: number; end: number }[] = []
    if (userId) {
      try {
        const barberRowId: string | undefined = (resolvedBarberData as any)?.['\uD83D\uDD12 Row ID'] || (resolvedBarberData as any)?.['🔒 Row ID']
        const barberGhlId: string | undefined = (resolvedBarberData as any)?.['GHL_id'] || (resolvedBarberData as any)?.['ghl_id'] || userId

        let overtimeData: any[] = []

        // Query by ghl_id
        if (barberGhlId) {
          const { data } = await supabase.from('time_overtime').select('*').eq('ghl_id', barberGhlId)
          if (Array.isArray(data)) overtimeData = overtimeData.concat(data as any[])
        }

        // Query by Barber/ID (row id)
        if (barberRowId) {
          const { data } = await supabase.from('time_overtime').select('*').eq('Barber/ID', barberRowId)
          if (Array.isArray(data)) {
            // Avoid duplicates
            const existingIds = new Set(overtimeData.map((o: any) => o['🔒 Row ID']))
            for (const row of data as any[]) {
              if (!existingIds.has(row['🔒 Row ID'])) {
                overtimeData.push(row)
              }
            }
          }
        }

        // Parse overtime entries
        for (const row of overtimeData) {
          const dateRaw = row['Overtime/Date']
          const startVal = parseInt(row['Overtime/Start Value'])
          const endVal = parseInt(row['Overtime/End Value'])
          if (!dateRaw || !Number.isFinite(startVal) || !Number.isFinite(endVal)) continue

          // Normalize date to YYYY-MM-DD format
          let dateKey: string | null = null
          if (typeof dateRaw === 'string') {
            if (/^\d{4}-\d{2}-\d{2}/.test(dateRaw)) {
              dateKey = dateRaw.split('T')[0]
            } else if (/^\d{8}$/.test(dateRaw)) {
              dateKey = `${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}`
            }
          }

          if (dateKey && startVal < endVal) {
            overtimeList.push({ date: dateKey, start: startVal, end: endVal })
          }
        }

        console.log(`[free-slots] Found ${overtimeList.length} overtime entries for barber ${barberGhlId || barberRowId}`)
      } catch (err) {
        console.error('[free-slots] Error fetching overtime:', err)
      }
    }

    // Existing bookings from ghl_events: block overlapping slots for assigned barber
    // Only confirmed bookings block slots; canceled appointments are excluded
    let existingBookings: { startDayKey: string; startMinutes: number; endMinutes: number }[] = [];
    try {
      // Include next day to catch UTC timezone boundary issues (bookings stored as Dec 19 UTC but are Dec 18 MST)
      const extendedDays = [...daysToCheck];
      const lastDay = daysToCheck[daysToCheck.length - 1];
      const nextDay = new Date(lastDay);
      nextDay.setDate(lastDay.getDate() + 1);
      extendedDays.push(nextDay);
      const dateIds = extendedDays.map((d) => ymdInTZ(d).replace(/-/g, ''));
      let q = supabase.from('ghl_events').select('*').in('date_id', dateIds);
      if (userId) q = q.eq('assigned_user_id', userId);
      // Include NULL status (active bookings) and explicitly exclude only 'canceled'
      q = q.or('appointment_status.is.null,appointment_status.neq.canceled');
      // Ensure we fetch ALL bookings without truncation (default limit is 1000)
      q = q.limit(10000);
      // Do not filter by calendar_id; external calendarId may not match GHL calendar ids
      const { data } = await q;
      const rows: any[] = Array.isArray(data) ? (data as any[]) : [];
      existingBookings = rows
        .filter((row: any) => {
          // Double-check: exclude canceled status even if query filter misses it
          const status = row?.['appointment_status'] || '';
          const statusLower = String(status).toLowerCase();
          return statusLower !== 'canceled';
        })
        .map((row: any) => {
          // Prefer canonical columns start_time/end_time; fall back to summary only if needed
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
            // Fallback: try summary JSON
            const summaryRaw = row?.['summary'];
            if (summaryRaw) {
              try {
                const s = JSON.parse(summaryRaw);
                if (s?.Date && /^\d{8}$/.test(String(s.Date))) {
                  const v = String(s.Date);
                  startDayKey = `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
                }
                if (Number.isFinite(Number(s?.Start))) startMinutes = Number(s.Start);
                const endBuf = s?.['End (Buffer)'];
                if (Number.isFinite(Number(endBuf))) endMinutes = Number(endBuf);
              } catch { }
            }
          }
          return { startDayKey, startMinutes, endMinutes };
        })
        .filter((b) => b.startDayKey && Number.isFinite(b.startMinutes) && Number.isFinite(b.endMinutes));
    } catch { }

    const isSlotBooked = (slotDate: Date, slotMinutes: number, durMinutes: number) => {
      const slotDayKey = ymdInTZ(slotDate);
      const slotEnd = slotMinutes + durMinutes;
      for (const b of existingBookings) {
        if (b.startDayKey === slotDayKey) {
          if (slotMinutes < b.endMinutes && slotEnd > b.startMinutes) return true;
        }
      }
      return false;
    };

    const isSlotBlocked = (slotDate: Date, slotMinutes: number, durMinutes: number) => {
      const slotEnd = slotMinutes + durMinutes;
      const slotDayKey = ymdInTZ(slotDate);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDayName = dayNames[dayOfWeekInTZ(slotDate)];

      // Debug: log when checking Tuesday at 10:00 AM (600 minutes)
      const isDebugTarget = currentDayName === 'Tuesday' && slotMinutes === 600;

      for (const block of timeBlockList) {
        if (block.recurring) {
          // Skip if no recurring days defined
          if (!block.recurringDays || block.recurringDays.length === 0) {
            if (isDebugTarget) {
              console.log(`[free-slots] Block "${block.name}" is recurring but has no recurring days`);
            }
            continue;
          }

          // Normalize recurring days list (should already be normalized, but ensure it)
          const dayNameMap: Record<string, string> = {
            'sunday': 'Sunday',
            'monday': 'Monday',
            'tuesday': 'Tuesday',
            'wednesday': 'Wednesday',
            'thursday': 'Thursday',
            'friday': 'Friday',
            'saturday': 'Saturday'
          };

          const normalizedRecurringDays = block.recurringDays.map((d: string) => {
            const normalized = dayNameMap[String(d).toLowerCase()];
            return normalized || String(d);
          });

          // Check if current day matches any recurring day
          const dayMatches = normalizedRecurringDays.includes(currentDayName);

          if (isDebugTarget) {
            console.log(`[free-slots] Checking recurring block "${block.name}": days=[${normalizedRecurringDays.join(', ')}], currentDay=${currentDayName}, matches=${dayMatches}, blockTime=${block.start}-${block.end}, slotTime=${slotMinutes}-${slotEnd}`);
          }

          if (dayMatches) {
            // Check if slot overlaps with block time: slot starts before block ends AND slot ends after block starts
            const timeOverlaps = slotMinutes < block.end && slotEnd > block.start;
            if (timeOverlaps) {
              if (isDebugTarget) {
                console.log(`[free-slots] ✓ BLOCKED: Slot ${displayFromMinutes(slotMinutes)} on ${currentDayName} overlaps with recurring block "${block.name}"`);
              }
              return true;
            }
          }
        } else if (block.date) {
          // Non-recurring block: compare using precomputed stable dateKey and check overlap
          if (block.date === slotDayKey) {
            if (slotMinutes < block.end && slotEnd > block.start) {
              if (isDebugTarget) {
                console.log(`[free-slots] ✓ BLOCKED: Slot ${displayFromMinutes(slotMinutes)} on ${slotDayKey} overlaps with one-time block "${block.name}"`);
              }
              return true;
            }
          }
        }
      }
      if (isDebugTarget) {
        console.log(`[free-slots] ✗ NOT BLOCKED: Slot ${displayFromMinutes(slotMinutes)} on ${currentDayName} (${slotDayKey}) is available`);
      }
      return false;
    };

    // Helper: Get overtime slots for a specific date (bypasses all restrictions except bookings)
    const getOvertimeSlotsForDate = (dateKey: string): number[] => {
      const overtimeForDate = overtimeList.filter((ot) => ot.date === dateKey)
      if (overtimeForDate.length === 0) return []

      const overtimeSlots: number[] = []
      for (const ot of overtimeForDate) {
        // Generate 15-minute interval slots within overtime window
        // Slot must fit entirely within overtime: slot + serviceDuration <= ot.end
        for (let mins = ot.start; mins + serviceDurationMinutes <= ot.end; mins += 15) {
          overtimeSlots.push(mins)
        }
      }
      return overtimeSlots
    }

    // Build results
    const filteredSlots: Record<string, string[]> = {};
    for (const day of daysToCheck) {
      const dateKey = ymdInTZ(day);
      const dowNum: number = Number(dayOfWeekInTZ(day));

      // Check for overtime slots for this date (these bypass ALL restrictions)
      const overtimeMins = getOvertimeSlotsForDate(dateKey);

      // Filter overtime slots only by existing bookings (can't double-book)
      // Overtime bypasses all other restrictions (business hours, time blocks, etc.)
      const validOvertimeMins = overtimeMins.filter((mins) => !isSlotBooked(day, mins, serviceDurationMinutes));

      // Normal slot logic
      let validMins: number[] = [];
      const bh = businessHoursMap[dowNum];
      const isTimeOff = isDateInTimeOff(day);

      // Only process normal slots if business hours exist and not on time off
      if (bh && !isTimeOff) {
        const openTime = bh.open_time;
        const closeTime = bh.close_time;

        validMins = (slotsData[dateKey]?.minutes || []).slice();
        validMins = validMins.filter((mins) => {
          const end = mins + serviceDurationMinutes;
          if (!hasBarber) return mins >= openTime && end <= closeTime;
          return mins >= openTime && end <= closeTime;
        });

        if (existingBookings.length > 0) {
          validMins = validMins.filter((mins) => !isSlotBooked(day, mins, serviceDurationMinutes));
        }

        if (hasBarber) {
          const isBarberDayOff = (barberWeekendIndexes || []).includes(dowNum);
          const bhours = barberHoursMap[dowNum];
          const barberHasNoHours = !bhours || (bhours.start === 0 && bhours.end === 0);

          if (isBarberDayOff || barberHasNoHours) {
            // Barber's day off - no normal slots, but overtime still applies
            validMins = [];
          } else {
            validMins = validMins.filter((mins) => {
              const blocked = isSlotBlocked(day, mins, serviceDurationMinutes);
              const booked = isSlotBooked(day, mins, serviceDurationMinutes);
              const end = mins + serviceDurationMinutes;
              return mins >= bhours.start && end <= bhours.end && !blocked && !booked;
            });
          }
        }
      }

      // Merge normal slots with overtime slots (remove duplicates)
      const allMins = new Set([...validMins, ...validOvertimeMins]);
      const finalMins = Array.from(allMins).sort((a, b) => a - b);
      if (finalMins.length > 0) {
        filteredSlots[dateKey] = finalMins.map(displayFromMinutes);
      }
    }

    // Log summary of slots calculated
    const totalSlots = Object.values(filteredSlots).reduce((sum, slots) => sum + slots.length, 0);
    console.log(`[free-slots] Slots calculation complete - Duration: ${serviceDurationMinutes} minutes | Total slots found: ${totalSlots} | Dates with slots: ${Object.keys(filteredSlots).length}`);

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


