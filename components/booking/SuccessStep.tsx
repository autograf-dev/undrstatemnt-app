"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Sparkles, Plus } from "lucide-react";

interface SuccessStepProps {
  onReset: () => void;
}

export function SuccessStep({ onReset }: SuccessStepProps) {
  return (
    <div className="service-selection-container">
      <div className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 pt-2 sm:pt-4">
        <div className="relative">
          <div className="w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: '#391709' }}>
            <CheckCircle className="text-2xl text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border" style={{ backgroundColor: '#f6efeC', borderColor: '#E5D7CF' }}>
            <Sparkles className="text-lg" style={{ color: '#391709' }} />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="font-bold text-2xl sm:text-3xl">Booking Confirmed! 🎉</h2>
          <p className="text-sm sm:text-lg text-gray-700 max-w-md">
            Thank you for choosing us! Your appointment has been successfully booked. 
            We're excited to see you soon!
          </p>
        </div>
        
        <Card className="p-3 sm:p-6 rounded-xl border max-w-md" style={{ backgroundColor: '#f6efeC', borderColor: '#E5D7CF' }}>
          <div className="space-y-2">
            <div className="font-semibold text-[16px] sm:text-[20px]">What's Next?</div>
            <div className="text-xs sm:text-sm text-gray-700 space-y-1">
              <p className="text-[13px] sm:text-[16px] font-medium">• You'll receive a confirmation sms shortly</p>
              <p className="text-[13px] sm:text-[16px] font-medium">• We'll send you a reminder 24 hours before</p>
              <p className="text-[13px] sm:text-[16px] font-medium">• Feel free to call us if you need to reschedule</p>
            </div>
          </div>
        </Card>
        
        <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6">
          <Button
            size="sm"
            onClick={onReset}
            className="text-white"
            style={{ backgroundColor: '#391709' }}
          >
            <Plus className="mr-2" />
            Book Another Appointment
          </Button>
        </div>
      </div>
    </div>
  );
}
