"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { User, CheckCircle } from "lucide-react";
import { Staff } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface StaffListWidgetProps {
  className?: string;
  style?: CSSProperties;
  /** Service id whose team members to show; required */
  serviceId: string;
  /** Include an "Any available" synthetic option */
  includeAnyOption?: boolean;
  /** Preselect a staff id */
  initialSelectedStaffId?: string;
  /** Called when a staff member is selected */
  onStaffSelect?: (staffId: string) => void;
}

export default function StaffListWidget({
  className,
  style,
  serviceId,
  includeAnyOption = true,
  initialSelectedStaffId,
  onStaffSelect,
}: StaffListWidgetProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>(initialSelectedStaffId || "");

  useEffect(() => {
    if (!serviceId) {
      setStaff([]);
      return;
    }
    const loadStaff = async () => {
      setLoading(true);
      setSelectedStaff(initialSelectedStaffId || "");
      try {
        const base = 'https://modify.undrstatemnt.com/.netlify/functions/Services';
        const res = await fetch(base);
        const data = await res.json();
        const serviceList = (Array.isArray(data.services) && data.services.length > 0) ? data.services : (data.calendars || []);
        const serviceObj = serviceList.find((s: any) => s.id === serviceId);
        const teamMembers = serviceObj?.teamMembers || [];

        const items: Staff[] = includeAnyOption ? [{ id: 'any', name: 'Any available staff', badge: 'Recommended', icon: 'user' }] : [];

        const staffPromises = teamMembers.map(async (member: any) => {
          try {
            const staffRes = await fetch(`https://modify.undrstatemnt.com/.netlify/functions/Staff?id=${member.userId}`);
            const staffData = await staffRes.json();

            const derivedName =
              staffData?.data?.name ||
              staffData?.name ||
              staffData?.fullName ||
              staffData?.displayName ||
              [staffData?.staff?.firstName, staffData?.staff?.lastName].filter(Boolean).join(' ') ||
              [staffData?.users?.firstName, staffData?.users?.lastName].filter(Boolean).join(' ') ||
              [staffData?.firstName, staffData?.lastName].filter(Boolean).join(' ') ||
              staffData?.user?.name ||
              'Staff';

            return { id: member.userId || staffData?.id, name: derivedName, icon: 'user' } as Staff;
          } catch (e) {
            console.error('StaffListWidget member fetch error', member.userId, e);
            return null;
          }
        });

        const staffResults = await Promise.all(staffPromises);
        const valid = staffResults.filter(Boolean) as Staff[];
        setStaff([...items, ...valid]);
      } catch (e) {
        console.error('StaffListWidget load error', e);
        setStaff(includeAnyOption ? [{ id: 'any', name: 'Any available staff', badge: 'Recommended', icon: 'user' }] : []);
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, [serviceId, includeAnyOption, initialSelectedStaffId]);

  const handleSelect = (id: string) => {
    setSelectedStaff(id);
    onStaffSelect?.(id);
  };

  return (
    <div className={cn("w-full", className)} style={style}>
      {loading ? (
        <div className="space-y-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {staff.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={cn(
                "staff-card smooth-transition flex items-center justify-between",
                selectedStaff === item.id && "selected"
              )}
            >
              <div className="flex items-center gap-3.5 w-full">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  selectedStaff === item.id ? "bg-white text-orange-primary" : "bg-orange-100 text-orange-primary"
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
    </div>
  );
}


