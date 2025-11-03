"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface BookingContextType {
  preSelectedServiceId: string | null;
  initialStep: "service" | "staff" | "datetime" | "information" | "success";
  setPreSelectedService: (serviceId: string, startAtStep?: "service" | "staff") => void;
  clearPreSelection: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | null>(null);
  const [initialStep, setInitialStep] = useState<"service" | "staff" | "datetime" | "information" | "success">("service");

  const setPreSelectedService = (serviceId: string, startAtStep: "service" | "staff" = "staff") => {
    setPreSelectedServiceId(serviceId);
    setInitialStep(startAtStep);
  };

  const clearPreSelection = () => {
    setPreSelectedServiceId(null);
    setInitialStep("service");
  };

  return (
    <BookingContext.Provider
      value={{
        preSelectedServiceId,
        initialStep,
        setPreSelectedService,
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
