"use client";

import { useState, useEffect, type CSSProperties } from "react";
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
import { cn } from "@/lib/utils";

export interface BookingWidgetProps {
  className?: string;
  style?: CSSProperties;
  
  // API Configuration
  /** API endpoint for services */
  servicesApiPath?: string;
  /** API endpoint for staff */
  staffApiPath?: string;
  /** API endpoint for staff slots */
  staffSlotsApiPath?: string;
  /** API endpoint for customers */
  customerApiPath?: string;
  /** API endpoint for appointments */
  appointmentApiPath?: string;
  
  // Color Scheme
  /** Primary color (buttons, active states) */
  primaryColor?: string;
  /** Secondary color */
  secondaryColor?: string;
  /** Background color */
  bgColor?: string;
  /** Card background color */
  cardBgColor?: string;
  /** Text color - Primary */
  textColorPrimary?: string;
  /** Text color - Secondary */
  textColorSecondary?: string;
  /** Border color */
  borderColor?: string;
  /** Hover color */
  hoverColor?: string;
  
  // Typography
  /** Heading font size */
  headingSize?: string;
  /** Subheading font size */
  subheadingSize?: string;
  /** Body text font size */
  bodyTextSize?: string;
  /** Small text font size */
  smallTextSize?: string;
  
  // Step Labels
  /** Step 1 label */
  step1Label?: string;
  /** Step 2 label */
  step2Label?: string;
  /** Step 3 label */
  step3Label?: string;
  /** Step 4 label */
  step4Label?: string;
  /** Step 5 label */
  step5Label?: string;
  
  // Button Text
  /** Continue button text */
  continueButtonText?: string;
  /** Back button text */
  backButtonText?: string;
  /** Submit button text */
  submitButtonText?: string;
  /** Book Now button text */
  bookNowButtonText?: string;
  
  // Loading & Empty States
  /** Loading text */
  loadingText?: string;
  /** No results text */
  noResultsText?: string;
  /** Show loading spinner */
  showLoadingSpinner?: boolean;
  
  // Spacing & Layout
  /** Container max width */
  maxWidth?: string;
  /** Container padding */
  containerPadding?: string;
  /** Card border radius */
  cardBorderRadius?: string;
  /** Button border radius */
  buttonBorderRadius?: string;
  /** Card gap/spacing */
  cardGap?: string;
  
  // Stepper Configuration
  /** Show stepper on desktop */
  showStepper?: boolean;
  /** Show step indicator on mobile */
  showMobileStepIndicator?: boolean;
  /** Stepper color - Active */
  stepperActiveColor?: string;
  /** Stepper color - Inactive */
  stepperInactiveColor?: string;
  /** Stepper color - Completed */
  stepperCompletedColor?: string;
  // Service card styling (Plasmic-managed)
  serviceCardBorderColor?: string;
  serviceCardShadow?: string;
  serviceCardRadius?: string;
  serviceCardPadding?: string;
  servicePriceColor?: string;
  servicePriceIconColor?: string;
  serviceDurationIconColor?: string;
  serviceCardActiveBg?: string;
  serviceCardActiveText?: string;
  serviceCardActiveBorderColor?: string;
  // Loading spinner color
  spinnerColor?: string;
  // Fine text colors and nav
  serviceTitleColor?: string;
  serviceDurationColor?: string;
  staffNameColor?: string;
  navPrimaryBg?: string;
  navPrimaryText?: string;
  navSecondaryBorder?: string;
  navSecondaryText?: string;
  /** Success step: loop control only */
  successLottieLoop?: boolean;
  successTitle?: string;
  successMessage?: string;
  successShowInfoCard?: boolean;
  successInfoTitle?: string;
  successInfoBullets?: string[];
}

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

export default function BookingWidget({
  className,
  style,
  // API Configuration
  servicesApiPath = "/api/supabaseservices",
  staffApiPath = "/api/supabasestaff",
  staffSlotsApiPath = "/api/free-slots",
  customerApiPath = "/api/customer",
  appointmentApiPath = "/api/appointment",
  // Success Lottie (loop only)
  successLottieLoop = true,
  successTitle = "Booking Confirmed! 🎉",
  successMessage = "Thank you for choosing us! Your appointment has been successfully booked. We're excited to see you soon!",
  successShowInfoCard = true,
  successInfoTitle = "What's Next?",
  successInfoBullets = [
    "You'll receive a confirmation SMS shortly",
    "We'll send you a reminder 24 hours before",
    "Call us anytime if you need to reschedule",
  ],
  // Color Scheme
  primaryColor = "#D97639",
  secondaryColor = "#6b7280",
  bgColor = "white",
  cardBgColor = "#ffffff",
  textColorPrimary = "#1a1a1a",
  textColorSecondary = "#6b7280",
  borderColor = "#e5e7eb",
  hoverColor = "#f9fafb",
  // Typography
  headingSize = "1.5rem",
  subheadingSize = "1.125rem",
  bodyTextSize = "1rem",
  smallTextSize = "0.875rem",
  // Step Labels
  step1Label = "Service",
  step2Label = "Staff",
  step3Label = "Date & Time",
  step4Label = "Information",
  step5Label = "Success",
  // Button Text
  continueButtonText = "Continue",
  backButtonText = "Back",
  submitButtonText = "Submit",
  bookNowButtonText = "Book Now",
  // Loading & Empty States
  loadingText = "Loading...",
  noResultsText = "No results found",
  showLoadingSpinner = true,
  // Spacing & Layout
  maxWidth = "1280px",
  containerPadding = "2rem",
  cardBorderRadius = "0.75rem",
  buttonBorderRadius = "0.5rem",
  cardGap = "1rem",
  // Stepper Configuration
  showStepper = true,
  showMobileStepIndicator = true,
  stepperActiveColor = "#D97639",
  stepperInactiveColor = "#e5e7eb",
  stepperCompletedColor = "#10b981",
  // Service card styling
  serviceCardBorderColor,
  serviceCardShadow,
  serviceCardRadius,
  serviceCardPadding,
  servicePriceColor,
  servicePriceIconColor,
  serviceDurationIconColor,
  serviceCardActiveBg,
  serviceCardActiveText,
  serviceCardActiveBorderColor,
  spinnerColor,
  serviceTitleColor,
  serviceDurationColor,
  staffNameColor,
  navPrimaryBg,
  navPrimaryText,
  navSecondaryBorder,
  navSecondaryText,
}: BookingWidgetProps) {
  // Normalize/override legacy API paths coming from Plasmic instances
  const effectiveServicesApiPath = servicesApiPath === "/api/services" ? "/api/supabaseservices" : servicesApiPath;
  const effectiveStaffApiPath = staffApiPath === "/api/staff" ? "/api/supabasestaff" : staffApiPath;
  const effectiveStaffSlotsApiPath = staffSlotsApiPath === "/api/free-slots" || staffSlotsApiPath === "/api/free-slots" ? "/api/free-slots" : staffSlotsApiPath;
  // Log overrides once on mount (avoid spamming per render)
  console.log('effectiveStaffSlotsApiPath', effectiveStaffSlotsApiPath);
  useEffect(() => {
    if (servicesApiPath !== effectiveServicesApiPath) {
      console.warn('[Booking] Overriding servicesApiPath from', servicesApiPath, 'to', effectiveServicesApiPath);
    }
    if (staffApiPath !== effectiveStaffApiPath) {
      console.warn('[Booking] Overriding staffApiPath from', staffApiPath, 'to', effectiveStaffApiPath);
    }
    if (staffSlotsApiPath !== effectiveStaffSlotsApiPath) {
      console.warn('[Booking] Overriding staffSlotsApiPath from', staffSlotsApiPath, 'to', effectiveStaffSlotsApiPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Dynamic steps based on labels
  const STEPS = [
    { title: step1Label, icon: "scissors", value: "service" },
    { title: step2Label, icon: "user-check", value: "staff" },
    { title: step3Label, icon: "calendar-days", value: "datetime" },
    { title: step4Label, icon: "info", value: "information" },
    { title: step5Label, icon: "check-circle", value: "success" },
  ];

  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  
  // Service selection state
  const [departments, setDepartments] = useState<Department[]>([]);
  // If you don't want to load groups at all, use a sentinel department 'all'
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [services, setServices] = useState<Service[]>([]);
  // Initialize selected service from URL (prevents first-load race clearing it)
  const initialSelectedService = typeof window !== 'undefined' ? (() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('serviceId') || sp.get('calendarId') || "";
    } catch { return ""; }
  })() : "";
  const [selectedService, setSelectedService] = useState<string>(initialSelectedService);
  const [usingSupabaseServices, setUsingSupabaseServices] = useState<boolean>(false);
  // We're not fetching groups anymore; start as not loading
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Staff selection state
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [guestCount, setGuestCount] = useState(1);

  // Normalize a phone number to only digits; server will convert to E.164
  const digitsOnly = (raw: string): string => (raw || '').replace(/\D/g, '');
  const [showGuestInput, setShowGuestInput] = useState(false);
  
  // Effective overrides (duration/price) for current service+staff
  const [effectiveDuration, setEffectiveDuration] = useState<number | null>(null);
  const [effectivePrice, setEffectivePrice] = useState<number | null>(null);

  // URL parameters / preselection
  const [preselectedDepartmentId, setPreselectedDepartmentId] = useState<string>("");
  // Seed cameFromUrlParam from URL immediately to avoid first-effect races
  const initialCameFromUrl = typeof window !== 'undefined' ? (() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return Boolean(sp.get('serviceId') || sp.get('calendarId'));
    } catch { return false; }
  })() : false;
  const [cameFromUrlParam, setCameFromUrlParam] = useState(initialCameFromUrl);

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
  
  // Preselect via URL (?serviceId=..., optional ?staffId=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const svc = sp.get('serviceId') || sp.get('calendarId');
      const stf = sp.get('staffId') || sp.get('userId') || sp.get('barberId');
      if (svc) {
        // selectedService already seeded from URL on initial state; keep it if present
        if (!selectedService) setSelectedService(svc);
        setCameFromUrlParam(true);
        if (stf) {
          setSelectedStaff(stf);
          setCurrentStep('datetime');
        } else {
          setCurrentStep('staff');
        }
      }
    } catch {}
  }, []);

  // Load services when department is selected
  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true);
      // Never clear selectedService automatically; preserve deep-linked or user selection
      
      try {
        const start = Date.now();
        // If selectedDepartment is 'all', load all services; otherwise, filter by department
        const url = selectedDepartment && selectedDepartment !== 'all'
          ? `${effectiveServicesApiPath}?id=${selectedDepartment}`
          : effectiveServicesApiPath;
        const res = await fetch(url);
        const data = await res.json();
        if (typeof window !== 'undefined') {
          console.log('[Booking] loadServices:', { url, cameFromUrlParam, selectedService, dataSample: Array.isArray(data) ? data.length : Object.keys(data || {}).slice(0, 3) });
        }
        let serviceItems: Service[] = [];
        if (Array.isArray(data)) {
          // Supabase services format
          setUsingSupabaseServices(true);
          serviceItems = data.map((s: any) => {
            const minutes = Number(s.duration ?? s.durationMinutes ?? 0) || 0;
            return {
              id: String(s.id),
              name: s.displayName || s.name || 'Service',
              description: s.description || '',
              durationMinutes: minutes,
              imageUrl: s.photo || s.image || s.imageUrl || s["Service/Photo"],
              displayPrice: s.displayPrice || s["Service/Display Price"] || s.priceDisplay || undefined,
            };
          });
        } else {
          // HighLevel services/calendars format
          setUsingSupabaseServices(false);
          const rawServices = (Array.isArray(data.services) && data.services.length > 0)
            ? data.services
            : (data.calendars || []);

          serviceItems = rawServices.map((service: any) => {
            const raw = Number(service.slotDuration ?? service.duration ?? 0);
            const unit = String(service.slotDurationUnit ?? service.durationUnit ?? '').toLowerCase();
            const minutes = raw > 0 ? (unit === 'hours' || unit === 'hour' ? raw * 60 : raw) : 0;
            
            return {
              id: service.id,
              name: service.name,
              description: service.description,
              durationMinutes: minutes,
              imageUrl: service.image || service.photo || service.imageUrl,
              displayPrice: service.displayPrice || service.priceDisplay,
              teamMembers: service.teamMembers || []
            };
          });
        }
        // Merge with any previously injected service (from deep-link bootstrap)
        setServices((prev) => {
          const byId = new Map<string, Service>();
          for (const p of prev) byId.set(p.id, p);
          for (const s of serviceItems) byId.set(s.id, s);
          // If deep-linked service isn’t in the list, keep the existing injected one
          if (cameFromUrlParam && selectedService && !serviceItems.find((s) => s.id === selectedService)) {
            const injected = prev.find((p) => p.id === selectedService);
            if (injected) byId.set(injected.id, injected);
          }
          return Array.from(byId.values());
        });
        
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
  }, [selectedDepartment, effectiveServicesApiPath, cameFromUrlParam]);

  // Ensure selected service has base info when deep-linked via URL (populate duration/name)
  useEffect(() => {
    const ensureServiceLoaded = async () => {
      if (!selectedService) return;
      // If we already have this service, skip
      if (services.find((s) => s.id === selectedService)) return;
      try {
        const url = new URL('/api/supabaseservices', window.location.origin);
        url.searchParams.set('serviceId', selectedService);
        const resp = await fetch(url.toString());
        const data = await resp.json();
        const svc = data?.service;
        if (svc) {
          const minutes = Number(svc.duration ?? svc.durationMinutes ?? 0) || 0;
          setServices((prev) => [
            ...prev,
            {
              id: String(svc.id),
              name: svc.displayName || svc.name || 'Service',
              description: svc.description || '',
              durationMinutes: minutes,
            },
          ]);
          setUsingSupabaseServices(true);
        }
      } catch (e) {
        // non-fatal; keep going
      }
    };
    ensureServiceLoaded();
  }, [selectedService]);

  // Load staff when service is selected
  useEffect(() => {
    if (!selectedService) return;
    
    const loadStaff = async () => {
      setLoadingStaff(true);
      setSelectedStaff("");
      setStaff([]);
      
      try {
        const items: Staff[] = [{
          id: 'any',
          name: 'Any available staff',
          badge: 'Recommended',
          icon: 'user'
        }];

        // Prefer Supabase staff directory when available regardless of services load state
        let appendedFromSupabase = false;
        try {
          const staffRes = await fetch(`${effectiveStaffApiPath}?serviceId=${encodeURIComponent(String(selectedService))}`);
          const staffList = await staffRes.json();
          if (typeof window !== 'undefined') {
            console.log('[Booking] supabase staff raw length:', Array.isArray(staffList) ? staffList.length : null);
          }
          if (Array.isArray(staffList) && staffList.length) {
            const allStaff: Staff[] = staffList.map((s: any) => {
              // Only use staff directory fields for ghl id (various casings/paths)
              const ghlIdRaw = s?.ghl_id || s?.ghlId || s?.['ghlId'] || s?.staff?.ghl_id || s?.staff?.ghlId || s?.user?.ghl_id || s?.user?.ghlId;
              const ghlId = ghlIdRaw ? String(ghlIdRaw) : undefined;
              return {
                id: String(s.id), // Keep UUID id for internal tracking
                ghlId, // Explicitly store HighLevel user id
                name: s.name || s.fullName || 'Staff',
                icon: 'user',
                imageUrl: s.photo || s.avatarUrl || s.imageUrl,
                barberRowId: s.barberRowId || s['🔒 Row ID'] || undefined,
                services: Array.isArray(s.servicesList)
                  ? s.servicesList.map((v: any) => String(v))
                  : typeof s.servicesList === 'string'
                    ? s.servicesList.split(',').map((x: string) => x.trim()).filter(Boolean)
                    : [],
                // annotated by API when serviceId is provided
                offersForService: s.offersForService === true,
              };
            });
            const filtered = allStaff.filter((st) =>
              st.offersForService === true || (Array.isArray(st.services) && st.services.includes(String(selectedService)))
            );
            if (typeof window !== 'undefined') {
              console.log('[Booking] staff filtered count:', filtered.length, { selectedService, matched: filtered.map(s => s.name) });
            }
            items.push(...filtered);
            appendedFromSupabase = filtered.length > 0;
          }
        } catch {}

        if (!appendedFromSupabase) {
          // Fallback to deriving from HighLevel service team members
          const url = selectedDepartment && selectedDepartment !== 'all'
            ? `${effectiveServicesApiPath}?id=${selectedDepartment}`
            : effectiveServicesApiPath;
          const lastServiceApi = await fetch(url);
          const lastServiceData = await lastServiceApi.json();
          const serviceList = (Array.isArray(lastServiceData.services) && lastServiceData.services.length > 0)
            ? lastServiceData.services
            : (lastServiceData.calendars || []);
          const serviceObj = serviceList.find((s: any) => s.id === selectedService);
          const teamMembers = serviceObj?.teamMembers || [];

          const staffPromises = teamMembers.map(async (member: any) => {
            try {
              const staffRes = await fetch(`${effectiveStaffApiPath}?id=${member.userId}`);
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
        }

        setStaff(items);
        if (typeof window !== 'undefined') {
          console.log('[Booking] final staff count:', items.length);
        }
      } catch (error) {
        console.error('Error loading staff:', error);
        setStaff([]);
      } finally {
        setLoadingStaff(false);
      }
    };

    loadStaff();
  }, [selectedService, selectedDepartment, effectiveServicesApiPath, effectiveStaffApiPath, usingSupabaseServices]);

  // Fetch effective duration/price overrides for the selected service + staff
  useEffect(() => {
    const resetOverrides = () => {
      setEffectiveDuration(null);
      setEffectivePrice(null);
    };
    if (!selectedService) { resetOverrides(); return; }
    if (!selectedStaff || selectedStaff === 'any') { resetOverrides(); return; }

    const loadOverrides = async () => {
      try {
        const url = new URL('/api/supabaseservices', window.location.origin);
        url.searchParams.set('serviceId', selectedService);
        // Prefer Data_barbers row id if available for override join
        const selected = staff.find((s) => s.id === selectedStaff);
        const overrideBarberId = selected?.barberRowId || selectedStaff;
        url.searchParams.set('barberId', overrideBarberId);
        const resp = await fetch(url.toString());
        const data = await resp.json();
        const eff = data?.effective;
        if (eff && typeof eff.duration === 'number') setEffectiveDuration(eff.duration);
        else setEffectiveDuration(null);
        if (eff && typeof eff.price === 'number') setEffectivePrice(eff.price);
        else setEffectivePrice(null);
      } catch (e) {
        console.error('Error fetching effective overrides:', e);
        setEffectiveDuration(null);
        setEffectivePrice(null);
      }
    };

    loadOverrides();
  }, [selectedService, selectedStaff]);

  // Load working slots when staff is selected
  useEffect(() => {
    if (!selectedService || !selectedStaff) return;
    
    const loadWorkingSlots = async () => {
      setSelectedTimeSlot("");
      setWorkingSlots({});
      setWorkingSlotsLoaded(false);
      setLoadingSlots(true);

      const serviceId = selectedService;
      // Match by either UUID id or ghlId, because selection may pass ghlId
      const selectedStaffObj = staff.find((s) => s.id === selectedStaff || s.ghlId === selectedStaff);
      const userId = selectedStaff && selectedStaff !== 'any' 
        ? (selectedStaffObj?.ghlId || selectedStaff) 
        : null;

      if (typeof window !== 'undefined') {
        console.log('[BookingWidget] Selected staff ghl_id:', selectedStaffObj?.ghlId || 'not available');
      }

      try {
        const serviceDurationMinutes = getServiceDuration(serviceId);
        
          let apiUrl = `${effectiveStaffSlotsApiPath}?calendarId=${serviceId}`;
        if (userId && selectedStaff !== 'any') {
          apiUrl += `&userId=${userId}`;
        }
        
        if (serviceDurationMinutes) {
          apiUrl += `&serviceDuration=${serviceDurationMinutes}`;
        }
        
        console.log('[BookingWidget] Fetching slots endpoint:', apiUrl);
        console.log('[BookingWidget] Request params:', {
          calendarId: serviceId,
          userId: userId || 'none (any staff)',
          serviceDuration: serviceDurationMinutes,
          selectedStaff: selectedStaff,
          selectedStaffUuid: selectedStaffObj?.id || 'not found',
          selectedStaffGhlId: selectedStaffObj?.ghlId || 'not available',
          staffName: selectedStaffObj?.name || 'not found'
        });
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log('[BookingWidget] Slots API response:', {
          url: apiUrl,
          status: response.status,
          calendarId: data.calendarId,
          startDate: data.startDate,
          targetTimeZone: data.targetTimeZone,
          datesWithSlots: Object.keys(data.slots || {}).length,
          slots: data.slots
        });

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
  }, [selectedService, selectedStaff, effectiveStaffSlotsApiPath, effectiveDuration]);

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
    // Prefer effective override when service+staff pair is selected
    if (
      serviceId === selectedService &&
      selectedStaff && selectedStaff !== 'any' &&
      typeof effectiveDuration === 'number' && effectiveDuration > 0
    ) {
      return effectiveDuration;
    }
    const service = services.find((s) => s.id === serviceId);
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
    setEffectiveDuration(null);
    setEffectivePrice(null);
    setCurrentStep("staff");
  };

  const handleStaffSubmit = () => {
    if (selectedStaff) {
      setCurrentStep("datetime");
    }
  };

  const handleStaffSelectAndSubmit = (staffId: string) => {
    console.log('[BookingWidget] Staff selected:', staffId);
    setSelectedStaff(staffId);
    setEffectiveDuration(null);
    setEffectivePrice(null);
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
      const customerUrl = new URL(customerApiPath, window.location.origin);
      customerUrl.searchParams.set("firstName", contactForm.firstName.trim());
      customerUrl.searchParams.set("lastName", contactForm.lastName.trim());
      customerUrl.searchParams.set("phone", contactForm.phone.replace(/\D/g, ""));
      const customerRes = await fetch(customerUrl.toString());
      if (!customerRes.ok) {
        const err = await customerRes.json().catch(() => ({} as any));
        console.error('Customer lookup/create failed:', err);
        setBookingLoading(false);
        return;
      }
      const customerData = await customerRes.json();
      let contactId = (
        customerData?.contactId ||
        customerData?.id ||
        customerData?.data?.id ||
        customerData?.meta?.contactId ||
        customerData?.contact?.id
      );
      // Fallback: sometimes create returns without id surfaced; re-query once to fetch it
      if (!contactId) {
        try {
          const verifyUrl = new URL(customerApiPath, window.location.origin);
          verifyUrl.searchParams.set("firstName", contactForm.firstName.trim());
          verifyUrl.searchParams.set("lastName", contactForm.lastName.trim());
          verifyUrl.searchParams.set("phone", digitsOnly(contactForm.phone));
          const verifyRes = await fetch(verifyUrl.toString());
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            contactId = (
              verifyData?.contactId ||
              verifyData?.id ||
              verifyData?.data?.id ||
              verifyData?.meta?.contactId ||
              verifyData?.contact?.id
            );
          }
        } catch (e) {
          console.error('Customer verify fetch failed:', e);
        }
      }
      if (!contactId) {
        console.error('Customer response missing contactId after retry');
        setBookingLoading(false);
        return;
      }

      // 2) Compute start/end UTC ISO from selectedDate + selectedTimeSlot (America/Edmonton)
      const serviceObj = services.find((s) => s.id === selectedService);
      // Prefer effective/custom duration when available; fallback to service default
      const durationMins = getServiceDuration(selectedService) || serviceObj?.durationMinutes || 0;
      const startIsoUtc = toUtcIsoFromEdmonton(selectedDate?.dateString || "", selectedTimeSlot);
      const endIsoUtc = addMinutesIso(startIsoUtc, durationMins);

      // 3) Look up the correct ghl_calendar_id for this service+barber combo
      let calendarId = "";
      try {
        const url = new URL("/api/supabaseservices", window.location.origin);
        url.searchParams.set("serviceId", selectedService);
        // Prefer Data_barbers row id if available for override join
        const selected = staff.find((s) => s.id === selectedStaff);
        const overrideBarberId = selected?.barberRowId || selectedStaff;
        if (selectedStaff && selectedStaff !== "any") {
          url.searchParams.set("barberId", overrideBarberId);
        }
        const resp = await fetch(url.toString());
        const data = await resp.json();
        // Prefer custom override calendarId if present, else fallback to base
        calendarId = data?.effective?.calendarId || data?.service?.raw?.["ghl_calendar_id"] || data?.service?.ghl_calendar_id || "";
        // Some custom rows may have the calendarId in the custom row
        if (!calendarId && data?.effective?.source === "custom" && data?.effective?.raw?.["ghl_calendar_id"]) {
          calendarId = data.effective.raw["ghl_calendar_id"];
        }
        // Fallback: if still not found, try to get from serviceObj
        if (!calendarId && (serviceObj as any)?.raw?.["ghl_calendar_id"]) {
          calendarId = (serviceObj as any).raw["ghl_calendar_id"];
        }
        // Final fallback: treat selectedService as calendarId if your services == calendars setup
        if (!calendarId && selectedService) {
          calendarId = selectedService;
        }
      } catch (e) {
        console.error("Failed to look up ghl_calendar_id for booking:", e);
      }
      if (!calendarId) {
        alert("Could not determine the correct calendar for this service/barber. Please contact support.");
        setBookingLoading(false);
        return;
      }

      // 4) Use selected staff id directly as assigned user id (ghl user id)
      let assignedUserId = "";
      if (selectedStaff && selectedStaff !== "any") {
        const selectedStaffObj = staff.find((s) => s.id === selectedStaff || s.ghlId === selectedStaff);
        assignedUserId = selectedStaffObj?.ghlId || selectedStaff;
      }

      // 5) Book appointment (send camelCase params only)
      const apptUrl = new URL(appointmentApiPath, window.location.origin);
      const serviceName = serviceObj?.name || "";
      const staffName = (staff.find((s) => s.id === selectedStaff)?.name) || "Any available";
      const customerFirstName = contactForm.firstName.trim();
      const customerLastName = contactForm.lastName.trim();
      const title = `${serviceName || "Appointment"} - ${[customerFirstName, customerLastName].filter(Boolean).join(" ")}`;

      const params: Record<string, string> = {
        calendarId,
        assignedUserId,
        contactId,
        startTime: startIsoUtc,
        endTime: endIsoUtc,
        title,
        serviceName,
        servicePrice: String((effectivePrice ?? 0) || 0),
        serviceDuration: String(durationMins || 0),
        staffName,
        customerFirstName,
        customerLastName,
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
            serviceCardBorderColor={serviceCardBorderColor}
            serviceCardShadow={serviceCardShadow}
            serviceCardRadius={serviceCardRadius}
            serviceCardPadding={serviceCardPadding}
            servicePriceColor={servicePriceColor}
            servicePriceIconColor={servicePriceIconColor}
            serviceDurationIconColor={serviceDurationIconColor}
            serviceCardActiveBg={serviceCardActiveBg}
            serviceCardActiveText={serviceCardActiveText}
            serviceCardActiveBorderColor={serviceCardActiveBorderColor}
            serviceTitleColor={serviceTitleColor}
            serviceDurationColor={serviceDurationColor}
            navPrimaryBg={navPrimaryBg}
            navPrimaryText={navPrimaryText}
            navSecondaryBorder={navSecondaryBorder}
            navSecondaryText={navSecondaryText}
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
            staffNameColor={staffNameColor}
            navPrimaryBg={navPrimaryBg}
            navPrimaryText={navPrimaryText}
            navSecondaryBorder={navSecondaryBorder}
            navSecondaryText={navSecondaryText}
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
            navPrimaryBg={navPrimaryBg}
            navPrimaryText={navPrimaryText}
            navSecondaryBorder={navSecondaryBorder}
            navSecondaryText={navSecondaryText}
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
            effectivePrice={effectivePrice ?? undefined}
          />
        );
      case 'success':
        return (
          <SuccessStep
            onReset={resetBooking}
            lottieLoop={successLottieLoop}
            successTitle={successTitle}
            successMessage={successMessage}
            showInfoCard={successShowInfoCard}
            infoCardTitle={successInfoTitle}
            infoBullets={successInfoBullets}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn("", className)} 
      style={{ 
        ...style,
        backgroundColor: bgColor,
        color: textColorPrimary,
      }}
    >
      <div 
        className="flex flex-col items-center gap-6 pb-16 px-0 sm:px-0"
        style={{ padding: containerPadding }}
      >
        <div className="w-full overflow-hidden" style={{ maxWidth }}>
          <div className="p-0 sm:p-8">
            {/* Desktop Stepper */}
            {showStepper && (
              <div className="hidden sm:block stepper-container">
                <Stepper 
                  steps={STEPS} 
                  currentStep={currentStep} 
                  className="mb-0"
                />
              </div>
            )}
            
            {/* Mobile Step Indicator */}
            {showMobileStepIndicator && (
              <div className="sm:hidden fixed top-4 right-4 z-50">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out"
                  style={{ backgroundColor: stepperActiveColor }}
                >
                  {(() => {
                    const IconComponent = getStepIcon(currentStep);
                    return <IconComponent className="w-6 h-6 text-white" />;
                  })()}
                </div>
              </div>
            )}
            
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