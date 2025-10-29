import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/server/supabase';

// Always return staff enriched from Data_barbers so we have services membership and the Data_barbers Row ID
export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServiceClient();
    const url = new URL(req.url);
    const serviceId = url.searchParams.get('serviceId') || '';

    // Source of truth for service membership is Data_barbers."Services/List"
    const barbersRes = await supabase
      .from('Data_barbers')
      .select('"User/ID", "Barber/Name", "🔒 Row ID", "Services/List"');

    if (barbersRes.error) {
      console.error('[supabasestaff] query error:', barbersRes.error);
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }

    const barbers: any[] = Array.isArray(barbersRes.data) ? barbersRes.data : [];

    const overrideBarberIds = new Set<string>();
    const serviceIdCandidates = new Set<string>();
    const serviceNameCandidates = new Set<string>();

    if (serviceId) {
      serviceIdCandidates.add(String(serviceId));

      // Try to enrich with alternative ids and names from Data_Services
      let serviceRow: any = null;
      for (const col of ['glide_row_id', '🔒 Row ID', 'id']) {
        const { data, error } = await (supabase as any)
          .from('Data_Services')
          .select('*')
          .eq(col, serviceId)
          .maybeSingle();
        if (!error && data) { serviceRow = data; break; }
      }
      if (!serviceRow) {
        const { data: allRows } = await (supabase as any).from('Data_Services').select('*');
        if (Array.isArray(allRows)) {
          const found = allRows.find((r: any) => {
            const candidates = [r?.['glide_row_id'], r?.['🔒 Row ID'], r?.id, r?.['Row ID'], r?.row_id]
              .map((v: any) => (v != null ? String(v) : ''));
            return candidates.includes(String(serviceId));
          });
          if (found) serviceRow = found;
        }
      }
      if (serviceRow) {
        const normalize = (x: string) => x.replace(/\s+/g, ' ').trim().toLowerCase();
        const sName = String(serviceRow?.['Service/Name'] || serviceRow?.name || '').trim();
        const sDisp = String(serviceRow?.['Service/Display Name'] || '').trim();
        if (sName) serviceNameCandidates.add(normalize(sName));
        if (sDisp) serviceNameCandidates.add(normalize(sDisp));
        [serviceRow?.['glide_row_id'], serviceRow?.['🔒 Row ID'], serviceRow?.id, serviceRow?.['Row ID'], serviceRow?.row_id]
          .map((v: any) => (v != null ? String(v) : ''))
          .filter(Boolean)
          .forEach((v: string) => serviceIdCandidates.add(v));
      }

      // Fetch all custom rows and filter locally by matching service id or name
      const { data: customAll, error: customErr } = await (supabase as any)
        .from('Data_Services_Custom')
        .select('*');
      if (customErr) console.error('[supabasestaff] custom fetch error:', customErr);

      // Build barber-name -> rowId map
      const nameToBarberId = new Map<string, string>();
      for (const b of barbers) {
        const nm = String(b?.['Barber/Name'] || '').replace(/\s+/g, ' ').trim().toLowerCase();
        const id = b?.['🔒 Row ID'];
        if (nm && id != null) nameToBarberId.set(nm, String(id));
      }

      if (Array.isArray(customAll)) {
        const norm = (x: any) => String(x ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
        for (const r of customAll) {
          const cIds = [r?.['Service/ID'], r?.['Service/Row ID'], r?.['Service Row ID'], r?.['glide_row_id'], r?.['🔒 Row ID'], r?.['ServiceId'], r?.['Service ID']]
            .map((v: any) => (v != null ? String(v) : ''))
            .filter(Boolean);
          const cNames = [r?.['Service/Name'], r?.['Service Name'], r?.['Service'], r?.['Service/Display Name']]
            .map(norm)
            .filter(Boolean);
          const idMatch = cIds.some((cid: string) => serviceIdCandidates.has(cid));
          const nameMatch = cNames.some((cn: string) => serviceNameCandidates.has(cn));
          if (!(idMatch || nameMatch)) continue;

          const bIdCandidates = [r?.['Barber/ID'], r?.['Barber Row ID'], r?.['Barber/Row ID'], r?.['Barber 🔒 Row ID'], r?.['BarberId'], r?.['Barber ID']]
            .map((v: any) => (v != null ? String(v) : ''))
            .filter(Boolean);
          let resolved = '';
          if (bIdCandidates.length) {
            resolved = bIdCandidates[0];
          } else {
            const bName = norm(r?.['Barber/Name Lookup'] || r?.['Barber/Name'] || '');
            if (bName && nameToBarberId.has(bName)) resolved = String(nameToBarberId.get(bName));
          }
          if (resolved) overrideBarberIds.add(resolved);
        }
      }
    }

    const rows = barbers.map((r: any) => {
      const rawServices = r?.['Services/List'];
      const servicesList: string[] = Array.isArray(rawServices)
        ? rawServices.map((s: any) => String(s).trim()).filter(Boolean)
        : typeof rawServices === 'string'
          ? String(rawServices).split(',').map((s: string) => s.trim()).filter(Boolean)
          : [];

      const barberRowId = r?.['🔒 Row ID'] || null;
      let offersForService: boolean | undefined = undefined;
      if (serviceId) {
        const listMatch = servicesList.some((sid) => sid && (sid === serviceId || serviceIdCandidates.has(sid)));
        const overrideMatch = barberRowId ? overrideBarberIds.has(String(barberRowId)) : false;
        offersForService = Boolean(listMatch || overrideMatch);
      }

      return {
        id: r?.['User/ID'] || r?.id || r?.userId || r?.user_id || '',
        ghl_id: r?.['User/ID'] || '',
        name: r?.['Barber/Name'] || 'Staff',
        barberRowId,
        servicesList,
        offersForService,
      };
    });

    rows.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}