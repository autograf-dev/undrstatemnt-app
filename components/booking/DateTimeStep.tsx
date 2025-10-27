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
  Calendar,
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
  workingSlotsLoaded: boolean;
  loadingSlots: boolean;
  onSubmit: () => void;
  onPrevious: () => void;
  selectedService?: Service;
  getServiceDuration: (serviceId: string) => number;
  formatDurationMins: (mins: number) => string;
}

export function DateTimeStep({
  availableDates,
  selectedDate,
  onDateSelect,
  timeSlots,
  selectedTimeSlot,
  onTimeSlotSelect,
  workingSlotsLoaded,
  loadingSlots,
  onSubmit,
  onPrevious,
  selectedService,
  getServiceDuration,
  formatDurationMins
}: DateTimeStepProps) {
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black mb-2">Select Date & Time</h2>
        <p className="text-gray-700">Choose your preferred appointment slot</p>
      </div>

      {/* MST timezone indicator */}
      <div className="text-center mb-4">
        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          TIME ZONE: MOUNTAIN TIME - EDMONTON (GMT-06:00)
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Date Slider - Only show when slots are loaded */}
        {workingSlotsLoaded && availableDates.length > 0 ? (
          <Card className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate(-1)}
                disabled={currentDateIndex <= 0}
                className="p-2"
              >
                <ChevronLeft className="text-xl" />
              </Button>
              
              {/* Show 2 dates on mobile, 3 on larger screens */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:mx-4">
                {visibleDates.map((dateInfo) => (
                  <div
                    key={dateInfo.dateString}
                    onClick={() => onDateSelect(dateInfo)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 text-center cursor-pointer hover:shadow-md",
                      selectedDate?.dateString === dateInfo.dateString
                        ? "border-red-700 bg-red-50"
                        : "border-gray-200 bg-gray-50 hover:border-red-300"
                    )}
                  >
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {dateInfo.label}
                    </div>
                    <div className="font-bold text-lg text-black">
                      {dateInfo.dayName}
                    </div>
                    <div className="text-sm text-gray-600">
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
                className="p-2"
              >
                <ChevronRight className="text-xl" />
              </Button>
            </div>
          </Card>
        ) : (
          /* Loading state for dates */
          <Card className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-4">Loading available dates...</div>
              <div className="flex justify-center space-x-4">
                <Skeleton className="h-20 w-24 rounded-lg bg-gray-100" />
                <Skeleton className="h-20 w-24 rounded-lg bg-gray-100" />
                <Skeleton className="h-20 w-24 rounded-lg bg-gray-100" />
              </div>
            </div>
          </Card>
        )}
        
        {/* Time slots section */}
        <div className="space-y-4">
          <Card className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[400px]">
            {/* Show slots immediately if available */}
            {timeSlots.length > 0 ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-4 sm:gap-4 grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "py-3 transition-all duration-200 text-black border border-gray-300 rounded-lg justify-center hover:shadow-sm",
                        selectedTimeSlot === slot.time 
                          ? "bg-red-700 hover:bg-red-700 text-white border-red-700 shadow-sm" 
                          : "hover:border-red-300"
                      )}
                      onClick={() => onTimeSlotSelect(slot.time)}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            ) : loadingSlots || !workingSlotsLoaded ? (
              /* Show skeleton loading while fetching slots */
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-3">
                  Loading available slots...
                </div>
                <div className="grid sm:grid-cols-4 sm:gap-4 grid-cols-2 gap-3">
                  <Skeleton className="h-12 rounded-lg bg-gray-100" />
                  <Skeleton className="h-12 rounded-lg bg-gray-100" />
                  <Skeleton className="h-12 rounded-lg bg-gray-100" />
                  <Skeleton className="h-12 rounded-lg bg-gray-100" />
                  <Skeleton className="h-12 rounded-lg bg-gray-100" />
                  <Skeleton className="h-12 rounded-lg bg-gray-100" />
                  <Skeleton className="h-12 rounded-lg bg-gray-100" />
                  <Skeleton className="h-12 rounded-lg bg-gray-100" />
                </div>
              </div>
            ) : selectedDate && workingSlotsLoaded && timeSlots.length === 0 ? (
              /* Show message only after slots are loaded and confirmed empty */
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg">No available slots for this date</div>
                <div className="text-sm text-gray-400 mt-2">Please select another date</div>
              </div>
            ) : null}
          </Card>
          
          {selectedTimeSlot && (
            <Card className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="text-center">
                <div className="font-bold text-black text-lg">Selected Time</div>
                <div className="text-red-700 font-semibold">{selectedTimeSlot} MST</div>
                <div className="text-sm text-gray-600 mt-1">
                  {selectedDate ? formatDateForDisplay(selectedDate.dateString) : ''}
                </div>
              </div>
            </Card>
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
          onClick={onPrevious}
        >
          <ArrowLeft className="mr-2" />
          Previous
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={!selectedTimeSlot}
          className="flex-1 bg-red-700 hover:bg-red-700 text-white"
          onClick={onSubmit}
        >
          Continue
          <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
