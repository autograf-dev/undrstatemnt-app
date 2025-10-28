"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Scissors, Users, Clock, CheckCircle } from "lucide-react";
import { Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ServiceListWidgetProps {
  className?: string;
  style?: CSSProperties;
  /** Department/group id to filter services. Use "all" or empty to show all */
  departmentId?: string;
  /** Preselect a service id */
  initialSelectedServiceId?: string;
  /** Show duration and staff count badges */
  showMeta?: boolean;
  /** Called when a service is selected */
  onServiceSelect?: (serviceId: string) => void;
}

export default function ServiceListWidget({
  className,
  style,
  departmentId = "all",
  initialSelectedServiceId,
  showMeta = true,
  onServiceSelect,
}: ServiceListWidgetProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string>(initialSelectedServiceId || "");

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const start = Date.now();
        const base = "https://modify.undrstatemnt.com/.netlify/functions/Services";
        const url = departmentId && departmentId !== "all" ? `${base}?id=${departmentId}` : base;
        const res = await fetch(url);
        const data = await res.json();
        const rawServices = Array.isArray(data.services) && data.services.length > 0 ? data.services : (data.calendars || []);
        const mapped: Service[] = rawServices.map((service: any) => {
          const raw = Number(service.slotDuration ?? service.duration ?? 0);
          const unit = String(service.slotDurationUnit ?? service.durationUnit ?? '').toLowerCase();
          const minutes = raw > 0 ? (unit === 'hours' || unit === 'hour' ? raw * 60 : raw) : 0;
          return {
            id: service.id,
            name: service.name,
            description: service.description,
            durationMinutes: minutes,
            teamMembers: service.teamMembers || [],
          };
        });
        setServices(mapped);

        const elapsed = Date.now() - start;
        const remaining = 300 - elapsed;
        if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      } catch (e) {
        console.error("ServiceListWidget load error", e);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, [departmentId]);

  const formatDurationMins = (mins: number): string => {
    const m = Number(mins || 0);
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h > 0) return r > 0 ? `${h}h ${r}m` : `${h}h`;
    return `${r}m`;
  };

  const handleSelect = (id: string) => {
    setSelectedService(id);
    onServiceSelect?.(id);
  };

  return (
    <div className={cn("w-full", className)} style={style}>
      {loading ? (
        <div className="space-y-2 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={cn(
                "service-card smooth-transition flex items-center justify-between",
                selectedService === item.id && "selected"
              )}
            >
              <div className="flex items-center gap-3.5 w-full">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  selectedService === item.id ? "bg-white text-orange-primary" : "bg-orange-100 text-orange-primary"
                )}>
                  <Scissors className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className={cn(
                    "text-sm font-semibold",
                    selectedService === item.id ? "text-white" : "text-orange-primary"
                  )}>{item.name}</div>
                  {showMeta && (
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
                  )}
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
  );
}


