"use client";

import PageShellWithHeader from "../PageShellWithHeader";
import { Home, Users, Scissors, Mail, Settings } from "lucide-react";

/**
 * Example usage of PageShellWithHeader component
 * This shows how to use the new glassy header design
 */
export default function HeaderExample() {
  return (
    <PageShellWithHeader
      logoSrc="/logo.png"
      logoWidth={50}
      logoHeight={50}
      title="UNDERSTATEMENT"
      headerItems={[
        {
          label: "Home",
          href: "/",
          icon: <Home className="w-5 h-5" />,
        },
        {
          label: "Barbers",
          href: "/barbers",
          icon: <Users className="w-5 h-5" />,
        },
        {
          label: "Services",
          href: "/services",
          icon: <Scissors className="w-5 h-5" />,
        },
        {
          label: "Support",
          href: "/support",
          icon: <Mail className="w-5 h-5" />,
        },
        {
          label: "Settings",
          href: "/settings",
          icon: <Settings className="w-5 h-5" />,
        },
      ]}
      activeHref="/"
      signInLabel="Sign In"
      signInHref="/signin"
      // Glassy white transparent design
      headerBgColor="rgba(255, 255, 255, 0.8)"
      headerTextColor="#1a1a1a"
      headerActiveColor="#000000"
      headerHoverColor="rgba(0, 0, 0, 0.05)"
      buttonBgColor="#000000"
      buttonTextColor="#ffffff"
    >
      {/* Your page content goes here */}
      <div className="py-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Understatement</h1>
        <p className="text-gray-600">
          This is an example of the new glassy header design with transparent background.
        </p>
      </div>
    </PageShellWithHeader>
  );
}

/**
 * Alternative dark theme example
 */
export function HeaderExampleDark() {
  return (
    <PageShellWithHeader
      logoSrc="/logo.png"
      logoWidth={50}
      logoHeight={50}
      title="UNDERSTATEMENT"
      headerItems={[
        {
          label: "Home",
          href: "/",
          icon: <Home className="w-5 h-5" />,
        },
        {
          label: "Barbers",
          href: "/barbers",
          icon: <Users className="w-5 h-5" />,
        },
        {
          label: "Services",
          href: "/services",
          icon: <Scissors className="w-5 h-5" />,
        },
        {
          label: "Support",
          href: "/support",
          icon: <Mail className="w-5 h-5" />,
        },
        {
          label: "Settings",
          href: "/settings",
          icon: <Settings className="w-5 h-5" />,
        },
      ]}
      activeHref="/"
      signInLabel="Sign In"
      signInHref="/signin"
      // Dark glassy theme
      headerBgColor="rgba(0, 0, 0, 0.8)"
      headerTextColor="#ffffff"
      headerActiveColor="#ffffff"
      headerHoverColor="rgba(255, 255, 255, 0.1)"
      buttonBgColor="#ffffff"
      buttonTextColor="#000000"
    >
      {/* Your page content goes here */}
      <div className="py-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Understatement</h1>
        <p className="text-gray-600">
          This is an example of the dark glassy header design.
        </p>
      </div>
    </PageShellWithHeader>
  );
}

