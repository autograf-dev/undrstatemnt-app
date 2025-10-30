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
import Image from "next/image";

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
  // Styling from Plasmic
  staffNameColor?: string;
  serviceDurationColor?: string;
  navPrimaryBg?: string;
  navPrimaryText?: string;
  navSecondaryBorder?: string;
  navSecondaryText?: string;
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
  formatDurationMins,
  staffNameColor,
  serviceDurationColor,
  navPrimaryBg,
  navPrimaryText,
  navSecondaryBorder,
  navSecondaryText
}: StaffSelectionStepProps) {
  const resetGuestInput = () => {
    onGuestCountChange(1);
    onShowGuestInputChange(false);
  };

  return (
    <div className="service-selection-container">
      <div className="text-center mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-3">Choose Your Stylist</h2>
        <p className="hidden sm:block text-sm sm:text-lg font-medium">Select your preferred stylist or let us choose the best available</p>
      </div>

      {/* Summary cards: Service | Guests */}
      {/* Mobile: single compact card with two rows */}
      <div className="sm:hidden mb-3">
        <div className="rounded-xl border border-gray-200 bg-white p-2">
          <div className="flex items-center justify-between gap-2 text-[13px] font-semibold" style={{ color: staffNameColor || '#391709' }}>
            <div className="truncate">Service: <span className="font-normal text-gray-700">{selectedService?.name || '-'}</span></div>
            <div>Guests: <span className="font-normal text-gray-700">{guestCount}</span></div>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="text-[12px] font-semibold" style={{ color: serviceDurationColor || '#391709' }}>Duration: {formatDurationMins(getServiceDuration(selectedService?.id || ""))}</div>
            {!showGuestInput ? (
              <Button size="sm" className="h-7 px-3 py-1" style={{ backgroundColor: navPrimaryBg || '#391709', color: navPrimaryText || '#fff' }} onClick={() => onShowGuestInputChange(true)}>
                <Plus className="mr-1 w-3 h-3" /> Add Guest
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))} className="h-7 px-2">-</Button>
                <span className="w-6 text-center font-semibold">{guestCount}</span>
                <Button size="sm" variant="outline" onClick={() => onGuestCountChange(Math.min(10, guestCount + 1))} className="h-7 px-2">+</Button>
                <Button size="sm" variant="outline" className="h-7 px-2" onClick={resetGuestInput}>Done</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop/tablet: original three-card summary */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mb-6">
        {/* Service Card */}
        <Card className="text-center p-3 bg-white rounded-xl border border-gray-200">
          <div className="font-bold text-lg mb-1" style={{ color: staffNameColor || '#391709' }}>Service</div>
          <div className="text-base text-gray-700">{selectedService?.name}</div>
          <div className="text-sm font-semibold mt-1" style={{ color: serviceDurationColor || '#391709' }}>
            Duration: {formatDurationMins(getServiceDuration(selectedService?.id || ""))}
          </div>
        </Card>
        
        {/* Guests Card with Add Guest logic */}
        <Card className="text-center p-3 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center">
          <div className="font-bold text-lg mb-1 text-black">Guests</div>
          {!showGuestInput ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <User className="text-2xl text-orange-primary" />
                <span className="font-bold text-xl text-black">{guestCount}</span>
              </div>
              <Button size="sm" className="bg-orange-primary hover:bg-orange-primary text-white mt-2 px-3 py-2" onClick={() => onShowGuestInputChange(true)}>
                <Plus className="mr-1" /> Add Guest
              </Button>
            </div>
          ) : (
            <div className="w-full">
              <label className="block font-semibold mb-2 text-black">Select Number of Guests</label>
              <div className="flex justify-center">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))} disabled={guestCount <= 1} className="text-orange-primary border-orange-300 hover:bg-orange-50">-</Button>
                  <span className="w-8 text-center font-semibold text-black">{guestCount}</span>
                  <Button size="sm" variant="outline" onClick={() => onGuestCountChange(Math.min(10, guestCount + 1))} disabled={guestCount >= 10} className="text-orange-primary border-orange-300 hover:bg-orange-50">+</Button>
                </div>
              </div>
            </div>
          )}
        </Card>
        
        {/* Staff Card */}
        <Card className="hidden md:flex text-center p-3 bg-white rounded-xl border border-gray-200 flex-col items-center justify-center">
          <div className="font-bold text-lg mb-1 text-black">Stylist</div>
          <div className="text-base text-orange-primary font-semibold text-center">{selectedStaffObj?.name || 'Any available'}</div>
        </Card>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        {loadingStaff ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <div className="loading-spinner" />
              <div className="text-gray-500 text-sm font-medium">Loading staff...</div>
            </div>
          </div>
        ) : (
          <div className="mb-8 sm:mb-8 sm:max-h-none sm:overflow-visible max-h-[56vh] overflow-y-auto pr-1 stagger-animation grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-3">
            {staff.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onStaffSelect(item.id);
                }}
                className={cn(
                  "staff-card smooth-transition flex items-center justify-between p-2 sm:p-3",
                  selectedStaff === item.id && "selected"
                )}
              >
                <div className="flex items-center gap-2.5 sm:gap-3.5 w-full">
                  {/* Avatar hidden on mobile */}
                  {item.imageUrl ? (
                    <div className="hidden sm:block w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/60">
                      <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="object-cover w-10 h-10" unoptimized />
                    </div>
                  ) : (
                    <div className={cn(
                      "hidden sm:flex w-10 h-10 rounded-full items-center justify-center",
                      selectedStaff === item.id ? "bg-white" : ""
                    )}>
                      <User className="w-5 h-5" style={{ color: staffNameColor || '#391709' }} />
                    </div>
                  )}
                  <div className="flex-1">
                    <span className={cn(
                      "text-[12px] sm:text-sm font-semibold leading-snug line-clamp-2",
                      selectedStaff === item.id ? "text-white" : ""
                    )} style={{ color: selectedStaff === item.id ? undefined : (staffNameColor || '#B45309') }}>{item.name}</span>
                    {item.badge && (
                      <span className={cn(
                        "hidden sm:inline-block ml-2 sm:ml-3 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium",
                        selectedStaff === item.id ? "bg-white" : ""
                      )}>
                        <span style={{ color: selectedStaff === item.id ? (staffNameColor || '#391709') : '#fff', backgroundColor: selectedStaff === item.id ? undefined : (navPrimaryBg || '#391709'), padding: '0 6px', borderRadius: '9999px' }}>{item.badge}</span>
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
            style={{ borderColor: (navSecondaryBorder), color: navSecondaryText }}
          >
            <ArrowLeft className="mr-2" />
            Previous
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={!selectedStaff || loadingStaff}
            className="flex-1"
            style={{ backgroundColor: navPrimaryBg || '#D97639', color: navPrimaryText || '#fff' }}
          >
            Continue
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}

