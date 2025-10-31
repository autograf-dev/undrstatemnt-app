"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";

interface SuccessStepProps {
  onReset: () => void;
  /** Optional Lottie JSON URL from Plasmic asset (e.g., uploaded file). */
  lottieUrl?: string;
}

export function SuccessStep({ onReset, lottieUrl }: SuccessStepProps) {
  // Load LottieFiles web component once on client; avoids adding a heavy dependency
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasPlayer = document.querySelector('script[data-lottie-player]');
    if (hasPlayer) return;
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
    s.setAttribute('data-lottie-player', 'true');
    document.body.appendChild(s);
  }, []);
  return (
    <div className="service-selection-container">
      <div className="relative flex flex-col items-center justify-center text-center space-y-3 sm:space-y-5 pt-2 sm:pt-4 px-3">
        {/* Subtle check icon as a badge over the animation for visual confirmation */}
        <div className="w-[44px] h-[44px] sm:w-[56px] sm:h-[56px] rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: '#391709' }}>
          <CheckCircle className="text-xl sm:text-2xl text-white" />
        </div>
        {/* Lottie background area */}
        <div className="w-full max-w-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {lottieUrl ? (
            // LottieFiles player web component (loaded above); renders only on client
            // @ts-ignore - custom element not in TS lib
            <lottie-player
              autoplay
              loop
              mode="normal"
              src={lottieUrl}
              style={{ width: '100%', height: '220px' }}
              background="transparent"
              speed="1"
            />
          ) : null}
        </div>
        
        <div className="space-y-4">
          <h2 className="font-bold text-2xl sm:text-3xl">Booking Confirmed! 🎉</h2>
          <p className="text-sm sm:text-lg text-gray-700 max-w-md">
            Thank you for choosing us! Your appointment has been successfully booked. 
            We're excited to see you soon!
          </p>
        </div>
        
        <Card className="p-3 sm:p-5 rounded-xl border w-full max-w-md" style={{ backgroundColor: '#f6efeC', borderColor: '#E5D7CF' }}>
          <div className="space-y-2">
            <div className="font-semibold text-[16px] sm:text-[18px]">What's Next?</div>
            <div className="text-xs sm:text-sm text-gray-700 space-y-1 text-left sm:text-center">
              <p className="text-[13px] sm:text-[15px] font-medium">• You'll receive a confirmation SMS shortly</p>
              <p className="text-[13px] sm:text-[15px] font-medium">• We'll send you a reminder 24 hours before</p>
              <p className="text-[13px] sm:text-[15px] font-medium">• Call us anytime if you need to reschedule</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
