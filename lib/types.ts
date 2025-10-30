export interface Department {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  imageUrl?: string;
  displayPrice?: string; // e.g., "From $25.00"
  teamMembers?: TeamMember[];
}

export interface TeamMember {
  userId: string;
  name?: string;
}

export interface Staff {
  /** Primary identifier used for booking and slot lookups (HighLevel user id) */
  id: string;
  name: string;
  icon?: string;
  badge?: string;
  imageUrl?: string;
  /** Supabase Data_barbers row id ("🔒 Row ID") for override joins */
  barberRowId?: string;
  /** Optional list of service IDs this barber supports (from Data_barbers "Services/List") */
  services?: string[];
  /** When populated, indicates the barber offers the currently selected service via membership or a custom override */
  offersForService?: boolean;
}

export interface DateInfo {
  dateString: string;
  dayName: string;
  dateDisplay: string;
  label: string;
  date: Date;
}

export interface TimeSlot {
  time: string;
  isPast?: boolean;
}

export interface ContactForm {
  firstName: string;
  lastName: string;
  phone: string;
  optIn: boolean;
}

export interface ValidationErrors {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface BookingData {
  contactId?: string;
  serviceId: string;
  staffId: string;
  date: Date;
  timeSlot: string;
  guestCount: number;
  contactForm: ContactForm;
}

export type BookingStep = 'service' | 'staff' | 'datetime' | 'information' | 'success';

export interface WorkingSlots {
  [dateString: string]: string[];
}
