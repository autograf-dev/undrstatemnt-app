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
  teamMembers?: TeamMember[];
}

export interface TeamMember {
  userId: string;
  name?: string;
}

export interface Staff {
  id: string;
  name: string;
  icon?: string;
  badge?: string;
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
