"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InAppNavGuard() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only run when installed to Home Screen (iOS standalone)
    const isStandalone = (window.navigator as any).standalone === true || window.matchMedia("(display-mode: standalone)").matches;
    if (!isStandalone) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href') || '';
      const linkTarget = anchor.getAttribute('target');
      if (!href || linkTarget === '_blank') return; // allow explicit new-tabs

      // Only intercept same-origin relative links
      try {
        const url = href.startsWith('http') ? new URL(href) : new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return; // external links: open Safari
        e.preventDefault();
        router.push(url.pathname + url.search + url.hash);
      } catch {}
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [router]);

  return null;
}


