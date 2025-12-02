"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Hourglass
} from "lucide-react";
import { DateInfo, TimeSlot, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DateTimeStepProps {
  availableDates: DateInfo[];
  selectedDate: DateInfo | null;
  onDateSelect: (date: DateInfo) => void;
  timeSlots: TimeSlot[];
  selectedTimeSlot: string;
  onTimeSlotSelect: (timeSlot: string) => void;
  onTimeSlotClear: (timeSlot: string) => void;
  workingSlotsLoaded: boolean;
  loadingSlots: boolean;
  onSubmit: () => void;
  onPrevious: () => void;
  selectedService?: Service;
  getServiceDuration: (serviceId: string) => number;
  formatDurationMins: (mins: number) => string;
  onDateChange: (dateString: string) => void;
  navPrimaryBg?: string;
  navPrimaryText?: string;
  navSecondaryBorder?: string;
  navSecondaryText?: string;
  extendedAvailableDates?: DateInfo[];
  extendedSlotsLoaded?: boolean;
  onCalendarOpen?: () => void;
}

export function DateTimeStep({
  availableDates,
  selectedDate,
  onDateSelect,
  timeSlots,
  selectedTimeSlot,
  onTimeSlotSelect,
  onTimeSlotClear,
  workingSlotsLoaded,
  loadingSlots,
  onSubmit,
  onPrevious,
  selectedService,
  getServiceDuration,
  formatDurationMins,
  onDateChange,
  navPrimaryBg,
  navPrimaryText,
  navSecondaryBorder,
  navSecondaryText,
  extendedAvailableDates = [],
  extendedSlotsLoaded = false,
  onCalendarOpen
}: DateTimeStepProps) {
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [monthAnchor, setMonthAnchor] = useState<Date | null>(null);

  // Always combine available dates and extended dates for calendar picker
  // This ensures the calendar shows all known available dates, not just the first 7
  const datesForCalendar = showMonthPicker 
    ? (extendedSlotsLoaded && extendedAvailableDates.length > 0 
        ? extendedAvailableDates 
        : availableDates) // Fall back to availableDates if extended not loaded yet
    : availableDates;

  // Build a quick lookup for available dates (YYYY-MM-DD)
  const availableSet = new Set((datesForCalendar || []).map(d => d.dateString));

  // Determine the month we are showing
  const baseDateString = (selectedDate?.dateString) || (availableDates[0]?.dateString) || '';
  const initialMonth = (() => {
    if (!baseDateString) return new Date();
    const [y,m] = baseDateString.split('-').map(Number);
    return new Date(y, (m || 1) - 1, 1);
  })();
  const monthToShow = monthAnchor || initialMonth;

  const startOfMonth = new Date(monthToShow.getFullYear(), monthToShow.getMonth(), 1);
  const endOfMonth = new Date(monthToShow.getFullYear(), monthToShow.getMonth() + 1, 0);
  const startWeekday = startOfMonth.getDay(); // 0=Sun
  const totalDays = endOfMonth.getDate();

  const goMonth = (delta: number) => {
    const d = new Date(monthToShow);
    d.setMonth(d.getMonth() + delta);
    setMonthAnchor(d);
  };

  const visibleDates = availableDates.slice(currentDateIndex, currentDateIndex + (typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 3));

  const navigateDate = (direction: number) => {
    const newIndex = currentDateIndex + direction;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const dateCount = isMobile ? 2 : 3;
    const maxIndex = availableDates.length - dateCount;
    
    if (newIndex >= 0 && newIndex <= maxIndex) {
      setCurrentDateIndex(newIndex);
      // Auto-select first visible date after navigation
      const firstVisibleDate = availableDates[newIndex];
      if (firstVisibleDate && firstVisibleDate.dateString) {
        onDateSelect(firstVisibleDate);
      }
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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

  return (
    <div className="service-selection-container">
      <div className="text-center mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-3">Select Date & Time</h2>
        <p className="hidden sm:block text-sm sm:text-lg font-medium">Choose your preferred appointment slot</p>
      </div>

      {/* MST timezone indicator */}
      <div className="hidden sm:block text-center mb-4">
        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          TIME ZONE: MOUNTAIN TIME - EDMONTON (GMT-06:00)
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Date Slider - Only show when slots are loaded */}
        {workingSlotsLoaded && availableDates.length > 0 ? (
          <Card className="bg-white rounded-xl border-0 sm:border border-gray-200 p-0 sm:p-6 shadow-none sm:shadow-sm smooth-transition">
            <div className="flex items-center mb-4 sm:mb-4 px-4 sm:px-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate(-1)}
                disabled={currentDateIndex <= 0}
                className="p-1 sm:p-2 smooth-transition flex-shrink-0"
              >
                <ChevronLeft className="text-lg sm:text-xl" />
              </Button>
              
              {/* Show 2 dates on mobile, 3 on larger screens - use full width */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mx-2 sm:mx-4 stagger-animation">
                {visibleDates.map((dateInfo) => (
                  <div
                    key={dateInfo.dateString}
                    onClick={() => {
                      onDateSelect(dateInfo);
                      onTimeSlotClear(""); // Clear current time slot without moving step
                      onDateChange(dateInfo.dateString); // Trigger slot refresh
                    }}
                    className={cn(
                      "date-card smooth-transition p-2 sm:p-4",
                      selectedDate?.dateString === dateInfo.dateString && "selected"
                    )}
                  >
                    <div className="hidden sm:block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{dateInfo.label}</div>
                    <div className="font-bold text-sm sm:text-lg text-black">
                      {dateInfo.dayName}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {dateInfo.dateDisplay}
                    </div>
                  </div>
                ))}
              </div>
             
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate(1)}
                disabled={currentDateIndex >= availableDates.length - (typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 3)}
                className="p-1 sm:p-2 smooth-transition flex-shrink-0"
              >
                <ChevronRight className="text-lg sm:text-xl" />
              </Button>
               {/* Mini month calendar toggle */}
               <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowMonthPicker(v => !v);
                  // Trigger extended slots loading when calendar is opened
                  if (!showMonthPicker && onCalendarOpen) {
                    onCalendarOpen();
                  }
                }}
                className="p-2 sm:p-3 smooth-transition flex-shrink-0 bg-[#391709] ml-2 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                aria-label="Open calendar"
              >
                <CalendarDays className="text-2xl sm:text-3xl" />
              </Button>
            </div>

            {/* Month picker panel */}
            {showMonthPicker && (
              <div className="px-4 sm:px-0 pb-4">
                <Card className="p-3 sm:p-4 rounded-xl border border-gray-200 bg-white">
                  {/* Loading indicator for extended slots */}
                  {!extendedSlotsLoaded && (
                    <div className="text-center text-xs text-gray-500 mb-2 py-1 bg-yellow-50 rounded">
                      Loading more dates...
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <Button variant="ghost" size="sm" onClick={() => goMonth(-1)} className="p-1"><ChevronLeft /></Button>
                    <div className="text-sm sm:text-base font-semibold">
                      {monthToShow.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goMonth(1)} className="p-1"><ChevronRight /></Button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-[11px] text-gray-500 mb-1">
                    {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                      <div key={d} className="text-center">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: startWeekday }).map((_, i) => (
                      <div key={`pad-${i}`} className="h-8 sm:h-9" />
                    ))}
                    {Array.from({ length: totalDays }).map((_, dayIdx) => {
                      const day = dayIdx + 1;
                      const y = monthToShow.getFullYear();
                      const m = String(monthToShow.getMonth() + 1).padStart(2, '0');
                      const d = String(day).padStart(2, '0');
                      const iso = `${y}-${m}-${d}`;
                      const isAvailable = availableSet.has(iso);
                      const isSelected = selectedDate?.dateString === iso;
                      return (
                        <button
                          key={iso}
                          disabled={!isAvailable}
                          onClick={() => {
                            const match = datesForCalendar.find(x => x.dateString === iso);
                            if (match) {
                              onDateSelect(match);
                              onTimeSlotClear("");
                              onDateChange(match.dateString);
                              setShowMonthPicker(false);
                            }
                          }}
                          className={cn(
                            "h-8 sm:h-9 text-[12px] rounded-md transition-colors",
                            isAvailable ? "bg-gray-100 hover:bg-gray-200 text-black" : "bg-gray-50 text-gray-300 cursor-not-allowed",
                            isSelected && "!bg-orange-100 !text-black !font-semibold"
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
          </Card>
        ) : (
          /* Simple loading state for dates */
          <Card className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2">
                <div className="loading-spinner" />
                <div className="text-gray-500 text-sm font-medium">Loading available dates...</div>
              </div>
            </div>
          </Card>
        )}
        
        {/* Time slots section */}
        <div className="space-y-4">
          <Card className="bg-white rounded-xl border border-gray-200 p-0 pt-2 px-2 pb-2 sm:p-6 shadow-sm smooth-transition">
            {/* Show slots immediately if available */}
            {timeSlots.length > 0 ? (
              <div className="space-y-4 fade-in px-4 sm:px-0">
                <div className="hidden sm:flex items-center justify-center mb-4">
                  <div className="text-sm text-gray-600 font-medium">
                    Available time slots for {selectedDate?.dayName}
                  </div>
                </div>
                <div className="grid sm:grid-cols-4 sm:gap-4 grid-cols-3 gap-2 pr-2 stagger-animation">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      className={cn(
                        "time-slot-button smooth-transition text-[12px] sm:text-[10px] py-2 sm:py-1.5 whitespace-nowrap leading-none",
                        selectedTimeSlot === slot.time && "selected"
                      )}
                      onClick={() => {
                        onTimeSlotSelect(slot.time);
                        // Direct move to next step
                        onSubmit();
                      }}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            ) : loadingSlots || !workingSlotsLoaded ? (
              /* Simple loading state while fetching slots */
              <div className="px-4 sm:px-0 py-8 text-center">
                <div className="inline-flex items-center gap-2">
                  <div className="loading-spinner" />
                  <div className="text-sm text-gray-600 font-medium">Loading available slots...</div>
                </div>
              </div>
            ) : selectedDate && workingSlotsLoaded && timeSlots.length === 0 ? (
              /* Show message only after slots are loaded and confirmed empty */
              <div className="text-center py-8 fade-in px-4 sm:px-0">
                <div className="text-gray-500 text-lg font-medium">No available slots for this date</div>
                <div className="text-sm text-gray-400 mt-2">Please select another date</div>
              </div>
            ) : !selectedDate ? (
              /* Show message when no date is selected */
              <div className="text-center py-8 fade-in px-4 sm:px-0">
                <div className="text-gray-500 text-lg font-medium">Please select a date to view available time slots</div>
                <div className="text-sm text-gray-400 mt-2">Choose from the dates above</div>
              </div>
            ) : null}
          </Card>
          
          {selectedTimeSlot && (
            <div className="hidden sm:block">
              <Card className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="text-center">
                  <div className="font-bold text-black text-lg">Selected Time</div>
                  <div className="text-orange-primary font-semibold">{selectedTimeSlot} MST</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedDate ? formatDateForDisplay(selectedDate.dateString) : ''}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      
      {/* Navigation */}
      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          style={{ borderColor: navSecondaryBorder, color: navSecondaryText }}
          onClick={onPrevious}
        >
          <ArrowLeft className="mr-2" />
          Previous
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={!selectedTimeSlot}
          className="flex-1"
          style={{ backgroundColor: navPrimaryBg || '#D97639', color: navPrimaryText || '#fff' }}
          onClick={onSubmit}
        >
          Continue
          <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
