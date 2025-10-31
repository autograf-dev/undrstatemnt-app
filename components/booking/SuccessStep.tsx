"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";

interface SuccessStepProps {
  onReset: () => void;
  /** Optional Lottie JSON URL from Plasmic asset (e.g., uploaded file). */
  lottieUrl?: string;
  /** Show/Hide lottie */
  showLottie?: boolean;
  /** Lottie controls */
  lottieAutoplay?: boolean;
  lottieLoop?: boolean;
  lottieSpeed?: number;
  lottieBackground?: string;
  lottieHeight?: string;
  /** Lottie render mode */
  lottieMode?: 'normal' | 'bounce';
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
  lottieUrl,
  showLottie = true,
  lottieAutoplay = true,
  lottieLoop = true,
  lottieSpeed = 1,
  lottieBackground = 'transparent',
  lottieHeight = '220px',
  lottieMode = 'normal',
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
        {/* Lottie background area */}
        <div className="w-full max-w-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {showLottie && lottieUrl ? (
            // LottieFiles player web component (loaded above); renders only on client
            // @ts-ignore - custom element not in TS lib
            <lottie-player
              autoplay={lottieAutoplay}
              loop={lottieLoop}
              mode={lottieMode}
              src={lottieUrl}
              style={{ width: '100%', height: lottieHeight }}
              background={lottieBackground}
              speed={String(lottieSpeed)}
            />
          ) : null}
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
