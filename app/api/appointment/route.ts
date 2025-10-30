    // Send detailed webhook for table mutation
    try {
      const detailedPayload = {
        appID: "VAC7eZY8vOOl4KZYEWF6",
        mutations: [
          {
            kind: "add-row-to-table",
            tableName: "native-table-17B93ocF1HmbC5Wge9ta",
            columnValues: {
              vJ042: (params.startTime ? new Date(params.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' }).replace(/-/g, '') : ""),
              kqZs5: params.bookingType || "Booking/Type",
              "8C8HP": booking.id || booking.cal_com_id || "",
              mNuL2: params.cancelUrl || "Booking/Cancel",
              VPfiU: params.modifyUrl || "Booking/Modify",
              "8265X": params.notifyUrl || "Booking/Notify",
              tN30J: params.appointmentStatus || booking.appointmentStatus || "Confirmed",
              wQ3qg: params.bookedBy || "Booking/Booked By",
              wF0cN: params.customerId || params.contactId || "",
              aPXKv: params.customerName || [params.customerFirstName, params.customerLastName].filter(Boolean).join(' ') || "",
              Ul1Xb: params.customerPhone || "",
              Ppy2M: params.customerEmail || "",
              xAwbe: params.staffId || params.assignedUserId || "",
              JE35N: params.serviceId || "",
              jIXWb: params.customPrice || "",
              b3MEu: params.serviceName || params.title || "",
              mN11Y: params.serviceDuration || "",
              "9qKZ1": booking.id || "",
              vY5AO: params.startTime || "",
              MAqsh: params.documentId || "",
              thd34: params.notes || "",
              uDzPy: params.paymentId || "",
              "4HFxg": "column1"
            }
          }
        ]
      };
      await fetch("https://primary-rmsi-production2.up.railway.app/webhook-test/e6aeb66b-e5c3-42e6-bc12-172900db6801", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detailedPayload)
      });
    } catch (e) {
      console.error("Detailed webhook send failed:", (e as Error).message);
    }
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
    ignoreFreeSlotValidation: true,
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
  try {
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

    if (!params.contactId || !params.calendarId || !params.startTime || !params.endTime) {
      return NextResponse.json({ error: 'Missing required parameters: contactId, calendarId, startTime, endTime' }, { status: 400, headers: cors() });
    }

    const booking = await createAppointment(params);

    // Enrich and save to DB
    const enhanced = {
      serviceName: params.serviceName,
      serviceDuration: params.serviceDuration ? Number(params.serviceDuration) : undefined,
      servicePrice: params.servicePrice ? Number(params.servicePrice) : undefined,
      staffName: params.staffName,
      paymentStatus: params.paymentStatus,
      customerName: params.customerName || [params.customerFirstName, params.customerLastName].filter(Boolean).join(' ') || undefined,
      startTime: params.startTime,
      endTime: params.endTime,
      assignedUserId: params.assignedUserId,
      apptId: booking?.id,
    };



    // Send to webhook (simple)
    try {
      const webhookPayload = {
        "Barber": params.staffName || params.assignedUserName || "",
        "Service": params.serviceName || params.title || "",
        "Customer": params.customerName || [params.customerFirstName, params.customerLastName].filter(Boolean).join(' ') || "",
        "Date": (params.startTime ? new Date(params.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' }).replace(/-/g, '') : ""),
        "Start": params.startTime ? (new Date(params.startTime).getHours() * 60 + new Date(params.startTime).getMinutes()) : null,
        "End (Buffer)": params.endTime ? (new Date(params.endTime).getHours() * 60 + new Date(params.endTime).getMinutes()) : null,
        "Status ": params.appointmentStatus || booking.appointmentStatus || "Confirmed"
      };
      await fetch("https://primary-rmsi-production2.up.railway.app/webhook-test/e6aeb66b-e5c3-42e6-bc12-172900db6801", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload)
      });
    } catch (e) {
      console.error("Webhook send failed:", (e as Error).message);
    }

    // Send detailed webhook for table mutation
    try {
      const detailedPayload = {
        appID: "VAC7eZY8vOOl4KZYEWF6",
        mutations: [
          {
            kind: "add-row-to-table",
            tableName: "native-table-17B93ocF1HmbC5Wge9ta",
            columnValues: {
              vJ042: (params.startTime ? new Date(params.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' }).replace(/-/g, '') : ""),
              kqZs5: params.bookingType || "Booking/Type",
              "8C8HP": booking.id || booking.cal_com_id || "",
              mNuL2: params.cancelUrl || "Booking/Cancel",
              VPfiU: params.modifyUrl || "Booking/Modify",
              "8265X": params.notifyUrl || "Booking/Notify",
              tN30J: params.appointmentStatus || booking.appointmentStatus || "Confirmed",
              wQ3qg: params.bookedBy || "Booking/Booked By",
              wF0cN: params.customerId || params.contactId || "",
              aPXKv: params.customerName || [params.customerFirstName, params.customerLastName].filter(Boolean).join(' ') || "",
              Ul1Xb: params.customerPhone || "",
              Ppy2M: params.customerEmail || "",
              xAwbe: params.staffId || params.assignedUserId || "",
              JE35N: params.serviceId || "",
              jIXWb: params.customPrice || "",
              b3MEu: params.serviceName || params.title || "",
              mN11Y: params.serviceDuration || "",
              "9qKZ1": booking.id || "",
              vY5AO: params.startTime || "",
              MAqsh: params.documentId || "",
              thd34: params.notes || "",
              uDzPy: params.paymentId || "",
              "4HFxg": "column1"
            }
          }
        ]
      };
      await fetch("https://primary-rmsi-production2.up.railway.app/webhook-test/e6aeb66b-e5c3-42e6-bc12-172900db6801", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detailedPayload)
      });
    } catch (e) {
      console.error("Detailed webhook send failed:", (e as Error).message);
    }

    try { await saveEventToDB({ ...booking, ...enhanced }); } catch (e) { console.error('DB save failed:', (e as Error).message); }

    return NextResponse.json({ message: '✅ Booking success', response: booking }, { headers: cors() });
  } catch (err: any) {
    console.error('❌ Booking failed:', err?.message || err);
    return NextResponse.json({ error: 'Booking failed', details: err?.message || 'Unknown' }, { status: 500, headers: cors() });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const params = body || {};
    if (!params.contactId || !params.calendarId || !params.startTime || !params.endTime) {
      return NextResponse.json({ error: 'Missing required parameters: contactId, calendarId, startTime, endTime' }, { status: 400, headers: cors() });
    }
    const booking = await createAppointment(params);
    try { await saveEventToDB(booking); } catch (e) { console.error('DB save failed:', (e as Error).message); }
    return NextResponse.json({ message: '✅ Booking success', response: booking }, { headers: cors() });
  } catch (err: any) {
    console.error('❌ Booking failed:', err?.message || err);
    return NextResponse.json({ error: 'Booking failed', details: err?.message || 'Unknown' }, { status: 500, headers: cors() });
  }
}
