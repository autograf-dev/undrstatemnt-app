"use client";

import { useState, useEffect } from "react";
import { Stepper } from "@/components/ui/stepper";
import { ServiceSelectionStep } from "./booking/ServiceSelectionStep";
import { StaffSelectionStep } from "./booking/StaffSelectionStep";
import { DateTimeStep } from "./booking/DateTimeStep";
import { InformationStep } from "./booking/InformationStep";
import { SuccessStep } from "./booking/SuccessStep";
import { Scissors, UserCheck, CalendarDays, Info, CheckCircle } from "lucide-react";
import { 
  BookingStep, 
  Department, 
  Service, 
  Staff, 
  DateInfo, 
  TimeSlot, 
  ContactForm, 
  ValidationErrors,
  WorkingSlots 
} from "@/lib/types";

const STEPS = [
  { title: "Service", icon: "scissors", value: "service" },
  { title: "Staff", icon: "user-check", value: "staff" },
  { title: "Date & Time", icon: "calendar-days", value: "datetime" },
  { title: "Information", icon: "info", value: "information" },
  { title: "Success", icon: "check-circle", value: "success" },
];

const getStepIcon = (stepValue: string) => {
  switch (stepValue) {
    case 'service': return Scissors;
    case 'staff': return UserCheck;
    case 'datetime': return CalendarDays;
    case 'information': return Info;
    case 'success': return CheckCircle;
    default: return Scissors;
  }
};

export default function BookingWidget() {
  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  
  // Service selection state
  const [departments, setDepartments] = useState<Department[]>([]);
  // If you don't want to load groups at all, use a sentinel department 'all'
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  // We're not fetching groups anymore; start as not loading
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Staff selection state
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [showGuestInput, setShowGuestInput] = useState(false);

  // URL parameters / preselection
  const [preselectedDepartmentId, setPreselectedDepartmentId] = useState<string>("");
  const [cameFromUrlParam, setCameFromUrlParam] = useState(false);

  // Date & Time selection state
  const [availableDates, setAvailableDates] = useState<DateInfo[]>([]);
  const [selectedDate, setSelectedDate] = useState<DateInfo | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [workingSlots, setWorkingSlots] = useState<WorkingSlots>({});
  const [workingSlotsLoaded, setWorkingSlotsLoaded] = useState<boolean>(false);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Contact form and booking state
  const [contactForm, setContactForm] = useState<ContactForm>({
    firstName: "",
    lastName: "",
    phone: "",
    optIn: false,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  
  // Skip loading departments entirely; services will be loaded directly.
  // useEffect(() => {}, []);
  //         const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  //         if (!isMobile) {
  //           setSelectedDepartment(departmentItems[0].id);
  //         }
  //       } else if (preselectedDepartmentId) {
  //         // Find department by name or ID
  //         let foundGroup = departmentItems.find((group: Department) => 
  //           group.name.toLowerCase() === preselectedDepartmentId.toLowerCase()
  //         );
          
  //         if (!foundGroup) {
  //           foundGroup = departmentItems.find((group: Department) => 
  //             group.id === preselectedDepartmentId
  //           );
  //         }
          
  //         if (foundGroup) {
  //           setSelectedDepartment(foundGroup.id);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error loading departments:', error);
  //       setDepartments([]);
  //     } finally {
  //       setLoadingGroups(false);
  //     }
  //   };

  //   loadDepartments();
  // }, [preselectedDepartmentId]);

  // Load services when department is selected
  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true);
      setSelectedService("");
      
      try {
        const start = Date.now();
        // If selectedDepartment is 'all', load all services; otherwise, filter by department
        const base = 'https://modify.undrstatemnt.com/.netlify/functions/Services';
        const url = selectedDepartment && selectedDepartment !== 'all'
          ? `${base}?id=${selectedDepartment}`
          : base;
        const res = await fetch(url);
        const data = await res.json();
        // Some responses return `services`, some `calendars`. Prefer `services` when present.
        const rawServices = (Array.isArray(data.services) && data.services.length > 0)
          ? data.services
          : (data.calendars || []);
        
        const serviceItems = rawServices.map((service: any) => {
          const raw = Number(service.slotDuration ?? service.duration ?? 0);
          const unit = String(service.slotDurationUnit ?? service.durationUnit ?? '').toLowerCase();
          const minutes = raw > 0 ? (unit === 'hours' || unit === 'hour' ? raw * 60 : raw) : 0;
          
          return {
            id: service.id,
            name: service.name,
            description: service.description,
            durationMinutes: minutes,
            teamMembers: service.teamMembers || []
          };
        });
        
        setServices(serviceItems);
        
        // Ensure skeleton shows at least 1s for smoother UX
        const elapsed = Date.now() - start;
        const remaining = 1000 - elapsed;
        if (remaining > 0) {
          await new Promise(r => setTimeout(r, remaining));
        }
      } catch (error) {
        console.error('Error loading services:', error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, [selectedDepartment]);

  // Load staff when service is selected
  useEffect(() => {
    if (!selectedService) return;
    
    const loadStaff = async () => {
      setLoadingStaff(true);
      setSelectedStaff("");
      setStaff([]);
      
      try {
        const base = 'https://modify.undrstatemnt.com/.netlify/functions/Services';
        // When using 'all', fetch from the base services endpoint; else filter by department
        const url = selectedDepartment && selectedDepartment !== 'all'
          ? `${base}?id=${selectedDepartment}`
          : base;
        const lastServiceApi = await fetch(url);
        const lastServiceData = await lastServiceApi.json();
        // Support either `services` or `calendars`
        const serviceList = (Array.isArray(lastServiceData.services) && lastServiceData.services.length > 0)
          ? lastServiceData.services
          : (lastServiceData.calendars || []);
        
        const serviceObj = serviceList.find((s: any) => s.id === selectedService);
        const teamMembers = serviceObj?.teamMembers || [];

        const items: Staff[] = [{
          id: 'any',
          name: 'Any available staff',
          badge: 'Recommended',
          icon: 'user'
        }];

        const staffPromises = teamMembers.map(async (member: any) => {
          try {
            const staffRes = await fetch(`https://modify.undrstatemnt.com/.netlify/functions/Staff?id=${member.userId}`);
            const staffData = await staffRes.json();

            const derivedName =
              staffData?.data?.name ||
              staffData?.name ||
              staffData?.fullName ||
              staffData?.displayName ||
              [staffData?.staff?.firstName, staffData?.staff?.lastName].filter(Boolean).join(' ') ||
              [staffData?.users?.firstName, staffData?.users?.lastName].filter(Boolean).join(' ') ||
              [staffData?.firstName, staffData?.lastName].filter(Boolean).join(' ') ||
              staffData?.user?.name ||
              'Staff';

            return {
              id: member.userId || staffData?.id,
              name: derivedName,
              icon: 'user'
            };
          } catch (error) {
            console.error('Error fetching staff data for member:', member.userId, error);
            return null;
          }
        });

        const staffResults = await Promise.all(staffPromises);
        const validStaff = staffResults.filter(Boolean) as Staff[];
        items.push(...validStaff);
        
        setStaff(items);
      } catch (error) {
        console.error('Error loading staff:', error);
        setStaff([]);
      } finally {
        setLoadingStaff(false);
      }
    };

    loadStaff();
  }, [selectedService, selectedDepartment]);

  // Load working slots when staff is selected
  useEffect(() => {
    if (!selectedService || !selectedStaff) return;
    
    const loadWorkingSlots = async () => {
      setSelectedTimeSlot("");
      setWorkingSlots({});
      setWorkingSlotsLoaded(false);
      setLoadingSlots(true);

      const serviceId = selectedService;
      const userId = selectedStaff && selectedStaff !== 'any' ? selectedStaff : null;

      try {
        const serviceDurationMinutes = getServiceDuration(serviceId);
        
        let apiUrl = `https://modify.undrstatemnt.com/.netlify/functions/staffSlots?calendarId=${serviceId}`;
        if (userId && selectedStaff !== 'any') {
          apiUrl += `&userId=${userId}`;
        }
        
        if (serviceDurationMinutes) {
          apiUrl += `&serviceDuration=${serviceDurationMinutes}`;
        }
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.slots && data.calendarId) {
          setWorkingSlots(data.slots);
          setWorkingSlotsLoaded(true);
          generateAvailableDates(data.slots);
          
          // Auto-select first available date and show slots
          setTimeout(() => {
            if (availableDates.length > 0) {
              const firstDate = availableDates[0];
              if (firstDate && firstDate.dateString) {
                setSelectedDate(firstDate);
                // Use the slots data directly instead of calling fetchSlotsForDate
                const slotsForSelectedDate = data.slots[firstDate.dateString];
                if (slotsForSelectedDate) {
                  const slotsWithStatus = slotsForSelectedDate.map((slot: string) => ({
                    time: slot,
                    isPast: isSlotInPastMST(slot, firstDate.dateString)
                  }));
                  const availableSlots = slotsWithStatus.filter((slot: { time: string; isPast: boolean }) => !slot.isPast);
                  setTimeSlots(availableSlots);
                  console.log('Auto-loaded slots for first date:', firstDate.dateString, availableSlots);
                }
              }
            }
          }, 200);
        }
      } catch (error) {
        console.error('Error fetching working slots:', error);
        setWorkingSlots({});
      } finally {
        setLoadingSlots(false);
      }
    };

    loadWorkingSlots();
  }, [selectedService, selectedStaff]);

  const getGroupIcon = (name: string): string => {
    switch (name.toLowerCase()) {
      case 'ladies': return 'heart';
      case 'gents': return 'user';
      case 'laser hair removal': return 'zap';
      case 'waxing': return 'droplet';
      case 'threading': return 'scissors';
      case 'bridal': return 'crown';
      case 'facials': return 'sparkles';
      default: return 'user';
    }
  };

  const getServiceDuration = (serviceId: string): number => {
    const service = services.find(s => s.id === serviceId);
    return service?.durationMinutes || 0;
  };

  const generateAvailableDates = (slots: WorkingSlots) => {
    const dates: DateInfo[] = [];
    
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowDateString = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    
    if (Object.keys(slots).length > 0) {
      const workingDates = Object.keys(slots)
        .filter(dateString => dateString >= tomorrowDateString)
        .sort();
      
      workingDates.forEach((dateString, index) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dateDisplay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        let label = '';
        if (dateString === tomorrowDateString) {
          label = 'TOMORROW';
        } else if (isThisWeek(dateString)) {
          label = 'THIS WEEK';
        } else {
          label = 'NEXT WEEK';
        }
        
        dates.push({
          dateString,
          dayName,
          dateDisplay,
          label,
          date
        });
      });
    }
    
    setAvailableDates(dates);
  };

  const isThisWeek = (dateString: string): boolean => {
    const today = new Date();
    const targetDate = new Date(dateString + 'T00:00:00');
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 1 && diffDays <= 7;
  };

  const fetchSlotsForDate = (dateString: string) => {
    if (!selectedService || !dateString) {
      setTimeSlots([]);
      return;
    }

    console.log('Fetching slots for specific date:', dateString);
    console.log('Working slots available:', workingSlots);
    
    setSelectedTimeSlot("");
    setLoadingSlots(true);

    // Use working slots data if available
    if (workingSlots[dateString]) {
      const slotsForSelectedDate = workingSlots[dateString];
      console.log('Raw slots for date:', dateString, slotsForSelectedDate);
      
      const slotsWithStatus = slotsForSelectedDate.map((slot: string) => ({
        time: slot,
        isPast: isSlotInPastMST(slot, dateString)
      }));
      
      // Filter out past slots and only show future/current slots
      const availableSlots = slotsWithStatus.filter((slot: { time: string; isPast: boolean }) => !slot.isPast);
      
      setTimeSlots(availableSlots);
      console.log('Filtered available slots for date:', dateString, availableSlots);
    } else {
      // If no weekly slots for this date, show empty
      setTimeSlots([]);
      console.log('No weekly slots available for date:', dateString);
    }
    
    setLoadingSlots(false);
  };

  const isSlotInPastMST = (slotTime: string, dateString: string): boolean => {
    if (!dateString || !slotTime) return false;
    
    // Get current time in local timezone
    const now = new Date();
    
    // Parse the date string (YYYY-MM-DD format) from API
    const [year, month, day] = dateString.split('-').map(Number);
    const slotDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    
    // Parse slot time (e.g., "2:30 PM" or "02:30 PM")
    const timeMatch = slotTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) return false;
    
    let hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();
    
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    slotDate.setHours(hour, minute, 0, 0);
    
    // Compare with current time (both in local timezone)
    return slotDate < now;
  };

  const formatDurationMins = (mins: number): string => {
    const m = Number(mins || 0);
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h > 0) return r > 0 ? `${h}h ${r}m` : `${h}h`;
    return `${r}m`;
  };

  const isValidCAPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10;
  };

  const formatPhoneNumber = (value: string): string => {
    let cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length > 10) {
      cleanValue = cleanValue.slice(0, 10);
    }
    
    if (cleanValue.length >= 6) {
      cleanValue = `(${cleanValue.slice(0, 3)}) ${cleanValue.slice(3, 6)}-${cleanValue.slice(6)}`;
    } else if (cleanValue.length >= 3) {
      cleanValue = `(${cleanValue.slice(0, 3)}) ${cleanValue.slice(3)}`;
    } else if (cleanValue.length > 0) {
      cleanValue = `(${cleanValue}`;
    }
    
    return cleanValue;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      firstName: '',
      lastName: '',
      phone: ''
    };

    if (!contactForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!contactForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!contactForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!isValidCAPhone(contactForm.phone)) {
      errors.phone = 'Please enter a valid 10-digit Canadian phone number';
    }

    setValidationErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const isFormValid = Boolean(contactForm.firstName.trim() && 
                     contactForm.lastName.trim() && 
                     contactForm.phone.trim() && 
                     isValidCAPhone(contactForm.phone));

  const handleServiceSubmit = () => {
    if (selectedService) {
      setCurrentStep("staff");
    }
  };

  const handleServiceSelectAndSubmit = (serviceId: string) => {
    setSelectedService(serviceId);
    setCurrentStep("staff");
  };

  const handleStaffSubmit = () => {
    if (selectedStaff) {
      setCurrentStep("datetime");
    }
  };

  const handleStaffSelectAndSubmit = (staffId: string) => {
    setSelectedStaff(staffId);
    setCurrentStep("datetime");
  };

  const handleDateTimeSubmit = () => {
    if (selectedTimeSlot) {
      setCurrentStep("information");
    }
  };

  const handleTimeSlotSelectAndSubmit = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setCurrentStep("information");
  };

  const handleTimeSlotClear = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    // Don't move to next step when clearing
  };

  const handleInformationSubmit = async () => {
    if (!validateForm()) return;

    setBookingLoading(true);

    try {
      // 1) Upsert/find customer to get contactId
      const customerUrl = new URL("https://modify.undrstatemnt.com/.netlify/functions/customer");
      customerUrl.searchParams.set("firstName", contactForm.firstName.trim());
      customerUrl.searchParams.set("lastName", contactForm.lastName.trim());
      customerUrl.searchParams.set("phone", contactForm.phone.replace(/\D/g, ""));
      const customerRes = await fetch(customerUrl.toString());
      const customerData = await customerRes.json();
      const contactId = customerData?.contactId || customerData?.id || customerData?.data?.id;

      // 2) Compute start/end UTC ISO from selectedDate + selectedTimeSlot (America/Edmonton)
      const serviceObj = services.find((s) => s.id === selectedService);
      const durationMins = serviceObj?.durationMinutes || getServiceDuration(selectedService);
      const startIsoUtc = toUtcIsoFromEdmonton(selectedDate?.dateString || "", selectedTimeSlot);
      const endIsoUtc = addMinutesIso(startIsoUtc, durationMins);

      // 3) Book appointment (send camelCase and snake_case params for compatibility)
      const apptUrl = new URL("https://modify.undrstatemnt.com/.netlify/functions/Apointment");
      const params: Record<string, string> = {
        // identifiers
        calendarId: selectedService,
        calendar_id: selectedService,
        assignedUserId: selectedStaff !== 'any' ? selectedStaff : "",
        assigned_user_id: selectedStaff !== 'any' ? selectedStaff : "",
        contactId: contactId || "",
        contact_id: contactId || "",
        // timing
        startTime: startIsoUtc,
        start_time: startIsoUtc,
        endTime: endIsoUtc,
        end_time: endIsoUtc,
        // service metadata
        title: serviceObj?.name || "Appointment",
        serviceName: serviceObj?.name || "",
        service_name: serviceObj?.name || "",
        servicePrice: "0",
        service_price: "0",
        serviceDuration: String(durationMins || 0),
        service_duration: String(durationMins || 0),
        // staff & customer display names
        staffName: (staff.find((s) => s.id === selectedStaff)?.name) || "Any available",
        assigned_barber_name: (staff.find((s) => s.id === selectedStaff)?.name) || "Any available",
        customerFirstName: contactForm.firstName.trim(),
        customerLastName: contactForm.lastName.trim(),
        customer_first_name: contactForm.firstName.trim(),
        customer_last_name: contactForm.lastName.trim(),
      };

      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) apptUrl.searchParams.set(k, v);
      });

      const apptRes = await fetch(apptUrl.toString());
      const apptData = await apptRes.json();

      if (apptRes.ok) {
        setCurrentStep("success");
      } else {
        console.error('Booking error response:', apptData);
      }
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBooking = () => {
    setCurrentStep("service");
    setSelectedDepartment("");
    setSelectedService("");
    setSelectedStaff("");
    setSelectedDate(null);
    setSelectedTimeSlot("");
    setGuestCount(1);
    setShowGuestInput(false);
    setContactForm({
      firstName: "",
      lastName: "",
      phone: "",
      optIn: false,
    });
    setValidationErrors({
      firstName: "",
      lastName: "",
      phone: "",
    });
    setTimeSlots([]);
    setWorkingSlots({});
    setWorkingSlotsLoaded(false);
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'staff':
        setCurrentStep('service');
        break;
      case 'datetime':
        setCurrentStep('staff');
        break;
      case 'information':
        setCurrentStep('datetime');
        break;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'service':
        return (
          <ServiceSelectionStep
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentSelect={(id) => setSelectedDepartment(id || 'all')}
            services={services}
            selectedService={selectedService}
            onServiceSelect={handleServiceSelectAndSubmit}
            loadingGroups={loadingGroups}
            loadingServices={loadingServices}
            onSubmit={handleServiceSubmit}
            cameFromUrlParam={cameFromUrlParam}
            onGoBack={() => setSelectedDepartment('all')}
          />
        );
      case 'staff':
        return (
          <StaffSelectionStep
            staff={staff}
            selectedStaff={selectedStaff}
            onStaffSelect={handleStaffSelectAndSubmit}
            loadingStaff={loadingStaff}
            guestCount={guestCount}
            onGuestCountChange={setGuestCount}
            showGuestInput={showGuestInput}
            onShowGuestInputChange={setShowGuestInput}
            selectedService={services.find(s => s.id === selectedService)}
            selectedStaffObj={staff.find(s => s.id === selectedStaff)}
            onSubmit={handleStaffSubmit}
            onPrevious={goToPreviousStep}
            getServiceDuration={getServiceDuration}
            formatDurationMins={formatDurationMins}
          />
        );
      case 'datetime':
        return (
          <DateTimeStep
            availableDates={availableDates}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            timeSlots={timeSlots}
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotSelect={handleTimeSlotSelectAndSubmit}
            onTimeSlotClear={handleTimeSlotClear}
            workingSlotsLoaded={workingSlotsLoaded}
            loadingSlots={loadingSlots}
            onSubmit={handleDateTimeSubmit}
            onPrevious={goToPreviousStep}
            selectedService={services.find(s => s.id === selectedService)}
            getServiceDuration={getServiceDuration}
            formatDurationMins={formatDurationMins}
            onDateChange={fetchSlotsForDate}
          />
        );
      case 'information':
        return (
          <InformationStep
            contactForm={contactForm}
            onContactFormChange={setContactForm}
            validationErrors={validationErrors}
            bookingLoading={bookingLoading}
            onSubmit={handleInformationSubmit}
            onPrevious={goToPreviousStep}
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            selectedService={services.find(s => s.id === selectedService)}
            selectedStaff={staff.find(s => s.id === selectedStaff)}
            guestCount={guestCount}
            getServiceDuration={getServiceDuration}
            formatDurationMins={formatDurationMins}
            formatPhoneNumber={formatPhoneNumber}
            isValidCAPhone={isValidCAPhone}
            isFormValid={isFormValid}
          />
        );
      case 'success':
        return (
          <SuccessStep
            onReset={resetBooking}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col items-center gap-6 pb-16 px-2 sm:px-4">
        <div className="w-full max-w-5xl overflow-hidden">
          <div className="p-4 sm:p-8">
            {/* Desktop Stepper */}
            <div className="hidden sm:block stepper-container">
              <Stepper 
                steps={STEPS} 
                currentStep={currentStep} 
                className="mb-0"
              />
            </div>
            
            {/* Mobile Step Indicator */}
            <div className="sm:hidden fixed top-4 right-4 z-50">
              <div className="w-12 h-12 bg-orange-primary rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out">
                {(() => {
                  const IconComponent = getStepIcon(currentStep);
                  return <IconComponent className="w-6 h-6 text-white" />;
                })()}
              </div>
            </div>
            
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Timezone helpers (America/Edmonton wall time -> UTC ISO) ---
function toUtcIsoFromEdmonton(dateString: string, timeLabel: string): string {
  if (!dateString || !timeLabel) return new Date().toISOString();

  // Parse time like "2:30 PM"
  const m = timeLabel.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return new Date().toISOString();
  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const period = m[3].toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  const [y, mo, d] = dateString.split('-').map(Number);
  // Start with the wall time interpreted as UTC, then adjust to find the real UTC instant for America/Edmonton
  let guess = new Date(Date.UTC(y, (mo || 1) - 1, d || 1, hour, minute, 0, 0));
  // Iterate to converge on correct offset (handles DST transitions)
  for (let i = 0; i < 3; i++) {
    const offsetMin = tzOffsetMinutes('America/Edmonton', guess);
    const next = new Date(Date.UTC(y, (mo || 1) - 1, d || 1, hour, minute, 0, 0) - offsetMin * 60_000);
    if (Math.abs(next.getTime() - guess.getTime()) < 1000) {
      guess = next;
      break;
    }
    guess = next;
  }
  return guess.toISOString();
}

function tzOffsetMinutes(timeZone: string, date: Date): number {
  // Adapted approach similar to date-fns-tz: format parts for the given TZ and reconstruct UTC ms, comparing with original
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value || '0');
  const y = get('year');
  const mo = get('month');
  const d = get('day');
  const h = get('hour');
  const mi = get('minute');
  const s = get('second');
  const asUTC = Date.UTC(y, (mo || 1) - 1, d || 1, h, mi, s);
  return (asUTC - date.getTime()) / 60000; // positive when TZ is behind UTC (e.g., -06:00 -> +360 minutes)
}

function addMinutesIso(iso: string, mins: number): string {
  const dt = new Date(iso);
  return new Date(dt.getTime() + (mins || 0) * 60_000).toISOString();
}
