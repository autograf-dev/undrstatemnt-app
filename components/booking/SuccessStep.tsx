"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Sparkles, Plus } from "lucide-react";

interface SuccessStepProps {
  onReset: () => void;
}

export function SuccessStep({ onReset }: SuccessStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 pt-4">
      <div className="relative">
        <div className="w-[60px] h-[60px] bg-red-700 rounded-full flex items-center justify-center shadow-sm">
          <CheckCircle className="text-2xl text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center border border-red-200">
          <Sparkles className="text-lg text-red-700" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="font-bold text-3xl text-black">Booking Confirmed! 🎉</h2>
        <p className="text-lg text-gray-700 max-w-md">
          Thank you for choosing us! Your appointment has been successfully booked. 
          We're excited to see you soon!
        </p>
      </div>
      
      <Card className="p-6 bg-red-50 rounded-xl border border-red-200 max-w-md">
        <div className="space-y-2">
          <div className="font-semibold text-black text-[20px]">What's Next?</div>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="text-[16px] text-black font-medium">• You'll receive a confirmation sms shortly</p>
            <p className="text-[16px] text-black font-medium">• We'll send you a reminder 24 hours before</p>
            <p className="text-[16px] text-black font-medium">• Feel free to call us if you need to reschedule</p>
          </div>
        </div>
      </Card>
      
      <div className="flex gap-4 mt-6">
        <Button
          size="lg"
          onClick={onReset}
          className="bg-red-700 hover:bg-red-700 text-white"
        >
          <Plus className="mr-2" />
          Book Another Appointment
        </Button>
      </div>
    </div>
  );
}
