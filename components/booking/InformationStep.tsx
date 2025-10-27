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
}

export function InformationStep({
  contactForm,
  onContactFormChange,
  validationErrors,
  bookingLoading,
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
  isFormValid
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
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          className="mr-4 text-orange-primary hover:bg-orange-50"
        >
          <ArrowLeft className="text-xl" />
        </Button>
        <div className="text-left lg:text-center flex-1">
          <h2 className="text-3xl font-bold mb-3 lg:py-2.5">Contact Information</h2>
          <p className="text-lg font-medium hidden lg:block">Please provide your details to complete the booking</p>
        </div>
      </div>
      
      {/* Mobile: Single combined summary card at top */}
      <div className="lg:hidden mb-6">
        <Card className="p-4 rounded-xl border border-gray-200 bg-white">
          <h3 className="font-bold text-lg text-black mb-4">Appointment Summary</h3>
          <div className="space-y-1">
            {/* Date */}
            <div className="flex items-center gap-1">
              <Calendar className="text-sm text-orange-primary" />
              <span className="text-sm font-semibold text-black">
                {formatCalendarDate(selectedDate)}
              </span>
            </div>
            {/* Time and Duration combined */}
            <div className="flex items-center gap-1">
              <Clock className="text-sm text-orange-primary" />
              <span className="text-sm font-semibold text-black">{selectedTimeSlot} MST</span>
              <span className="text-sm text-gray-700">
                for {formatDurationMins(getServiceDuration(selectedService?.id || ""))}
              </span>
            </div>
            {/* Service and Staff combined */}
            <div className="flex items-center gap-1">
              <Scissors className="text-sm text-orange-primary" />
              <span className="text-sm font-semibold text-black">{selectedService?.name}</span>
              <span className="text-sm text-gray-700">with {selectedStaff?.name}</span>
            </div>
            {/* Guests */}
            <div className="flex items-center gap-1">
              {guestCount > 1 ? <Users className="text-sm text-orange-primary" /> : <User className="text-sm text-orange-primary" />}
              <span className="text-sm text-gray-700">
                {guestCount} {guestCount === 1 ? 'person' : 'people'}
              </span>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="space-y-6">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 text-black">First Name *</label>
                <Input
                  value={contactForm.firstName}
                  onChange={(e) => onContactFormChange({ ...contactForm, firstName: e.target.value })}
                  placeholder="First Name"
                  className="mt-1"
                  required
                />
                {validationErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 text-black">Last Name *</label>
                <Input
                  value={contactForm.lastName}
                  onChange={(e) => onContactFormChange({ ...contactForm, lastName: e.target.value })}
                  placeholder="Last Name"
                  className="mt-1"
                  required
                />
                {validationErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                )}
              </div>
            </div>
            
            {/* Canadian Phone Number with Flag */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 text-black">Phone Number *</label>
              <div className="flex items-center phone-input-container">
                {/* Canadian Flag and +1 Prefix */}
                <div className="country-code">
                  <img src="/image.png" alt="Canada" className="w-5 h-4 rounded-sm" />
                  <span className="text-gray-700 font-medium">+1</span>
                </div>
                {/* Phone Number Input */}
                <input
                  value={contactForm.phone}
                  placeholder="(604) 555-1234"
                  className="flex-1 phone-input"
                  onChange={handlePhoneChange}
                  required
                  type="tel"
                />
              </div>
              {validationErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
              )}
            </div>
           
           
            <button
              type="submit"
              disabled={!isFormValid || bookingLoading}
              className="booking-button w-full font-bold text-white justify-center"
            >
              {bookingLoading ? 'Booking Your Appointment...' : 'Book Appointment'}
            </button>
          </form>
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
                    {formatDurationMins(getServiceDuration(selectedService?.id || ""))}
                  </span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 rounded-xl border border-gray-200 bg-white">
              <div className="space-y-3">
                <div className="font-bold text-lg text-black">{selectedService?.name}</div>
                <div className="flex items-center gap-3">
                  <User className="text-xl text-orange-primary" />
                  <span className="text-gray-700">with {selectedStaff?.name}</span>
                </div>
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
