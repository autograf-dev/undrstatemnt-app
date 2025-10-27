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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black mb-2">Choose Your Stylist</h2>
        <p className="text-gray-700">Select your preferred stylist or let us choose the best available</p>
      </div>

      {/* Summary cards: Service | Guests | Staff */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
        {/* Service Card */}
        <Card className="text-center p-4 bg-white rounded-xl border border-gray-200">
          <div className="font-bold text-lg mb-1 text-black">Service</div>
          <div className="text-gray-700">{selectedService?.name}</div>
          <div className="text-sm text-red-700 font-semibold mt-1">
            Duration: {formatDurationMins(getServiceDuration(selectedService?.id || ""))}
          </div>
        </Card>
        
        {/* Guests Card with Add Guest logic */}
        <Card className="text-center p-4 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center">
          <div className="font-bold text-lg mb-1 text-black">Guests</div>
          {!showGuestInput ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <User className="text-2xl text-red-700" />
                <span className="font-bold text-xl text-black">1</span>
              </div>
              <Button
                size="sm"
                className="bg-red-700 hover:bg-red-700 text-white mt-2"
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
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-semibold">{guestCount}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGuestCountChange(Math.min(10, guestCount + 1))}
                    disabled={guestCount >= 10}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="text-center text-xs font-medium text-black bg-white rounded-lg p-2 border border-gray-200 mt-2">
                You{guestCount > 1 ? ` and ${guestCount - 1} guest${guestCount > 2 ? 's' : ''}` : ''}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 border border-gray-200 w-full text-center justify-center p-[6px] text-white bg-[#751a29] cursor-pointer"
                onClick={resetGuestInput}
              >
                Cancel
              </Button>
            </div>
          )}
        </Card>
        
        {/* Staff Card - Hidden on mobile */}
        <Card className="hidden md:block text-center p-4 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center">
          <div className="font-bold text-lg mb-1 text-black">Stylist</div>
          <div className="text-red-700 font-semibold text-center">{selectedStaffObj?.name || 'Any available'}</div>
        </Card>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        {loadingStaff ? (
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-xl bg-gray-100" />
            <Skeleton className="h-20 rounded-xl bg-gray-100" />
            <Skeleton className="h-20 rounded-xl bg-gray-100" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {staff.map((item) => (
              <div
                key={item.id}
                onClick={() => onStaffSelect(item.id)}
                className={cn(
                  "cursor-pointer p-4 border-2 rounded-2xl flex items-center justify-between transition-all duration-200 hover:shadow-sm",
                  selectedStaff === item.id
                    ? "bg-red-50 text-black border-red-700 shadow-sm"
                    : "bg-white text-black border-gray-200 hover:border-red-300"
                )}
              >
                <div className="flex items-center gap-3.5 w-full">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-[oklch(0.38_0.12_16.62)]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                    {item.badge && (
                      <span className={cn(
                        "ml-3 px-3 py-1 rounded-full text-xs font-medium",
                        selectedStaff === item.id ? "bg-red-100 text-red-700" : "bg-red-500 text-white"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
                {selectedStaff === item.id && (
                  <div className="text-red-700">
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
            className="flex-1 bg-red-700 hover:bg-red-700 text-white"
          >
            Continue
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
