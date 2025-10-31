"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessStepProps {
  onReset: () => void;
  /** Loop control for the success animation */
  lottieLoop?: boolean;
  /** Editable text */
  successTitle?: string;
  successMessage?: string;
  /** Show/Hide the info card */
  showInfoCard?: boolean;
  /** Info card title */
  infoCardTitle?: string;
  /** Info card bullet lines */
  infoBullets?: string[];
}

export function SuccessStep({
  onReset,
  lottieLoop = true,
  successTitle = 'Booking Confirmed! 🎉',
  successMessage = "Thank you for choosing us! Your appointment has been successfully booked. We're excited to see you soon!",
  showInfoCard = true,
  infoCardTitle = "What's Next?",
  infoBullets = [
    "You'll receive a confirmation SMS shortly",
    "We'll send you a reminder 24 hours before",
    "Call us anytime if you need to reschedule",
  ],
}: SuccessStepProps) {
  const [isClient, setIsClient] = useState(false);
  // Load LottieFiles web component once on client; avoids adding a heavy dependency
  useEffect(() => {
    setIsClient(true);
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
        {/* Lottie background area */}
        <div className="w-full max-w-md">
          {isClient ? (
            // @ts-ignore - custom element not in TS lib
            <lottie-player
              autoplay
              loop={lottieLoop}
              mode="normal"
              src="/lottie.json"
              style={{ width: '100%', height: '200px' }}
              background="transparent"
              speed="1"
            />
          ) : (
            <div style={{ width: '100%', height: '200px' }} />
          )}
        </div>
        
        <div className="space-y-3">
          <h2 className="font-bold text-2xl sm:text-3xl">{successTitle}</h2>
          <p className="text-sm sm:text-lg text-gray-700 max-w-md">{successMessage}</p>
        </div>
        
        {showInfoCard && (
        <Card className="p-3 sm:p-5 rounded-xl border w-full max-w-md" style={{ backgroundColor: '#f6efeC', borderColor: '#E5D7CF' }}>
          <div className="space-y-2">
            <div className="font-semibold text-[16px] sm:text-[18px]">{infoCardTitle}</div>
            <div className="text-xs sm:text-sm text-gray-700 space-y-1 text-left sm:text-center">
              {Array.isArray(infoBullets) && infoBullets.map((line, idx) => (
                <p key={idx} className="text-[13px] sm:text-[15px] font-medium">• {line}</p>
              ))}
            </div>
          </div>
        </Card>
        )}

      </div>
    </div>
  );
}
