"use client";

import { useState, useEffect } from "react";
import StaffProfilePage from "./StaffProfilePage";

/**
 * Wrapper component for StaffProfilePage that works with Plasmic pages.
 * Extracts the slug from the URL path when used in Plasmic pages.
 * Use this component in Plasmic pages with path pattern: /staff/[slug]
 */
export default function StaffProfilePageWrapper() {
  const [slug, setSlug] = useState<string>("");
  
  useEffect(() => {
    // Extract slug from URL path
    // In Plasmic, the path will be /staff/[slug], so we get it from the URL
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const match = pathname.match(/^\/staff\/([^\/]+)/);
      const extractedSlug = match ? match[1] : '';
      setSlug(extractedSlug);
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

  return <StaffProfilePage slug={slug} />;
}

