"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  Plus,
  CheckCircle
} from "lucide-react";
import { Staff, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StaffSelectionStepProps {
  staff: Staff[];
  selectedStaff: string;
  onStaffSelect: (id: string) => void;
  loadingStaff: boolean;
  guestCount: number;
  onGuestCountChange: (count: number) => void;
  showGuestInput: boolean;
  onShowGuestInputChange: (show: boolean) => void;
  selectedService?: Service;
  selectedStaffObj?: Staff;
  onSubmit: () => void;
  onPrevious: () => void;
  getServiceDuration: (serviceId: string) => number;
  formatDurationMins: (mins: number) => string;
}

export function StaffSelectionStep({
  staff,
  selectedStaff,
  onStaffSelect,
  loadingStaff,
  guestCount,
  onGuestCountChange,
  showGuestInput,
  onShowGuestInputChange,
  selectedService,
  selectedStaffObj,
  onSubmit,
  onPrevious,
  getServiceDuration,
  formatDurationMins
}: StaffSelectionStepProps) {
  const resetGuestInput = () => {
    onGuestCountChange(1);
    onShowGuestInputChange(false);
  };

  return (
    <div className="service-selection-container">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-3">Choose Your Stylist</h2>
        <p className="text-sm sm:text-lg font-medium">Select your preferred stylist or let us choose the best available</p>
      </div>

      {/* Summary cards: Service | Guests | Staff */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mb-6">
        {/* Service Card */}
        <Card className="text-center p-2 sm:p-3 bg-white rounded-xl border border-gray-200">
          <div className="font-bold text-sm sm:text-lg mb-1 text-black">Service</div>
          <div className="text-xs sm:text-base text-gray-700">{selectedService?.name}</div>
          <div className="text-xs sm:text-sm text-orange-primary font-semibold mt-1">
            Duration: {formatDurationMins(getServiceDuration(selectedService?.id || ""))}
          </div>
        </Card>
        
        {/* Guests Card with Add Guest logic */}
        <Card className="text-center p-2 sm:p-3 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center">
          <div className="font-bold text-sm sm:text-lg mb-1 text-black">Guests</div>
          {!showGuestInput ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <User className="text-lg sm:text-2xl text-orange-primary" />
                <span className="font-bold text-lg sm:text-xl text-black">{guestCount}</span>
              </div>
              <Button
                size="sm"
                className="bg-orange-primary hover:bg-orange-primary text-white mt-1 sm:mt-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                onClick={() => onShowGuestInputChange(true)}
              >
                <Plus className="mr-1" /> Add Guest
              </Button>
            </div>
          ) : (
            <div className="w-full">
              <label className="block font-semibold mb-2 text-black text-sm">Select Number of Guests</label>
              <div className="flex justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
                    disabled={guestCount <= 1}
                    className="text-orange-primary border-orange-300 hover:bg-orange-50"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-semibold text-black">{guestCount}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGuestCountChange(Math.min(10, guestCount + 1))}
                    disabled={guestCount >= 10}
                    className="text-orange-primary border-orange-300 hover:bg-orange-50"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="text-center text-xs font-medium text-black bg-orange-50 rounded-lg p-2 border border-orange-200 mt-2">
                You{guestCount > 1 ? ` and ${guestCount - 1} guest${guestCount > 2 ? 's' : ''}` : ''}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 border border-orange-300 w-full text-center justify-center p-[6px] text-orange-primary hover:bg-orange-50"
                onClick={resetGuestInput}
              >
                Cancel
              </Button>
            </div>
          )}
        </Card>
        
        {/* Staff Card - Hidden on mobile */}
        <Card className="!hidden md:!block text-center p-2 sm:p-3 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center">
          <div className="font-bold text-sm sm:text-lg mb-1 text-black">Stylist</div>
          <div className="text-xs sm:text-base text-orange-primary font-semibold text-center">{selectedStaffObj?.name || 'Any available'}</div>
        </Card>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        {loadingStaff ? (
          <div className="space-y-4 stagger-animation">
            <div className="service-skeleton">
              <div className="flex items-center gap-3.5 w-full">
                <div className="skeleton-icon"></div>
                <div className="flex-1">
                  <div className="skeleton-text medium"></div>
                  <div className="skeleton-text short"></div>
                </div>
              </div>
            </div>
            <div className="service-skeleton">
              <div className="flex items-center gap-3.5 w-full">
                <div className="skeleton-icon"></div>
                <div className="flex-1">
                  <div className="skeleton-text medium"></div>
                  <div className="skeleton-text short"></div>
                </div>
              </div>
            </div>
            <div className="service-skeleton">
              <div className="flex items-center gap-3.5 w-full">
                <div className="skeleton-icon"></div>
                <div className="flex-1">
                  <div className="skeleton-text medium"></div>
                  <div className="skeleton-text short"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 stagger-animation">
            {staff.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onStaffSelect(item.id);
                }}
                className={cn(
                  "staff-card smooth-transition flex items-center justify-between",
                  selectedStaff === item.id && "selected"
                )}
              >
                <div className="flex items-center gap-3.5 w-full">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    selectedStaff === item.id 
                      ? "bg-white text-orange-primary" 
                      : "bg-orange-100 text-orange-primary"
                  )}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className={cn(
                      "text-sm font-semibold",
                      selectedStaff === item.id ? "text-white" : "text-orange-primary"
                    )}>{item.name}</span>
                    {item.badge && (
                      <span className={cn(
                        "ml-3 px-3 py-1 rounded-full text-xs font-medium",
                        selectedStaff === item.id ? "bg-white text-orange-primary" : "bg-orange-primary text-white"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
                {selectedStaff === item.id && (
                  <div className="text-white">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        
        <div className="flex gap-4">
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
            type="submit"
            size="lg"
            disabled={!selectedStaff || loadingStaff}
            className="flex-1 bg-orange-primary hover:bg-orange-primary text-white"
          >
            Continue
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
