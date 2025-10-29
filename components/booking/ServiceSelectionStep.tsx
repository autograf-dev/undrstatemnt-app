"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { 
  Scissors, 
  Heart, 
  User, 
  Zap, 
  Droplet, 
  Crown, 
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Clock,
  Users,
  CheckCircle
} from "lucide-react";
import { Department, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ServiceSelectionStepProps {
  departments: Department[];
  selectedDepartment: string;
  onDepartmentSelect: (id: string) => void;
  services: Service[];
  selectedService: string;
  onServiceSelect: (id: string) => void;
  loadingGroups: boolean;
  loadingServices: boolean;
  onSubmit: () => void;
  cameFromUrlParam: boolean;
  onGoBack: () => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'heart': return Heart;
    case 'user': return User;
    case 'zap': return Zap;
    case 'droplet': return Droplet;
    case 'scissors': return Scissors;
    case 'crown': return Crown;
    case 'sparkles': return Sparkles;
    default: return User;
  }
};

export function ServiceSelectionStep({
  departments,
  selectedDepartment,
  onDepartmentSelect,
  services,
  selectedService,
  onServiceSelect,
  loadingGroups,
  loadingServices,
  onSubmit,
  cameFromUrlParam,
  onGoBack
}: ServiceSelectionStepProps) {
  // Dedupe services by id to avoid React key collisions if callers accidentally pass duplicates
  const uniqueServices = React.useMemo(() => {
    const map = new Map<string, Service>();
    for (const s of services) map.set(s.id, s);
    return Array.from(map.values());
  }, [services]);
  const formatDurationMins = (mins: number): string => {
    const m = Number(mins || 0);
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h > 0) return r > 0 ? `${h}h ${r}m` : `${h}h`;
    return `${r}m`;
  };

  return (
    <div className="service-selection-container">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-3 whitespace-nowrap">Select Your Service</h2>
        <p className="text-sm sm:text-lg font-medium">Choose a group and a specific service you'd like to book</p>
      </div>
      
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        {/* Group selection */}
        <div className="mb-8">
          {/* Desktop: horizontal scroll */}
          <div className="hidden sm:flex gap-2 overflow-x-visible whitespace-nowrap justify-center">
            {departments.map((item) => {
              const IconComponent = getIcon(item.icon || 'user');
              return (
                <div
                  key={item.id}
                  onClick={() => onDepartmentSelect(item.id)}
                  className={cn(
                    "group-button cursor-pointer transition-all duration-200 hover:shadow-sm",
                    selectedDepartment === item.id && "selected"
                  )}
                >
                  <IconComponent className={cn(
                    "w-4 h-4",
                    selectedDepartment === item.id ? "text-white" : "text-orange-primary"
                  )} />
                  <span className={cn(
                    "text-xs font-medium",
                    selectedDepartment === item.id ? "text-white" : "text-orange-primary"
                  )}>
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Mobile: Step 1 - Group Selection */}
          {!selectedDepartment && (
            <div className="sm:hidden">
              <div className="text-center mb-4 hidden">
                <h3 className="text-base font-semibold text-black mb-1 whitespace-nowrap">Step 1: Choose Your Service Category</h3>
                <p className="text-sm text-gray-600">Select a category to see available services</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {departments.map((item) => {
                  const IconComponent = getIcon(item.icon || 'user');
                  return (
                    <div
                      key={item.id}
                      onClick={() => onDepartmentSelect(item.id)}
                      className={cn(
                        "group-button cursor-pointer flex flex-col items-center justify-center transition-all duration-200 hover:shadow-sm p-2 rounded-lg border-2",
                        selectedDepartment === item.id && "selected"
                      )}
                    >
                      <IconComponent className={cn(
                        "w-4 h-4 mb-1",
                        selectedDepartment === item.id ? "text-white" : "text-orange-primary"
                      )} />
                      <span className={cn(
                        "text-xs font-medium text-center leading-tight",
                        selectedDepartment === item.id ? "text-white" : "text-orange-primary"
                      )}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Mobile: Step 2 - Service Selection (shown after group is selected) */}
          {selectedDepartment && (
            <div className="sm:hidden">
              <div className="mb-4">
                <div className="text-center sm:block hidden">
                  <h3 className="text-base font-semibold text-black mb-1 whitespace-nowrap">Step 2: Choose Your Service</h3>
                  <p className="text-sm text-gray-600">
                    {departments.find(d => d.id === selectedDepartment)?.name} Services
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Services list for selected group (or 'all') */}
        {selectedDepartment && (
          <div>
            {loadingServices ? (
              <div className="space-y-2 mb-6 stagger-animation">
                <div className="service-skeleton">
                  <div className="flex items-center gap-3.5 w-full">
                    <div className="skeleton-icon"></div>
                    <div className="flex-1">
                      <div className="skeleton-text medium"></div>
                      <div className="flex items-center gap-4 flex-wrap mt-1.5">
                        <div className="skeleton-text short"></div>
                        <div className="skeleton-text short"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="service-skeleton">
                  <div className="flex items-center gap-3.5 w-full">
                    <div className="skeleton-icon"></div>
                    <div className="flex-1">
                      <div className="skeleton-text medium"></div>
                      <div className="flex items-center gap-4 flex-wrap mt-1.5">
                        <div className="skeleton-text short"></div>
                        <div className="skeleton-text short"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="service-skeleton">
                  <div className="flex items-center gap-3.5 w-full">
                    <div className="skeleton-icon"></div>
                    <div className="flex-1">
                      <div className="skeleton-text medium"></div>
                      <div className="flex items-center gap-4 flex-wrap mt-1.5">
                        <div className="skeleton-text short"></div>
                        <div className="skeleton-text short"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg font-medium">No services available</div>
                <div className="text-sm text-gray-400 mt-2">Please try again later.</div>
              </div>
            ) : (
              <>
                {/* Desktop: 3-column grid */}
                <div className="hidden sm:block">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 stagger-animation">
                {uniqueServices.map((item) => (
                  <div
                    key={item.id}
                        onClick={() => {
                          onServiceSelect(item.id);
                        }}
                    className={cn(
                      "service-card smooth-transition flex items-center justify-between",
                      selectedService === item.id && "selected"
                    )}
                  >
                    <div className="flex items-center gap-3.5 w-full">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        selectedService === item.id 
                          ? "bg-white text-orange-primary" 
                          : "bg-orange-100 text-orange-primary"
                      )}>
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className={cn(
                          "text-sm font-semibold",
                          selectedService === item.id ? "text-white" : "text-orange-primary"
                        )}>{item.name}</div>
                        <div className="mt-1 flex items-center gap-3 flex-wrap">
                          <span className={cn(
                            "inline-flex items-center gap-1 text-xs",
                            selectedService === item.id ? "text-white" : "text-orange-primary"
                          )}>
                            <Clock className={cn(
                              "w-3.5 h-3.5",
                              selectedService === item.id ? "text-white" : "text-orange-primary"
                            )} />
                            {formatDurationMins(item.durationMinutes)}
                          </span>
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[11px]",
                            selectedService === item.id ? "text-white" : "text-orange-primary"
                          )}>
                            <Users className={cn(
                              "w-3.5 h-3.5",
                              selectedService === item.id ? "text-white" : "text-orange-primary"
                            )} />
                            {item.teamMembers?.length ?? 0} staff available
                          </span>
                        </div>
                      </div>
                      {selectedService === item.id && (
                        <div className="text-white">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                  </div>
                </div>

                {/* Mobile: Single column grid with lesser height */}

                {/* Mobile: Single column grid with lesser height */}
                <div className="sm:hidden grid grid-cols-1 gap-2 mb-4 stagger-animation">
                  {uniqueServices.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onServiceSelect(item.id);
                      }}
                      className={cn(
                        "service-card smooth-transition flex items-center justify-between p-2 rounded-lg border-2 relative",
                        selectedService === item.id && "selected"
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          selectedService === item.id 
                            ? "bg-white text-orange-primary" 
                            : "bg-orange-100 text-orange-primary"
                        )}>
                          <Scissors className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className={cn(
                            "text-sm font-semibold",
                            selectedService === item.id ? "text-white" : "text-orange-primary"
                          )}>{item.name}</div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <div className={cn(
                              "inline-flex items-center gap-1 text-xs",
                              selectedService === item.id ? "text-white" : "text-orange-primary"
                            )}>
                              <Clock className={cn(
                                "w-3 h-3",
                                selectedService === item.id ? "text-white" : "text-orange-primary"
                              )} />
                              {formatDurationMins(item.durationMinutes)}
                            </div>
                            <div className={cn(
                              "inline-flex items-center gap-1 text-xs",
                              selectedService === item.id ? "text-white" : "text-orange-primary"
                            )}>
                              <Users className={cn(
                                "w-3 h-3",
                                selectedService === item.id ? "text-white" : "text-orange-primary"
                              )} />
                              {item.teamMembers?.length ?? 0} staff
                            </div>
                          </div>
                        </div>
                        {selectedService === item.id && (
                          <div className="text-white">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}


        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => {
              // On mobile, if department is selected, go back to groups
              if (selectedDepartment) {
                onDepartmentSelect("");
              } else {
                // On desktop or when no department selected, use original behavior
                onGoBack();
              }
            }}
            disabled={false}
          >
            <ArrowLeft className="mr-2" />
            Previous
          </Button>
              <Button
                type="submit"
                size="lg"
                disabled={!selectedService || loadingGroups}
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
