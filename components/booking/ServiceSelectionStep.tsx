"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  const formatDurationMins = (mins: number): string => {
    const m = Number(mins || 0);
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h > 0) return r > 0 ? `${h}h ${r}m` : `${h}h`;
    return `${r}m`;
  };

  return (
    <div className="service-selection-container">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Select Your Service</h2>
        <p className="text-lg font-medium">Choose a group and a specific service you'd like to book</p>
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
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-black mb-2">Step 1: Choose Your Service Category</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {departments.map((item) => {
                  const IconComponent = getIcon(item.icon || 'user');
                  return (
                    <div
                      key={item.id}
                      onClick={() => onDepartmentSelect(item.id)}
                      className={cn(
                        "group-button cursor-pointer flex flex-col items-center justify-center transition-all duration-200 hover:shadow-sm p-3 rounded-xl border-2",
                        selectedDepartment === item.id && "selected"
                      )}
                    >
                      <IconComponent className={cn(
                        "w-5 h-5 mb-1",
                        selectedDepartment === item.id ? "text-white" : "text-orange-primary"
                      )} />
                      <span className={cn(
                        "text-xs font-medium text-center",
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
              <div className="flex items-center justify-between mb-6">
                {!cameFromUrlParam && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onGoBack}
                    className="p-2"
                  >
                    <ArrowLeft className="text-xl" />
                  </Button>
                )}
                {!cameFromUrlParam && <div className="w-10"></div>}
                <div className="text-center">
                  <p className="text-lg font-semibold text-dark">
                    {departments.find(d => d.id === selectedDepartment)?.name} Services
                  </p>
                </div>
                <div className="w-10"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Services list for selected group */}
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 stagger-animation">
                {services.map((item) => (
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
            )}
          </div>
        )}


        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={true}
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
