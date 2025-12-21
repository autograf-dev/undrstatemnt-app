import { NextResponse } from 'next/server';
import { buildValidationContext, validateSlot } from '@/lib/server/slot-validation';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const startTimeStr = url.searchParams.get('startTime');
  const durationStr = url.searchParams.get('duration');
  const userId = url.searchParams.get('userId');

  if (!startTimeStr || !durationStr || !userId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const startTime = new Date(startTimeStr);
  const duration = parseInt(durationStr);

  try {
    const context = await buildValidationContext(
      userId,
      startTime,
      new Date(startTime.getTime() + 24 * 60 * 60 * 1000)
    );

    const result = validateSlot(startTime, duration, context);

    return NextResponse.json({
      valid: result.valid,
      reason: result.reason,
      startTimeUTC: startTime.toISOString(),
      startTimeMST: startTime.toLocaleString('en-US', { timeZone: 'America/Edmonton' }),
      duration
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
