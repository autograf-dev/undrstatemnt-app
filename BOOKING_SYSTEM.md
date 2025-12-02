# Booking System Architecture

## Overview

The booking system is a multi-step flow that allows customers to select services, staff, date/time slots, and complete their appointment booking. The system enforces strict availability constraints both when displaying available slots AND when finalizing bookings to prevent double-booking and scheduling conflicts.

## System Components

### Frontend Components (`/components`)

#### Main Booking Widget
- **`BookingWidget.tsx`** - Main orchestrator that manages the booking flow state and step navigation
  - Loads services from API
  - Loads staff from API
  - Fetches available slots from `/api/free-slots`
  - Auto-selects first available date and times
  - Handles form submission to `/api/appointment`

#### Booking Steps
- **`booking/ServiceSelectionStep.tsx`** - Service selection UI (departments → specific services)
- **`booking/StaffSelectionStep.tsx`** - Staff/barber selection UI
- **`booking/DateTimeStep.tsx`** - Calendar and time slot selection UI
- **`booking/InformationStep.tsx`** - Customer details form (name, phone, opt-in)
- **`booking/SuccessStep.tsx`** - Confirmation screen after booking

### Backend API Routes (`/app/api`)

#### Data Endpoints
- **`/api/supabasestaff`** - Returns staff list with mapped IDs (GHL_id, glide_user_id, barberRowId)
- **`/api/supabaseservices`** - Returns service definitions
- **`/api/data_services`** - Additional service data
- **`/api/data_services_custom`** - Custom service durations per barber

#### Availability & Booking
- **`/api/free-slots`** (GET) - Computes and returns available time slots
  - Builds 15-minute interval grid for 30 days
  - Filters by business hours (Trading_hours)
  - Filters by barber hours (Data_barbers)
  - Excludes time-off days (time_off table + Data_barbers field)
  - Excludes time blocks (time_block/time_blocks tables)
  - Excludes existing bookings (ghl_events)
  - Returns slots in format: `{ "2025-12-05": ["10:00 AM", "10:15 AM", ...] }`

- **`/api/appointment`** (GET/POST) - Creates appointments in HighLevel
  - **CRITICAL**: Re-validates slot availability server-side before creating booking
  - Uses same validation logic as `/api/free-slots`
  - Returns HTTP 409 with "Timeslot no longer available" if validation fails
  - Creates appointment in GHL via API
  - Saves to Supabase `ghl_events` table
  - Sends webhooks for external integrations

### Validation Library (`/lib/server/slot-validation.ts`)

**Shared validation functions used by both free-slots and appointment endpoints:**

#### Core Validation Checks (in order)
1. **Business Hours** - Slot must fall within store operating hours (Trading_hours)
2. **Barber Hours** - If staff selected, slot must fall within their working hours (Data_barbers)
3. **Time Off** - Slot cannot be on a day the staff has marked as unavailable (time_off, Data_barbers)
4. **Time Blocks** - Slot cannot overlap with blocked time periods (time_block/time_blocks)
5. **Existing Bookings** - Slot cannot overlap with confirmed appointments (ghl_events)

#### Key Functions
- `buildValidationContext()` - Fetches all validation data in one batch
- `validateSlot()` - Runs all 5 checks and returns validation result
- Individual check functions: `isWithinBusinessHours()`, `isWithinBarberHours()`, `isDateInTimeOff()`, `isSlotBlocked()`, `isSlotBooked()`

## Data Flow

```
User Action → Frontend Component → API Endpoint → Database/External API
```

### Viewing Available Slots
1. User selects service (duration determined)
2. User selects staff (optional)
3. `BookingWidget` calls `/api/free-slots?calendarId=X&userId=Y&serviceDuration=Z`
4. Free-slots endpoint:
   - Fetches Trading_hours, Data_barbers, time_off, time_blocks, ghl_events
   - Builds validation context
   - Filters 15-min slots over 30 days
   - Returns available slots by date
5. UI displays calendar with available times

### Creating a Booking
1. User fills contact form and clicks "Book Appointment"
2. `BookingWidget` submits to `/api/appointment` with:
   - `contactId`, `calendarId`, `startTime`, `endTime`
   - `assignedUserId` (staff GHL_id)
   - `serviceName`, `serviceDuration`, etc.
3. Appointment endpoint **RE-VALIDATES** the slot:
   - Fetches current business hours, barber hours, time blocks, time off, bookings
   - Runs all 5 validation checks
   - If ANY check fails → returns HTTP 409 "Timeslot no longer available"
4. If validation passes:
   - Creates appointment in HighLevel API
   - Saves to Supabase `ghl_events`
   - Sends webhooks
   - Returns success response
5. UI shows success screen

## Database Tables

### Supabase Tables Used

#### `Trading_hours`
- Store business hours by day of week
- Fields: `Day/Name`, `Day/Start` (minutes), `Day/End` (minutes)

#### `Data_barbers`
- Staff/barber master data
- Fields: `GHL_id`, `glide_user_id`, `🔒 Row ID`, `Barber/Photo`, `Services/List`
- Working hours: `Monday/Start Value`, `Monday/End Value`, etc.
- Time off: `Time Off/Unavailable Dates` (comma-separated YYYYMMDD)
- Day off flags: `Sunday/Day Off`, etc.

#### `time_off`
- Individual time-off entries for staff
- Fields: `ghl_id`, `Barber/ID`, `Dates/Unavailable`, `Event/Start`, `Event/End`

#### `time_block` / `time_blocks`
- Blocked time periods (one-time or recurring)
- Fields: `ghl_id`, `Barber/ID`, `Block/Start`, `Block/End`, `Block/Date -> ID Check`
- Recurring: `Block/Recurring` (boolean), `Block/Recurring Day` (comma-separated day names)

#### `ghl_events`
- Existing appointments (synced from HighLevel)
- Fields: `id`, `calendar_id`, `assigned_user_id`, `start_time`, `end_time`, `appointment_status`, `date_id`
- **Note**: Only `appointment_status != 'canceled'` appointments block slots

#### `Data_Services_Custom`
- Custom service durations per barber
- Fields: `Barber/ID`, `ghl_id`, `ghl_calendar_id`, `Service/Lookup`, `Barber/Duration`

## Key Features

### Double-Booking Prevention
- **Client-side**: Shows only available slots based on current data
- **Server-side**: Re-validates EVERY booking request before creation
- **Race condition protection**: Even if two users request the same slot simultaneously, the second request will be rejected

### Validation Consistency
- Both `/api/free-slots` and `/api/appointment` use the **same validation library**
- Ensures availability logic is identical across display and booking
- Prevents discrepancies between shown slots and accepted bookings

### Cache Protection
- Server-side validation protects against stale client cache
- Even if frontend shows an outdated slot, backend will reject it
- Explicit error message: "Timeslot no longer available"

### Timezone Handling
- All calculations use `America/Edmonton` timezone
- Date/time conversions use `Intl.DateTimeFormat` for accuracy
- Prevents timezone-related booking errors

## Error Handling

### Validation Failures
When a booking request is rejected due to validation failure:

**HTTP Status**: 409 Conflict

**Response**:
```json
{
  "error": "Timeslot no longer available",
  "reason": "Timeslot is already booked",
  "details": "Please refresh and select another time"
}
```

**Possible Reasons**:
- `"Timeslot is outside business hours"`
- `"Timeslot is outside staff availability hours"`
- `"Timeslot falls on a staff time-off day"`
- `"Timeslot is blocked due to time restrictions"`
- `"Timeslot is already booked"`

### Frontend Handling
The frontend should:
1. Display the error message to the user
2. Refresh the available slots
3. Prompt user to select a different time
4. Log validation failures for debugging

## Testing

### Manual Testing Scenarios
1. **Business Hours** - Try booking outside store hours (should be blocked)
2. **Staff Hours** - Try booking when staff is unavailable (should be blocked)
3. **Time Off** - Try booking on a staff time-off day (should be blocked)
4. **Time Blocks** - Try booking during a blocked period (should be blocked)
5. **Double Booking** - Try booking an already-taken slot (should be rejected with 409)
6. **Race Condition** - Simulate two simultaneous bookings for same slot (second should fail)

### Validation Test Endpoints
```bash
# Check available slots
curl "http://localhost:3000/api/free-slots?calendarId=TEST&userId=USER_ID&serviceDuration=60"

# Attempt booking (should validate server-side)
curl -X POST "http://localhost:3000/api/appointment" \
  -H "Content-Type: application/json" \
  -d '{
    "calendarId": "TEST",
    "contactId": "CONTACT_ID",
    "assignedUserId": "USER_ID",
    "startTime": "2025-12-05T15:00:00Z",
    "endTime": "2025-12-05T16:00:00Z"
  }'
```

## Security Considerations

1. **Server-Side Validation** - Never trust client-provided availability data
2. **ID Mapping** - Properly resolve GHL_id, glide_user_id, barberRowId across tables
3. **Status Filtering** - Always exclude canceled appointments from availability checks
4. **Input Validation** - Validate date formats, duration values, required fields
5. **Rate Limiting** - Consider adding rate limits to prevent booking spam

## Future Improvements

- [ ] Add request deduplication for rapid-fire booking attempts
- [ ] Implement optimistic locking for high-traffic scenarios
- [ ] Add booking confirmation webhooks with retry logic
- [ ] Cache validation context with short TTL for performance
- [ ] Add detailed validation logging for analytics
- [ ] Support for service-specific time blocks
- [ ] Multi-barber booking support (team appointments)
- [ ] Waitlist functionality for fully booked slots

## Troubleshooting

### Slots Not Showing
1. Check `Trading_hours` - ensure business hours are set
2. Check `Data_barbers` - verify staff hours are configured
3. Check `time_off` - ensure no accidental full-year blocks
4. Check `ghl_events` - verify bookings have correct `assigned_user_id`

### Bookings Rejected Despite Available Slots
1. Check server logs for validation failure reason
2. Verify time blocks aren't overlapping desired slot
3. Ensure no race condition (another booking created milliseconds earlier)
4. Check that `appointment_status` filtering is working correctly

### Inconsistent Availability
1. Verify both endpoints use `slot-validation.ts` library
2. Check for timezone issues in date calculations
3. Ensure Supabase data is synchronized with HighLevel
4. Review custom duration overrides in `Data_Services_Custom`

## Contact & Support

For questions about the booking system architecture, validation logic, or debugging issues, refer to:
- `/lib/server/slot-validation.ts` - Core validation logic
- `/app/api/free-slots/route.ts` - Availability calculation
- `/app/api/appointment/route.ts` - Booking creation with validation
- `/components/BookingWidget.tsx` - Frontend booking flow
