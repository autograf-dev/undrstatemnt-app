"use client";

import React, { useEffect } from "react";

export interface LottiePlayerProps {
  /** Lottie JSON URL. In Plasmic, upload the JSON and bind its URL here. */
  src?: string;
  /** Autoplay animation on load */
  autoplay?: boolean;
  /** Loop animation */
  loop?: boolean;
  /** Render speed multiplier */
  speed?: number;
  /** CSS color or 'transparent' */
  background?: string;
  /** CSS width, e.g. '100%' */
  width?: string;
  /** CSS height, e.g. '220px' */
  height?: string;
  /** Play mode: normal / bounce */
  mode?: "normal" | "bounce";
  className?: string;
  style?: React.CSSProperties;
}

export default function LottiePlayer({
  src,
  autoplay = true,
  loop = true,
  speed = 1,
  background = "transparent",
  width = "100%",
  height = "220px",
  mode = "normal",
  className,
  style,
}: LottiePlayerProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.querySelector('script[data-lottie-player]')) return;
    const s = document.createElement("script");
    s.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
    s.setAttribute("data-lottie-player", "true");
    document.body.appendChild(s);
  }, []);

  if (!src) return null;

  return (
    // @ts-ignore - custom element from web component
    <lottie-player
      src={src}
      autoplay={autoplay}
      loop={loop}
      speed={String(speed)}
      mode={mode}
      background={background}
      class={className}
      style={{ width, height, ...style }}
    />
  );
}


