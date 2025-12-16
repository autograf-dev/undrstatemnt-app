const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
            process.env[key] = val;
        }
    });
}

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function run() {
    const userId = 'eYJjJM14mTB22mi2U26p';
    console.log(`Checking overtime for userId: ${userId}`);

    const { data: barber } = await supabase.from('Data_barbers').select('*').eq('GHL_id', userId).maybeSingle();
    const barberRowId = barber ? (barber['🔒 Row ID'] || barber['\uD83D\uDD12 Row ID']) : null;
    console.log(`Barber Row ID: ${barberRowId}`);

    let overtimeData = [];

    // 1. Check by ghl_id
    const { data: d1 } = await supabase.from('time_overtime').select('*').eq('ghl_id', userId);
    if (d1) overtimeData = overtimeData.concat(d1);

    // 2. Check by Barber/ID
    if (barberRowId) {
        const { data: d2 } = await supabase.from('time_overtime').select('*').eq('Barber/ID', barberRowId);
        if (d2) overtimeData = overtimeData.concat(d2);
    }

    console.log(`Found ${overtimeData.length} overtime entries.`);
    overtimeData.forEach(ot => {
        console.log(`Overtime: Date=${ot['Overtime/Date']}, Start=${ot['Overtime/Start Value']}, End=${ot['Overtime/End Value']}`);
    });
}

run();
