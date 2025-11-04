"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StaffProfilePage from "./StaffProfilePage";

/**
 * Wrapper component for StaffProfilePage that works with Plasmic pages.
 * Extracts the slug from the URL path when used in Plasmic pages.
 * Use this component in Plasmic pages with path pattern: /staff/[slug]
 */
export default function StaffProfilePageWrapper() {
  const [slug, setSlug] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  
  useEffect(() => {
    // Extract slug from URL path
    // In Plasmic, the path will be /staff/[slug], so we get it from the URL
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const match = pathname.match(/^\/staff\/([^\/]+)/);
      const extractedSlug = match ? match[1] : '';
      setSlug(extractedSlug);
      if (extractedSlug) {
        const name = extractedSlug
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");
        setDisplayName(name);
      }
    }
  }, []);
  
  if (!slug) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading staff profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 md:px-8">
        <nav className="mb-4 text-sm text-gray-600">
          <Link href="/barbers" className="hover:underline">Barbers</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{displayName || slug}</span>
        </nav>
      </div>
      <StaffProfilePage slug={slug} />
    </div>
  );
}

