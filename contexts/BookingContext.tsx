"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface BookingContextType {
  preSelectedServiceId: string | null;
  preSelectedStaffId: string | null;
  initialStep: "service" | "staff" | "datetime" | "information" | "success";
  setPreSelectedService: (serviceId: string, startAtStep?: "service" | "staff") => void;
  setPreSelectedStaff: (staffId: string) => void;
  clearPreSelection: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | null>(null);
  const [preSelectedStaffId, setPreSelectedStaffIdState] = useState<string | null>(null);
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

  const clearPreSelection = () => {
    setPreSelectedServiceId(null);
    setPreSelectedStaffIdState(null);
    setInitialStep("service");
  };

  return (
    <BookingContext.Provider
      value={{
        preSelectedServiceId,
        preSelectedStaffId,
        initialStep,
        setPreSelectedService,
        setPreSelectedStaff,
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
