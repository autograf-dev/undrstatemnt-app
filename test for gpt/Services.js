const axios = require('axios');
const { getValidAccessToken } = require('../../supbase');

// 🔄 Retry helper for 429 Too Many Requests
async function fetchWithRetry(url, headers, retries = 3, delay = 500) {
  try {
    return await axios.get(url, { headers });
  } catch (err) {
    if (err.response?.status === 429 && retries > 0) {
      console.warn(`429 received (Services.js), retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      return fetchWithRetry(url, headers, retries - 1, delay * 2);
    }
    throw err;
  }
}

exports.handler = async function (event) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // ✅ Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const accessToken = await getValidAccessToken();

    if (!accessToken) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Access token missing' })
      };
    }

    const qs = event.queryStringParameters || {};
    const locationId = qs.locationId || 'iwqzlJBNFlXynsezheHv'; // default location
    const calendarId = qs.calendarId || qs.id || null; // support old `id` param

    // If a specific calendar/service is requested, fetch its details
    if (calendarId) {
      const detailResp = await fetchWithRetry(
        `https://services.leadconnectorhq.com/calendars/${calendarId}`,
        {
          Authorization: `Bearer ${accessToken}`,
          Version: '2021-04-15'
        }
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, service: detailResp.data, calendar: detailResp.data })
      };
    }

    // Otherwise list all calendars/services for a location
    const listResp = await fetchWithRetry(
      `https://services.leadconnectorhq.com/calendars/?locationId=${locationId}`,
      {
        Authorization: `Bearer ${accessToken}`,
        Version: '2021-04-15'
      }
    );

    const calendars = listResp.data?.calendars || [];

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, locationId, total: calendars.length, calendars, services: calendars })
    };

  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data || err.message;
    console.error("❌ Error fetching calendars:", message);

    return {
      statusCode: status,
      headers: corsHeaders,
      body: JSON.stringify({ error: message })
    };
  }
};
