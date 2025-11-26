"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Hourglass,
  Scissors,
  User,
  Users
} from "lucide-react";
import { ContactForm, ValidationErrors, DateInfo, Service, Staff } from "@/lib/types";
import { cn } from "@/lib/utils";

interface InformationStepProps {
  contactForm: ContactForm;
  onContactFormChange: (form: ContactForm) => void;
  validationErrors: ValidationErrors;
  bookingLoading: boolean;
  bookingError?: string;
  onSubmit: () => void;
  onPrevious: () => void;
  selectedDate: DateInfo | null;
  selectedTimeSlot: string;
  selectedService?: Service;
  selectedStaff?: Staff;
  guestCount: number;
  getServiceDuration: (serviceId: string) => number;
  formatDurationMins: (mins: number) => string;
  formatPhoneNumber: (value: string) => string;
  isValidCAPhone: (phone: string) => boolean;
  isFormValid: boolean;
  effectivePrice?: number | null;
  effectiveDuration?: number | null;
  fallbackServiceName?: string;
  fallbackStaffName?: string;
  // Reschedule UX
  showContactForm?: boolean;
  onEditContact?: () => void;
}

export function InformationStep({
  contactForm,
  onContactFormChange,
  validationErrors,
  bookingLoading,
  bookingError,
  onSubmit,
  onPrevious,
  selectedDate,
  selectedTimeSlot,
  selectedService,
  selectedStaff,
  guestCount,
  getServiceDuration,
  formatDurationMins,
  formatPhoneNumber,
  isValidCAPhone,
  isFormValid,
  effectivePrice,
  effectiveDuration,
  fallbackServiceName,
  fallbackStaffName,
  showContactForm = true,
  onEditContact
}: InformationStepProps) {
  const formatCalendarDate = (dateInfo: DateInfo | null): string => {
    if (!dateInfo) return '';
    const [year, month, day] = dateInfo.dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onContactFormChange({
      ...contactForm,
      phone: formatted
    });
  };

  return (
    <div className="service-selection-container">
      <div className="flex items-center mb-4 sm:mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          className="mr-2 sm:mr-4"
        >
          <ArrowLeft className="text-xl" />
        </Button>
        <div className="text-left lg:text-center flex-1">
          <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-3 lg:py-2.5">Contact Information</h2>
          <p className="hidden lg:block text-lg font-medium">Please provide your details to complete the booking</p>
        </div>
      </div>
      
      {/* Mobile: Single combined summary card at top */}
      <div className="lg:hidden mb-4">
        <Card className="p-3 rounded-xl border border-gray-200 bg-white">
          <h3 className="font-bold text-base text-black mb-2">Appointment Summary</h3>
          <div className="space-y-1.5">
            {/* Date */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span className="text-[13px] font-semibold">
                {formatCalendarDate(selectedDate)}
              </span>
            </div>
            {/* Time and Duration combined */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="text-[13px] font-semibold">{selectedTimeSlot} MST</span>
              <span className="text-[12px] text-gray-700">
                for {formatDurationMins(typeof effectiveDuration === 'number' && effectiveDuration > 0 ? effectiveDuration : getServiceDuration(selectedService?.id || ""))}
              </span>
            </div>
            {/* Service and Staff combined */}
            <div className="flex items-center gap-1.5">
              <Scissors className="w-4 h-4" />
              <span className="text-[13px] font-semibold">{selectedService?.name || fallbackServiceName || 'Service'}</span>
              <span className="text-[12px] text-gray-700">with {selectedStaff?.name || fallbackStaffName || ''}</span>
            </div>
            {/* Price (if available) */}
            {typeof effectivePrice === 'number' && effectivePrice > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold">$</span>
                <span className="text-[12px] text-gray-700">${effectivePrice.toFixed(2)}</span>
              </div>
            )}
            {/* Guests */}
            <div className="flex items-center gap-1.5">
              {guestCount > 1 ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
              <span className="text-[12px] text-gray-700">
                {guestCount} {guestCount === 1 ? 'person' : 'people'}
              </span>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form / Summary-with-edit */}
        <div className="space-y-6">
          {/* Error Message */}
          {bookingError && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Oops! This time slot is no longer available
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    {bookingError}
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    💡 Please go back and select another available time that works for you.
                  </p>
                </div>
              </div>
            </div>
          )}
          {!showContactForm ? (
            <Card className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Contact</div>
                  <div className="text-[13px] text-gray-700">{contactForm.firstName} {contactForm.lastName}</div>
                  <div className="text-[13px] text-gray-700">{contactForm.phone}</div>
                </div>
                <Button type="button" onClick={onEditContact} className="ml-4">Edit details</Button>
              </div>
            </Card>
          ) : null}

          <form className={`space-y-5 ${!showContactForm ? 'hidden' : ''}`} onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[12px] sm:text-sm font-medium text-black">First Name *</label>
                <Input
                  value={contactForm.firstName}
                  onChange={(e) => onContactFormChange({ ...contactForm, firstName: e.target.value })}
                  placeholder="First Name"
                  className="mt-1 h-10"
                  required
                />
                {validationErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-[12px] sm:text-sm font-medium text-black">Last Name *</label>
                <Input
                  value={contactForm.lastName}
                  onChange={(e) => onContactFormChange({ ...contactForm, lastName: e.target.value })}
                  placeholder="Last Name"
                  className="mt-1 h-10"
                  required
                />
                {validationErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                )}
              </div>
            </div>
            
            {/* Canadian Phone Number with Flag */}
            <div className="space-y-3">
              <label className="block text-[12px] sm:text-sm font-medium text-black">Phone Number *</label>
              <div className="flex items-center phone-input-container">
                {/* Canadian Flag and +1 Prefix */}
                <div className="country-code">
                  <img src="/image.png" alt="Canada" className="w-5 h-4 rounded-sm" />
                  <span className="font-medium">+1</span>
                </div>
                {/* Phone Number Input */}
                <input
                  value={contactForm.phone}
                  placeholder="(604) 555-1234"
                  className="flex-1 phone-input h-10"
                  onChange={handlePhoneChange}
                  required
                  type="tel"
                />
              </div>
              {validationErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
              )}
            </div>
           
           
            {/* Submit button rendered below for visibility even when form is hidden */}
          </form>

          {/* Visible submit button (works for both edit and reschedule summary-only modes) */}
          <button
            type="button"
            disabled={!isFormValid || bookingLoading}
            className="booking-button w-full font-bold text-white justify-center"
            onClick={onSubmit}
          >
            {bookingLoading ? 'Booking Your Appointment...' : 'Book Appointment'}
          </button>
        </div>
        
        {/* Desktop: Appointment Summary */}
        <div className="hidden lg:block space-y-4">
          <h3 className="font-bold text-xl text-black mb-4">Appointment Summary</h3>
          
          <div className="space-y-4">
            <Card className="p-6 rounded-xl border border-gray-200 bg-white">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="text-xl text-orange-primary" />
                  <span className="font-semibold text-black">
                    {formatCalendarDate(selectedDate)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-xl text-orange-primary" />
                  <span className="font-semibold text-black">{selectedTimeSlot} MST</span>
                </div>
                <div className="flex items-center gap-3">
                  <Hourglass className="text-xl text-orange-primary" />
                  <span className="text-gray-700">
                    {formatDurationMins(typeof effectiveDuration === 'number' && effectiveDuration > 0 ? effectiveDuration : getServiceDuration(selectedService?.id || ""))}
                  </span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 rounded-xl border border-gray-200 bg-white">
              <div className="space-y-3">
                <div className="font-bold text-lg text-black">{selectedService?.name || fallbackServiceName || 'Service'}</div>
                <div className="flex items-center gap-3">
                  <User className="text-xl text-orange-primary" />
                  <span className="text-gray-700">with {selectedStaff?.name || fallbackStaffName || ''}</span>
                </div>
                {typeof effectivePrice === 'number' && effectivePrice > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-orange-primary font-semibold">$</span>
                    <span className="text-gray-700">${effectivePrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {guestCount > 1 ? <Users className="text-xl text-orange-primary" /> : <User className="text-xl text-orange-primary" />}
                  <span className="text-gray-700">
                    {guestCount} {guestCount === 1 ? 'person' : 'people'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
