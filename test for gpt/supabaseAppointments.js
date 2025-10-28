// supabaseAppointments.js
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Save or update an event in Supabase
 * @param {Object} booking
 */
async function saveEventToDB(booking) {
  try {
    console.log("📝 Attempting to save event:", JSON.stringify(booking, null, 2))

    const mappedEvent = {
      id: booking.id,
      location_id: booking.locationId || null,
      contact_id: booking.contactId || null,
      assigned_user_id: booking.assignedUserId || null,
      appointment_status: booking.appointmentStatus || null,
      title: booking.title || null,
      start_time: booking.startTime || null,
      end_time: booking.endTime || null,
      raw: booking.raw || {},
    }

    console.log("🗂️ Mapped event for DB:", JSON.stringify(mappedEvent, null, 2))

    // ✅ Insert as array
    const { data, error } = await supabase.from("ghl_events").insert([mappedEvent]).select()

    if (error) {
      console.error("❌ Supabase error details:", error)
      throw new Error(`Supabase error: ${error.message} (Code: ${error.code})`)
    }

    console.log("✅ Successfully saved event to DB:", data)
    return data
  } catch (err) {
    console.error("❌ Error saving event to DB:", err.message)
    console.error("❌ Full error:", err)
    throw err
  }
}

module.exports = { saveEventToDB }
