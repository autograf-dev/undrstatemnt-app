"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface BookingContextType {
  preSelectedServiceId: string | null;
  preSelectedStaffId: string | null;
  preSelectedDuration: number | null;
  preSelectedPrice: number | null;
  preSelectedServiceName: string | null;
  preSelectedStaffName: string | null;
  initialStep: "service" | "staff" | "datetime" | "information" | "success";
  setPreSelectedService: (serviceId: string, startAtStep?: "service" | "staff") => void;
  setPreSelectedStaff: (staffId: string) => void;
  setPreSelectedServiceAndStaff: (
    serviceId: string,
    staffId: string,
    opts?: { duration?: number | null; price?: number | null; serviceName?: string | null; staffName?: string | null }
  ) => void;
  clearPreSelection: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | null>(null);
  const [preSelectedStaffId, setPreSelectedStaffIdState] = useState<string | null>(null);
  const [preSelectedDuration, setPreSelectedDuration] = useState<number | null>(null);
  const [preSelectedPrice, setPreSelectedPrice] = useState<number | null>(null);
  const [preSelectedServiceName, setPreSelectedServiceName] = useState<string | null>(null);
  const [preSelectedStaffName, setPreSelectedStaffName] = useState<string | null>(null);
  const [initialStep, setInitialStep] = useState<"service" | "staff" | "datetime" | "information" | "success">("service");

  const setPreSelectedService = (serviceId: string, startAtStep: "service" | "staff" = "staff") => {
    setPreSelectedServiceId(serviceId);
    setInitialStep(startAtStep);
  };

  const setPreSelectedStaff = (staffId: string) => {
    setPreSelectedStaffIdState(staffId);
    setPreSelectedServiceId(null); // Clear service when staff is selected
    setInitialStep("service"); // Start at service selection
  };

  const setPreSelectedServiceAndStaff = (
    serviceId: string,
    staffId: string,
    opts?: { duration?: number | null; price?: number | null; serviceName?: string | null; staffName?: string | null }
  ) => {
    setPreSelectedServiceId(serviceId);
    setPreSelectedStaffIdState(staffId);
    setPreSelectedDuration(opts?.duration ?? null);
    setPreSelectedPrice(opts?.price ?? null);
    setPreSelectedServiceName(opts?.serviceName ?? null);
    setPreSelectedStaffName(opts?.staffName ?? null);
    setInitialStep("datetime");
  };

  const clearPreSelection = () => {
    setPreSelectedServiceId(null);
    setPreSelectedStaffIdState(null);
    setPreSelectedDuration(null);
    setPreSelectedPrice(null);
    setPreSelectedServiceName(null);
    setPreSelectedStaffName(null);
    setInitialStep("service");
  };

  return (
    <BookingContext.Provider
      value={{
        preSelectedServiceId,
        preSelectedStaffId,
        preSelectedDuration,
        preSelectedPrice,
        preSelectedServiceName,
        preSelectedStaffName,
        initialStep,
        setPreSelectedService,
        setPreSelectedStaff,
        setPreSelectedServiceAndStaff,
        clearPreSelection,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
