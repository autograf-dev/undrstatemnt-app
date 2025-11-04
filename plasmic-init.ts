import { initPlasmicLoader } from "@plasmicapp/loader-nextjs/react-server-conditional";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "cNKRiBfR9gaLTWcRDQNiZV",  // ID of a project you are using
      token: "DcXVPoyOFGcAuFSZ85Ypu1uaRFmY2AqiMRBBv6qZxWog0In5gYkDQj0Nnyp7bAl5rgFo8cOYV08CyW59zA"  // API token for that project
    }
  ],
  // Fetches the latest revisions, whether or not they were unpublished!
  // Disable for production to ensure you render only published changes.
  preview: process.env.NODE_ENV !== 'production',
});
import BookingWidget from "./components/BookingWidget"; // Import the BookingWidget component
import ServiceListWidget from "./components/ServiceListWidget";
import StaffListWidget from "./components/StaffListWidget";
import ServicesExplorer from "./components/ServicesExplorer";
import ServicesShowcase from "./components/ServicesShowcase";
import HomepageStaff from "./components/HomepageStaff";
import HomepageServices from "./components/HomepageServices";
import StaffShowcase from "./components/StaffShowcase";
import StaffGrid from "./components/StaffGrid";
import StaffProfilePage from "./components/StaffProfilePage";
import StaffProfilePageWrapper from "./components/StaffProfilePageWrapper";
import AppointmentsList from "./components/AppointmentsList";
// (BarberProfile removed)

// Register code components used by Plasmic pages so Studio and runtime can render them
PLASMIC.registerComponent(BookingWidget, {
  name: "BookingWidget",
  props: {
    // Service card styles
    serviceCardBorderColor: { type: "color", description: "Service card border color", defaultValue: "#fed7aa" },
    serviceCardShadow: { type: "string", description: "CSS box-shadow for service cards", defaultValue: "none" },
    serviceCardRadius: { type: "string", description: "Border radius for service cards", defaultValue: "0.5rem" },
    serviceCardPadding: { type: "string", description: "Padding for service cards", defaultValue: "10px" },
    servicePriceColor: { type: "color", description: "Price text color", defaultValue: "#391709" },
    servicePriceIconColor: { type: "color", description: "Price icon color", defaultValue: "#391709" },
    serviceDurationIconColor: { type: "color", description: "Duration text/icon color", defaultValue: "#391709" },
    serviceCardActiveBg: { type: "color", description: "Active service card background", defaultValue: "#391709" },
    serviceCardActiveText: { type: "color", description: "Active service card text color", defaultValue: "#ffffff" },
    serviceCardActiveBorderColor: { type: "color", description: "Active service card border color", defaultValue: "#391709" },
    spinnerColor: { type: "color", description: "Loading spinner color", defaultValue: "#391709" },
    serviceTitleColor: { type: "color", description: "Service title color", defaultValue: "#391709" },
    serviceDurationColor: { type: "color", description: "Service duration color", defaultValue: "#391709" },
    staffNameColor: { type: "color", description: "Staff name color", defaultValue: "#391709" },
    navPrimaryBg: { type: "color", description: "Primary button background", defaultValue: "#391709" },
    navPrimaryText: { type: "color", description: "Primary button text", defaultValue: "#ffffff" },
    navSecondaryBorder: { type: "color", description: "Secondary button border", defaultValue: "#e5e7eb" },
    navSecondaryText: { type: "color", description: "Secondary button text", defaultValue: "#111827" },
    
    // API Configuration
    servicesApiPath: { 
      type: "choice", 
      description: "API endpoint for services",
      options: ["/api/supabaseservices", "/api/services"],
      defaultValue: "/api/supabaseservices",
      group: "API",
    },
    staffApiPath: { 
      type: "choice", 
      description: "API endpoint for staff",
      options: ["/api/supabasestaff", "/api/staff"],
      defaultValue: "/api/supabasestaff",
      group: "API",
    },
    staffSlotsApiPath: { 
      type: "choice", 
      description: "API endpoint for staff slots",
      options: ["/api/free-slots"],
      defaultValue: "/api/free-slots",
      group: "API",
    },
    customerApiPath: { type: "string", description: "API endpoint for customers", defaultValue: "/api/customer", group: "API" },
    appointmentApiPath: { type: "string", description: "API endpoint for appointments", defaultValue: "/api/appointment", group: "API" },
    
    // Color Scheme
    primaryColor: { type: "color", description: "Primary color (buttons, active states)", defaultValue: "#D97639", group: "Colors" },
    secondaryColor: { type: "color", description: "Secondary color", defaultValue: "#6b7280" },
    bgColor: { type: "color", description: "Background color", defaultValue: "white" },
    cardBgColor: { type: "color", description: "Card background color", defaultValue: "#ffffff" },
    textColorPrimary: { type: "color", description: "Text color - Primary", defaultValue: "#1a1a1a" },
    textColorSecondary: { type: "color", description: "Text color - Secondary", defaultValue: "#6b7280" },
    borderColor: { type: "color", description: "Border color", defaultValue: "#e5e7eb" },
    hoverColor: { type: "color", description: "Hover color", defaultValue: "#f9fafb" },
    
    // Typography
    headingSize: { type: "string", description: "Heading font size (e.g., 1.5rem, 24px)", defaultValue: "1.5rem", group: "Typography" },
    subheadingSize: { type: "string", description: "Subheading font size (e.g., 1.125rem, 18px)", defaultValue: "1.125rem" },
    bodyTextSize: { type: "string", description: "Body text font size (e.g., 1rem, 16px)", defaultValue: "1rem" },
    smallTextSize: { type: "string", description: "Small text font size (e.g., 0.875rem, 14px)", defaultValue: "0.875rem" },
    
    // Step Labels
    step1Label: { type: "string", description: "Step 1 label", defaultValue: "Service", group: "Labels" },
    step2Label: { type: "string", description: "Step 2 label", defaultValue: "Staff" },
    step3Label: { type: "string", description: "Step 3 label", defaultValue: "Date & Time" },
    step4Label: { type: "string", description: "Step 4 label", defaultValue: "Information" },
    step5Label: { type: "string", description: "Step 5 label", defaultValue: "Success" },
    
    // Button Text
    continueButtonText: { type: "string", description: "Continue button text", defaultValue: "Continue", group: "Labels" },
    backButtonText: { type: "string", description: "Back button text", defaultValue: "Back" },
    submitButtonText: { type: "string", description: "Submit button text", defaultValue: "Submit" },
    bookNowButtonText: { type: "string", description: "Book Now button text", defaultValue: "Book Now" },
    
    // Loading & Empty States
    loadingText: { type: "string", description: "Loading text", defaultValue: "Loading..." },
    noResultsText: { type: "string", description: "No results text", defaultValue: "No results found" },
    showLoadingSpinner: { type: "boolean", description: "Show loading spinner", defaultValue: true },
    
    // Spacing & Layout
    maxWidth: { type: "string", description: "Container max width (e.g., 1280px)", defaultValue: "1280px", group: "Layout" },
    containerPadding: { type: "string", description: "Container padding (e.g., 2rem)", defaultValue: "2rem" },
    cardBorderRadius: { type: "string", description: "Card border radius (e.g., 0.75rem, 12px)", defaultValue: "0.75rem" },
    buttonBorderRadius: { type: "string", description: "Button border radius (e.g., 0.5rem, 8px)", defaultValue: "0.5rem" },
    cardGap: { type: "string", description: "Card gap/spacing (e.g., 1rem, 16px)", defaultValue: "1rem" },
    
    // Stepper Configuration
    showStepper: { type: "boolean", description: "Show stepper on desktop", defaultValue: true, group: "Stepper" },
    showMobileStepIndicator: { type: "boolean", description: "Show step indicator on mobile", defaultValue: true },
    stepperActiveColor: { type: "color", description: "Stepper color - Active", defaultValue: "#D97639" },
    stepperInactiveColor: { type: "color", description: "Stepper color - Inactive", defaultValue: "#e5e7eb" },
    stepperCompletedColor: { type: "color", description: "Stepper color - Completed", defaultValue: "#10b981", group: "Stepper" },
    
    // Success step controls (Lottie loop only)
    successLottieLoop: { type: "boolean", displayName: "Lottie Loop", defaultValue: true, group: "Success" },
    successTitle: { type: "string", displayName: "Success Title", defaultValue: "Booking Confirmed! 🎉", group: "Success" },
    successMessage: { type: "string", displayName: "Success Message", defaultValue: "Thank you for choosing us! Your appointment has been successfully booked. We're excited to see you soon!", group: "Success" },
    successShowInfoCard: { type: "boolean", displayName: "Show Info Card", defaultValue: true, group: "Success" },
    successInfoTitle: { type: "string", displayName: "Info Card Title", defaultValue: "What's Next?", group: "Success" },
    successInfoBullets: { 
      type: "array", 
      displayName: "Info Bullets", 
      itemType: { type: "string" }, 
      defaultValue: [
        "You'll receive a confirmation SMS shortly",
        "We'll send you a reminder 24 hours before",
        "Call us anytime if you need to reschedule",
      ],
      group: "Success"
    },
  },
} as any);

PLASMIC.registerComponent(ServiceListWidget, {
  name: "ServiceListWidget",
  props: {
    departmentId: {
      type: "string",
      description: "Department/group id or 'all'",
      defaultValue: "all"
    },
    initialSelectedServiceId: {
      type: "string",
      description: "Preselect a service id",
    },
    showMeta: {
      type: "boolean",
      description: "Show duration and staff count",
      defaultValue: true,
    },
    showTabs: {
      type: "boolean",
      description: "Show derived department tabs",
      defaultValue: true,
    },
    showSearch: {
      type: "boolean",
      description: "Show search input",
      defaultValue: true,
    },
  },
});

PLASMIC.registerComponent(StaffListWidget, {
  name: "StaffListWidget",
  props: {
    serviceId: {
      type: "string",
      description: "Service id to fetch staff for",
      defaultValue: "",
    },
    includeAnyOption: {
      type: "boolean",
      description: "Include 'Any available' option",
      defaultValue: true,
    },
    initialSelectedStaffId: {
      type: "string",
      description: "Preselect a staff id",
    },
  },
});

PLASMIC.registerComponent(ServicesExplorer, {
  name: "ServicesExplorer",
  props: {
    initialDepartmentId: {
      type: "string",
      description: "Initial department id or 'all'",
      defaultValue: "all",
    },
    showSearch: {
      type: "boolean",
      description: "Show search input",
      defaultValue: true,
    },
  },
});

import ServicesCatalog from "./components/ServicesCatalog";
import MainSidebar from "./components/MainSidebar";
import PageShellShadcn from "./components/PageShellShadcn";
import MainHeader from "./components/MainHeader";
import PageShellWithHeader from "./components/PageShellWithHeader";
import HeroSection from "./components/HeroSection";
import OurStory from "./components/OurStory";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import LottiePlayer from "@/components/LottiePlayer";

PLASMIC.registerComponent(ServicesCatalog, {
  name: "ServicesCatalog",
  props: {
    maxPerGroup: {
      type: "number",
      description: "Max cards to show per group",
      defaultValue: 6,
    },
    showSearch: {
      type: "boolean",
      description: "Show search input",
      defaultValue: true,
    },
  },
});

// (BarberProfile registration removed)

// Lightweight Lottie player that accepts a JSON URL uploaded via Plasmic assets
PLASMIC.registerComponent(LottiePlayer, {
  name: "LottiePlayer",
  props: {
    src: {
      type: "string",
      displayName: "Lottie JSON URL",
      description: "Upload JSON in Plasmic assets and bind its URL here.",
    },
    autoplay: { type: "boolean", defaultValue: true },
    loop: { type: "boolean", defaultValue: true },
    speed: { type: "number", defaultValue: 1 },
    background: { type: "string", defaultValue: "transparent" },
    width: { type: "string", defaultValue: "100%" },
    height: { type: "string", defaultValue: "220px" },
    mode: {
      type: "choice",
      options: ["normal", "bounce"],
      defaultValue: "normal",
    },
  },
});

PLASMIC.registerComponent(MainSidebar, {
  name: "MainSidebar",
  props: {
    logoSrc: { type: "string", description: "Logo URL", defaultValue: "/next.svg" },
    title: { type: "string", description: "Business name", defaultValue: "UNDERSTATEMNT CO." },
    subtitle: { type: "string", description: "Address", defaultValue: "1309 Edmonton Trl, Calgary, AB" },
    items: {
      type: "object",
      description: "Nav items: array of {id, label, href, icon}",
      defaultValue: [
        { id: "home", label: "Home", href: "/", icon: "home" },
        { id: "barbers", label: "Barbers", href: "/barbers", icon: "barbers" },
        { id: "services", label: "Services", href: "/services", icon: "services" },
      ],
    },
    activeHref: { type: "string", description: "Active item href" },
    signInHref: { type: "string", description: "Sign-in link", defaultValue: "/login" },
  },
});

PLASMIC.registerComponent(MainSidebar, {
  name: "MainSidebar",
  props: {
    logoSrc: { 
      type: "imageUrl", 
      description: "Logo image (can also paste URL path)", 
      defaultValue: "/next.svg" 
    },
    logoWidth: { type: "number", description: "Logo width (px)", defaultValue: 80 },
    logoHeight: { type: "number", description: "Logo height (px)", defaultValue: 80 },
    logoBgColor: { type: "color", description: "Logo background color", defaultValue: "rgba(255, 255, 255, 0.1)" },
    title: { type: "string", description: "Business name", defaultValue: "Undrstatemnt" },
    subtitle: { type: "string", description: "Address", defaultValue: "1309 Edmonton Trl, Calgary, AB T2E 4Y8" },
    items: {
      type: "array",
      description: "Navigation menu items",
      itemType: {
        type: "object",
        nameFunc: (item?: { label?: string }) => item?.label ?? "New Menu Item",
        fields: {
          id: { 
            type: "string", 
            description: "Unique ID",
            defaultValue: "menu-item"
          },
          label: { 
            type: "string", 
            description: "Menu label",
            defaultValue: "New Item"
          },
          href: { 
            type: "string", 
            description: "Link path (e.g. /home)",
            defaultValue: "/"
          },
          icon: {
            type: "choice",
            description: "Icon from Lucide library",
            options: [
              "home", "barbers", "services", "calendar", "clock", "user", "users", 
              "scissors", "star", "heart", "phone", "mail", "map-pin", "navigation",
              "settings", "menu", "x", "check", "chevron-right", "chevron-left",
              "chevron-down", "chevron-up", "arrow-right", "arrow-left", "plus",
              "minus", "shopping-cart", "shopping-bag", "credit-card", "dollar-sign",
              "gift", "tag", "bookmark", "bell", "message-circle", "send", "search",
              "filter", "edit", "trash", "copy", "share", "download", "upload",
              "image", "file", "folder", "lock", "unlock", "eye", "eye-off",
              "thumbs-up", "thumbs-down", "smile", "frown", "coffee", "sun", "moon",
              "cloud", "zap", "trending-up", "trending-down", "activity", "bar-chart",
              "pie-chart", "help-circle", "info", "alert-circle", "alert-triangle"
            ],
            defaultValue: "home"
          }
        }
      },
      defaultValue: [
        { id: "home", label: "Home", href: "/", icon: "home" },
        { id: "barbers", label: "Barbers", href: "/barbers", icon: "barbers" },
        { id: "services", label: "Services", href: "/services", icon: "services" },
      ],
    },
    activeHref: { type: "string", description: "Active item href" },
    signInLabel: { type: "string", description: "Sign in button text", defaultValue: "Sign In" },
    signInHref: { type: "string", description: "Sign-in link", defaultValue: "/login" },
    bgColor: { type: "color", description: "Sidebar background color", defaultValue: "#391709" },
    textColor: { type: "color", description: "Text color", defaultValue: "white" },
    activeBgColor: { type: "color", description: "Active item background", defaultValue: "rgba(255, 255, 255, 0.15)" },
    hoverBgColor: { type: "color", description: "Hover background", defaultValue: "rgba(255, 255, 255, 0.1)" },
    buttonBgColor: { type: "color", description: "Sign-in button background", defaultValue: "white" },
    buttonTextColor: { type: "color", description: "Sign-in button text", defaultValue: "#391709" },
    defaultCollapsed: { type: "boolean", description: "Start collapsed (icon-only mode)", defaultValue: false },
  },
});

PLASMIC.registerComponent(PageShellShadcn, {
  name: "PageShellShadcn",
  props: {
    logoSrc: { 
      type: "imageUrl", 
      description: "Logo image (can also paste URL path)", 
      defaultValue: "/next.svg" 
    },
    logoWidth: { type: "number", description: "Logo width (px)", defaultValue: 80 },
    logoHeight: { type: "number", description: "Logo height (px)", defaultValue: 80 },
    logoBgColor: { type: "color", description: "Logo background color", defaultValue: "rgba(255, 255, 255, 0.1)" },
    title: { type: "string", description: "Business name", defaultValue: "Undrstatemnt" },
    subtitle: { type: "string", description: "Address", defaultValue: "1309 Edmonton Trl, Calgary, AB T2E 4Y8" },
    sidebarItems: {
      type: "array",
      description: "Navigation menu items",
      itemType: {
        type: "object",
        nameFunc: (item?: { label?: string }) => item?.label ?? "New Menu Item",
        fields: {
          id: { 
            type: "string", 
            description: "Unique ID",
            defaultValue: "menu-item"
          },
          label: { 
            type: "string", 
            description: "Menu label",
            defaultValue: "New Item"
          },
          href: { 
            type: "string", 
            description: "Link path (e.g. /home)",
            defaultValue: "/"
          },
          icon: {
            type: "choice",
            description: "Icon from Lucide library",
            options: [
              "home", "barbers", "services", "calendar", "clock", "user", "users", 
              "scissors", "star", "heart", "phone", "mail", "map-pin", "navigation",
              "settings", "menu", "x", "check", "chevron-right", "chevron-left",
              "chevron-down", "chevron-up", "arrow-right", "arrow-left", "plus",
              "minus", "shopping-cart", "shopping-bag", "credit-card", "dollar-sign",
              "gift", "tag", "bookmark", "bell", "message-circle", "send", "search",
              "filter", "edit", "trash", "copy", "share", "download", "upload",
              "image", "file", "folder", "lock", "unlock", "eye", "eye-off",
              "thumbs-up", "thumbs-down", "smile", "frown", "coffee", "sun", "moon",
              "cloud", "zap", "trending-up", "trending-down", "activity", "bar-chart",
              "pie-chart", "help-circle", "info", "alert-circle", "alert-triangle"
            ],
            defaultValue: "home"
          }
        }
      },
      defaultValue: [
        { id: "home", label: "Home", href: "/", icon: "home" },
        { id: "barbers", label: "Barbers", href: "/barbers", icon: "barbers" },
        { id: "services", label: "Services", href: "/services", icon: "services" },
      ],
    },
    activeHref: { type: "string", description: "Active href" },
    signInLabel: { type: "string", description: "Sign in button text", defaultValue: "Sign In" },
    signInHref: { type: "string", description: "Sign-in link", defaultValue: "/login" },
    sidebarBgColor: { type: "color", description: "Sidebar background color", defaultValue: "#391709" },
    sidebarTextColor: { type: "color", description: "Sidebar text color", defaultValue: "white" },
    sidebarActiveBgColor: { type: "color", description: "Active item background", defaultValue: "rgba(255, 255, 255, 0.15)" },
    sidebarHoverBgColor: { type: "color", description: "Hover background", defaultValue: "rgba(255, 255, 255, 0.1)" },
    buttonBgColor: { type: "color", description: "Sign-in button background", defaultValue: "white" },
    buttonTextColor: { type: "color", description: "Sign-in button text", defaultValue: "#391709" },
    defaultCollapsed: { type: "boolean", description: "Start collapsed (icon-only mode)", defaultValue: false },
    children: { type: "slot", defaultValue: { type: "text", value: "Page content here" } },
  },
});

PLASMIC.registerComponent(MainHeader, {
  name: "MainHeader",
  props: {
    logoSrc: { 
      type: "imageUrl", 
      description: "Logo image", 
      defaultValue: "/logo.png" 
    },
    logoWidth: { type: "number", description: "Logo width (px)", defaultValue: 50 },
    logoHeight: { type: "number", description: "Logo height (px)", defaultValue: 50 },
    title: { type: "string", description: "Business name", defaultValue: "UNDERSTATEMENT" },
    items: {
      type: "array",
      description: "Navigation menu items",
      itemType: {
        type: "object",
        nameFunc: (item?: { label?: string }) => item?.label ?? "New Menu Item",
        fields: {
          label: { 
            type: "string", 
            description: "Menu label",
            defaultValue: "New Item"
          },
          href: { 
            type: "string", 
            description: "Link path (e.g. /home)",
            defaultValue: "/homepage"
          },
          icon: {
            type: "choice",
            description: "Icon from Lucide library",
            options: [
              "home", "barbers", "services", "calendar", "clock", "user", "users", 
              "scissors", "star", "heart", "phone", "mail", "map-pin", "navigation",
              "settings", "menu", "x", "check", "chevron-right", "chevron-left",
              "chevron-down", "chevron-up", "arrow-right", "arrow-left", "plus",
              "minus", "shopping-cart", "shopping-bag", "credit-card", "dollar-sign",
              "gift", "tag", "bookmark", "bell", "message-circle", "send", "search",
              "filter", "edit", "trash", "copy", "share", "download", "upload",
              "image", "file", "folder", "lock", "unlock", "eye", "eye-off",
              "thumbs-up", "thumbs-down", "smile", "frown", "coffee", "sun", "moon",
              "cloud", "zap", "trending-up", "trending-down", "activity", "bar-chart",
              "pie-chart", "help-circle", "info", "alert-circle", "alert-triangle"
            ],
            defaultValue: "home"
          }
        }
      },
      defaultValue: [
        { label: "Home", href: "/homepage", icon: "home" },
        { label: "Barbers", href: "/barbers", icon: "barbers" },
        { label: "Services", href: "/services", icon: "services" },
      ],
    },
    activeHref: { type: "string", description: "Active href", defaultValue: "/homepage" },
    signInLabel: { type: "string", description: "Sign in button text", defaultValue: "Sign In" },
    signInHref: { type: "string", description: "Sign-in link", defaultValue: "/signin" },
    bgColor: { type: "color", description: "Header background (use rgba for transparency)", defaultValue: "rgba(255, 255, 255, 0.8)" },
    textColor: { type: "color", description: "Text color", defaultValue: "#1a1a1a" },
    activeColor: { type: "color", description: "Active item color", defaultValue: "#000000" },
    hoverColor: { type: "color", description: "Hover background color", defaultValue: "rgba(0, 0, 0, 0.05)" },
    buttonBgColor: { type: "color", description: "Sign-in button background", defaultValue: "#000000" },
    buttonTextColor: { type: "color", description: "Sign-in button text", defaultValue: "#ffffff" },
    // Mobile Footer Nav Configuration
    showMobileBookingButton: { type: "boolean", description: "[Mobile Footer] Show center booking button", defaultValue: true },
    mobileBookingHref: { type: "string", description: "[Mobile Footer] Center booking button link", defaultValue: "/booking" },
    mobileBookingColor: { type: "color", description: "[Mobile Footer] Center booking button color", defaultValue: "#D97639" },
    mobileBookingGlowOpacity: { type: "number", description: "[Mobile Footer] Booking button glow opacity (0-1)", defaultValue: 0.3 },
    showMobileUserIcon: { type: "boolean", description: "[Mobile Footer] Show user/signup icon", defaultValue: true },
    mobileUserHref: { type: "string", description: "[Mobile Footer] User/signup link", defaultValue: "/signin" },
    mobileFooterBgColor: { type: "color", description: "[Mobile Footer] Footer background color", defaultValue: "rgba(255, 255, 255, 0.8)" },
    mobileFooterIconColor: { type: "color", description: "[Mobile Footer] Icon color (inactive)", defaultValue: "#1a1a1a" },
    mobileFooterActiveIconColor: { type: "color", description: "[Mobile Footer] Icon color (active)", defaultValue: "#000000" },
    mobileFooterIconSize: { type: "number", description: "[Mobile Footer] Icon size (px)", defaultValue: 24 },
    mobileFooterPadding: { type: "string", description: "[Mobile Footer] Padding (e.g., 0.75rem)", defaultValue: "0.75rem" },
  },
});

PLASMIC.registerComponent(PageShellWithHeader, {
  name: "PageShellWithHeader",
  props: {
    logoSrc: { 
      type: "imageUrl", 
      description: "Logo image", 
      defaultValue: "/logo.png" 
    },
    logoWidth: { type: "number", description: "Logo width (px)", defaultValue: 50 },
    logoHeight: { type: "number", description: "Logo height (px)", defaultValue: 50 },
    title: { type: "string", description: "Business name", defaultValue: "UNDERSTATEMENT" },
    headerItems: {
      type: "array",
      description: "Header navigation items",
      itemType: {
        type: "object",
        nameFunc: (item?: { label?: string }) => item?.label ?? "New Menu Item",
        fields: {
          label: { 
            type: "string", 
            description: "Menu label",
            defaultValue: "New Item"
          },
          href: { 
            type: "string", 
            description: "Link path (e.g. /home)",
            defaultValue: "/"
          },
          icon: {
            type: "choice",
            description: "Icon from Lucide library",
            options: [
              "home", "barbers", "services", "calendar", "clock", "user", "users", 
              "scissors", "star", "heart", "phone", "mail", "map-pin", "navigation",
              "settings", "menu", "x", "check", "chevron-right", "chevron-left",
              "chevron-down", "chevron-up", "arrow-right", "arrow-left", "plus",
              "minus", "shopping-cart", "shopping-bag", "credit-card", "dollar-sign",
              "gift", "tag", "bookmark", "bell", "message-circle", "send", "search",
              "filter", "edit", "trash", "copy", "share", "download", "upload",
              "image", "file", "folder", "lock", "unlock", "eye", "eye-off",
              "thumbs-up", "thumbs-down", "smile", "frown", "coffee", "sun", "moon",
              "cloud", "zap", "trending-up", "trending-down", "activity", "bar-chart",
              "pie-chart", "help-circle", "info", "alert-circle", "alert-triangle"
            ],
            defaultValue: "home"
          }
        }
      },
      defaultValue: [
        { label: "Home", href: "/", icon: "home" },
        { label: "Barbers", href: "/barbers", icon: "barbers" },
        { label: "Services", href: "/services", icon: "services" },
      ],
    },
    activeHref: { type: "string", description: "Active href", defaultValue: "/homepage" },
    signInLabel: { type: "string", description: "Sign in button text", defaultValue: "Sign In" },
    signInHref: { type: "string", description: "Sign-in link", defaultValue: "/signin" },
    headerBgColor: { type: "color", description: "Header background (use rgba for glassy effect)", defaultValue: "rgba(255, 255, 255, 0.8)" },
    headerTextColor: { type: "color", description: "Header text color", defaultValue: "#1a1a1a" },
    headerActiveColor: { type: "color", description: "Active item color", defaultValue: "#000000" },
    headerHoverColor: { type: "color", description: "Hover background color", defaultValue: "rgba(0, 0, 0, 0.05)" },
    buttonBgColor: { type: "color", description: "Sign-in button background", defaultValue: "#000000" },
    buttonTextColor: { type: "color", description: "Sign-in button text", defaultValue: "#ffffff" },
    // Mobile Footer Nav Configuration
    showMobileBookingButton: { type: "boolean", description: "[Mobile Footer] Show center booking button", defaultValue: true },
    mobileBookingHref: { type: "string", description: "[Mobile Footer] Center booking button link", defaultValue: "/booking" },
    mobileBookingColor: { type: "color", description: "[Mobile Footer] Center booking button color", defaultValue: "#D97639" },
    mobileBookingGlowOpacity: { type: "number", description: "[Mobile Footer] Booking button glow opacity (0-1)", defaultValue: 0.3 },
    showMobileUserIcon: { type: "boolean", description: "[Mobile Footer] Show user/signup icon", defaultValue: true },
    mobileUserHref: { type: "string", description: "[Mobile Footer] User/signup link", defaultValue: "/signin" },
    mobileFooterBgColor: { type: "color", description: "[Mobile Footer] Footer background color", defaultValue: "rgba(255, 255, 255, 0.8)" },
    mobileFooterIconColor: { type: "color", description: "[Mobile Footer] Icon color (inactive)", defaultValue: "#1a1a1a" },
    mobileFooterActiveIconColor: { type: "color", description: "[Mobile Footer] Icon color (active)", defaultValue: "#000000" },
    mobileFooterIconSize: { type: "number", description: "[Mobile Footer] Icon size (px)", defaultValue: 24 },
    mobileFooterPadding: { type: "string", description: "[Mobile Footer] Padding (e.g., 0.75rem)", defaultValue: "0.75rem" },
    // Drawer controls
    useDrawerForBooking: { type: "boolean", description: "Open booking as bottom drawer when tapping + on mobile", defaultValue: false },
    drawerTitle: { type: "string", description: "Drawer title (optional)", defaultValue: "Quick Booking" },
    drawerRadiusClass: { type: "string", description: "Tailwind classes for drawer corner radius", defaultValue: "rounded-t-2xl" },
    drawerBgColor: { type: "color", description: "Drawer background color", defaultValue: "rgba(255,255,255,0.95)" },
    drawerContent: { type: "slot", defaultValue: { type: "text", value: "Place your booking widget or custom component here" } },
    children: { type: "slot", defaultValue: { type: "text", value: "Page content here" } },
  },
});

PLASMIC.registerComponent(HeroSection, {
  name: "HeroSection",
  props: {
    // Logo Controls
    logoSrc: { type: "imageUrl", description: "Logo image", defaultValue: "/next.svg" },
    logoWidth: { type: "number", description: "Logo width (px)", defaultValue: 120 },
    logoHeight: { type: "number", description: "Logo height (px)", defaultValue: 120 },
    logoBgColor: { type: "color", description: "Logo background", defaultValue: "white" },
    logoBorderColor: { type: "color", description: "Logo border", defaultValue: "#D4A574" },
    
    // Text Controls
    title: { type: "string", description: "Business name", defaultValue: "UNDRSTATEMNT CO." },
    titleSize: { type: "string", description: "Title font size", defaultValue: "3rem" },
    titleColor: { type: "color", description: "Title color", defaultValue: "#1a1a1a" },
    subtitle: { type: "string", description: "Subtitle/address", defaultValue: "1309 Edmonton Trl, Calgary, AB T2E 4Y8" },
    subtitleColor: { type: "color", description: "Subtitle color", defaultValue: "#666666" },
    
    // Button Controls
    buttonText: { type: "string", description: "Button text", defaultValue: "Make a Booking" },
    buttonHref: { type: "string", description: "Button link", defaultValue: "/booking" },
    buttonIcon: {
      type: "choice",
      description: "Button icon",
      options: [
        "scissors", "calendar", "clock", "arrow-right", "chevron-right", "phone", 
        "mail", "user", "star", "heart", "check", "plus", "shopping-cart", "sparkles"
      ],
      defaultValue: "scissors"
    },
    buttonBgColor: { type: "color", description: "Button background", defaultValue: "#D97639" },
    buttonTextColor: { type: "color", description: "Button text color", defaultValue: "white" },
    buttonHoverColor: { type: "color", description: "Button hover color", defaultValue: "#C06020" },
    
    // Container Style
    containerBgColor: { type: "color", description: "Container background (use rgba for transparency)", defaultValue: "rgba(255, 255, 255, 0.8)" },
    containerBorderColor: { type: "color", description: "Container border color", defaultValue: "rgba(255, 255, 255, 0.3)" },
    shadowColor: { type: "color", description: "Shadow color (use rgba)", defaultValue: "rgba(0, 0, 0, 0.15)" },
    shadowBlur: { type: "number", description: "Shadow blur (px)", defaultValue: 40 },
    shadowSpread: { type: "number", description: "Shadow spread (px)", defaultValue: 8 },
    
    // Left Doodle
    showLeftDoodle: { type: "boolean", description: "Show left doodle image", defaultValue: false },
    leftDoodleSrc: { type: "imageUrl", description: "Left doodle image", defaultValue: "/doodle-left.png" },
    leftDoodleWidth: { type: "number", description: "Left doodle width (px)", defaultValue: 200 },
    leftDoodleTop: { type: "string", description: "Left doodle top position (%, px, rem)", defaultValue: "10%" },
    leftDoodleLeft: { type: "string", description: "Left doodle left position (%, px, rem)", defaultValue: "5%" },
    hideLeftDoodleMobile: { type: "boolean", description: "Hide left doodle on mobile (< 768px)", defaultValue: true },
    hideLeftDoodleTablet: { type: "boolean", description: "Hide left doodle on tablet (768px-1023px)", defaultValue: false },
    
    // Right Doodle
    showRightDoodle: { type: "boolean", description: "Show right doodle image", defaultValue: true },
    rightDoodleSrc: { type: "imageUrl", description: "Right doodle image", defaultValue: "/doodle-right.png" },
    rightDoodleWidth: { type: "number", description: "Right doodle width (px)", defaultValue: 200 },
    rightDoodleTop: { type: "string", description: "Right doodle top position (%, px, rem)", defaultValue: "10%" },
    rightDoodleRight: { type: "string", description: "Right doodle right position (%, px, rem)", defaultValue: "5%" },
    hideRightDoodleMobile: { type: "boolean", description: "Hide right doodle on mobile (< 768px)", defaultValue: true },
    hideRightDoodleTablet: { type: "boolean", description: "Hide right doodle on tablet (768px-1023px)", defaultValue: false },
    
    // Floating Icons
    showFloatingIcons: { type: "boolean", description: "Show floating animated icons", defaultValue: true },
    hideFloatingIconsMobile: { type: "boolean", description: "Hide floating icons on mobile", defaultValue: true },
    
    // Floating Icon 1
    floatingIcon1: {
      type: "choice",
      description: "Floating icon 1",
      options: [
        "scissors", "star", "heart", "sparkles", "zap", "clock", "calendar", 
        "smile", "coffee", "gift", "thumbs-up", "sun", "moon", "cloud"
      ],
      defaultValue: "scissors"
    },
    floatingIcon1Size: { type: "number", description: "Icon 1 size (px)", defaultValue: 40 },
    floatingIcon1Color: { type: "color", description: "Icon 1 color", defaultValue: "#D97639" },
    floatingIcon1Top: { type: "string", description: "Icon 1 top position (%)", defaultValue: "15%" },
    floatingIcon1Left: { type: "string", description: "Icon 1 left position (%)", defaultValue: "10%" },
    floatingIcon1Duration: { type: "string", description: "Icon 1 animation duration (s)", defaultValue: "3s" },
    floatingIcon1Delay: { type: "string", description: "Icon 1 animation delay (s)", defaultValue: "0s" },
    floatingIcon1Rotation: { type: "number", description: "Icon 1 rotation (deg)", defaultValue: 15 },
    
    // Floating Icon 2
    floatingIcon2: {
      type: "choice",
      description: "Floating icon 2",
      options: [
        "scissors", "star", "heart", "sparkles", "zap", "clock", "calendar", 
        "smile", "coffee", "gift", "thumbs-up", "sun", "moon", "cloud"
      ],
      defaultValue: "star"
    },
    floatingIcon2Size: { type: "number", description: "Icon 2 size (px)", defaultValue: 30 },
    floatingIcon2Color: { type: "color", description: "Icon 2 color", defaultValue: "#F59E0B" },
    floatingIcon2Top: { type: "string", description: "Icon 2 top position (%)", defaultValue: "20%" },
    floatingIcon2Left: { type: "string", description: "Icon 2 left position (%)", defaultValue: "85%" },
    floatingIcon2Duration: { type: "string", description: "Icon 2 animation duration (s)", defaultValue: "4s" },
    floatingIcon2Delay: { type: "string", description: "Icon 2 animation delay (s)", defaultValue: "0.5s" },
    floatingIcon2Rotation: { type: "number", description: "Icon 2 rotation (deg)", defaultValue: -20 },
    
    // Floating Icon 3
    floatingIcon3: {
      type: "choice",
      description: "Floating icon 3",
      options: [
        "scissors", "star", "heart", "sparkles", "zap", "clock", "calendar", 
        "smile", "coffee", "gift", "thumbs-up", "sun", "moon", "cloud"
      ],
      defaultValue: "sparkles"
    },
    floatingIcon3Size: { type: "number", description: "Icon 3 size (px)", defaultValue: 35 },
    floatingIcon3Color: { type: "color", description: "Icon 3 color", defaultValue: "#8B5CF6" },
    floatingIcon3Top: { type: "string", description: "Icon 3 top position (%)", defaultValue: "70%" },
    floatingIcon3Left: { type: "string", description: "Icon 3 left position (%)", defaultValue: "15%" },
    floatingIcon3Duration: { type: "string", description: "Icon 3 animation duration (s)", defaultValue: "3.5s" },
    floatingIcon3Delay: { type: "string", description: "Icon 3 animation delay (s)", defaultValue: "1s" },
    floatingIcon3Rotation: { type: "number", description: "Icon 3 rotation (deg)", defaultValue: 25 },
    
    // Floating Icon 4
    floatingIcon4: {
      type: "choice",
      description: "Floating icon 4",
      options: [
        "scissors", "star", "heart", "sparkles", "zap", "clock", "calendar", 
        "smile", "coffee", "gift", "thumbs-up", "sun", "moon", "cloud"
      ],
      defaultValue: "heart"
    },
    floatingIcon4Size: { type: "number", description: "Icon 4 size (px)", defaultValue: 28 },
    floatingIcon4Color: { type: "color", description: "Icon 4 color", defaultValue: "#EC4899" },
    floatingIcon4Top: { type: "string", description: "Icon 4 top position (%)", defaultValue: "75%" },
    floatingIcon4Left: { type: "string", description: "Icon 4 left position (%)", defaultValue: "80%" },
    floatingIcon4Duration: { type: "string", description: "Icon 4 animation duration (s)", defaultValue: "4.5s" },
    floatingIcon4Delay: { type: "string", description: "Icon 4 animation delay (s)", defaultValue: "1.5s" },
    floatingIcon4Rotation: { type: "number", description: "Icon 4 rotation (deg)", defaultValue: -15 },
  },
});

PLASMIC.registerComponent(OurStory, {
  name: "OurStory",
  props: {
    title: { type: "string", description: "Section title", defaultValue: "Our Story" },
    titleSize: { type: "string", description: "Title font size", defaultValue: "2.5rem" },
    titleColor: { type: "color", description: "Title color", defaultValue: "#1a1a1a" },
    content: { 
      type: "string", 
      description: "Story content", 
      defaultValue: "LOCATED IN DOWNTOWN CALGARY, UNDRSTATEMNT IS A PREMIER BARBERSHOP THAT PROVIDES A HIGH LEVEL OF CARE AND EXPERIENCE TO OUR CLIENTELE. DRIVEN BY OUR PASSION AND EXPERTISE, OUR CLIENTS ARE CONFIDENT THAT THEY CAN COUNT ON OUR PROFESSIONAL SERVICE. THEY KNOW THAT THEY WILL LEAVE OUR SALON FEELING AND LOOKING THEIR BEST. UNDRSTATEMNT'S GOAL IS TO HAVE A SHOP DEEPLY ROOTED IN THE FOUNDATION OF THE COMMUNITY, SOMEWHERE THEIR CLIENTELE CAN SURROUND THEMSELVES WITH AMAZING PEOPLE THROUGH THE YEARS." 
    },
    contentSize: { type: "string", description: "Content font size", defaultValue: "1rem" },
    contentColor: { type: "color", description: "Content color", defaultValue: "#6b7280" },
    imageSrc: { type: "imageUrl", description: "Story image", defaultValue: "/Understatement.jpg" },
    imageWidth: { type: "number", description: "Image width", defaultValue: 600 },
    imageHeight: { type: "number", description: "Image height", defaultValue: 400 },
    imagePosition: {
      type: "choice",
      description: "Image position",
      options: ["left", "right"],
      defaultValue: "right"
    },
    bgColor: { type: "color", description: "Background color", defaultValue: "white" },
    padding: { type: "string", description: "Section padding", defaultValue: "3rem 2rem" },
    maxWidth: { type: "string", description: "Max container width", defaultValue: "1200px" },
  },
});

PLASMIC.registerComponent(CTASection, {
  name: "CTASection",
  props: {
    heading: { type: "string", description: "Main heading", defaultValue: "Have a question? Contact us!" },
    headingColor: { type: "color", description: "Heading color", defaultValue: "#1a1a1a" },
    headingSize: { type: "string", description: "Heading font size", defaultValue: "1.75rem" },
    subtext: { type: "string", description: "Subtext/description", defaultValue: "Call by clicking the button on the right →" },
    subtextColor: { type: "color", description: "Subtext color", defaultValue: "#666666" },
    subtextSize: { type: "string", description: "Subtext font size", defaultValue: "1.125rem" },
    buttonText: { type: "string", description: "Button text", defaultValue: "Call us" },
    buttonHref: { type: "string", description: "Button link (tel: or URL)", defaultValue: "tel:+14031234567" },
    buttonIcon: {
      type: "choice",
      description: "Button icon",
      options: [
        "phone", "mail", "message-circle", "headphones", "help-circle",
        "arrow-right", "chevron-right", "external-link"
      ],
      defaultValue: "phone"
    },
    buttonBgColor: { type: "color", description: "Button background", defaultValue: "#D97639" },
    buttonTextColor: { type: "color", description: "Button text color", defaultValue: "white" },
    buttonHoverColor: { type: "color", description: "Button hover color", defaultValue: "#C06020" },
    bgColor: { type: "color", description: "Background color", defaultValue: "white" },
    borderColor: { type: "color", description: "Border color", defaultValue: "#e5e7eb" },
    padding: { type: "string", description: "Section padding", defaultValue: "2.5rem 3rem" },
    margin: { type: "string", description: "Section margin", defaultValue: "3rem 0" },
    maxWidth: { type: "string", description: "Maximum width", defaultValue: "1280px" },
  },
});

PLASMIC.registerComponent(Footer, {
  name: "Footer",
  props: {
    logoSrc: { type: "imageUrl", description: "Logo image", defaultValue: "/next.svg" },
    logoWidth: { type: "number", description: "Logo width (px)", defaultValue: 60 },
    logoHeight: { type: "number", description: "Logo height (px)", defaultValue: 60 },
    businessName: { type: "string", description: "Business name", defaultValue: "UNDRSTATEMNT CO." },
    businessNameColor: { type: "color", description: "Business name color", defaultValue: "#1a1a1a" },
    businessNameSize: { type: "string", description: "Business name size", defaultValue: "1.5rem" },
    address: { type: "string", description: "Address", defaultValue: "1309 EDMONTON TRL, CALGARY, AB T2E 4Y8" },
    addressColor: { type: "color", description: "Address color", defaultValue: "#D97639" },
    addressSize: { type: "string", description: "Address font size", defaultValue: "0.875rem" },
    socialLinks: {
      type: "array",
      description: "Social media links",
      itemType: {
        type: "object",
        nameFunc: (item?: { platform?: string }) => item?.platform ?? "Social Link",
        fields: {
          id: { type: "string", description: "Unique ID", defaultValue: "social" },
          platform: { type: "string", description: "Platform name", defaultValue: "Instagram" },
          url: { type: "string", description: "Social media URL", defaultValue: "https://instagram.com" },
          icon: {
            type: "choice",
            description: "Icon",
            options: [
              "instagram", "facebook", "twitter", "linkedin", "youtube",
              "github", "tiktok", "pinterest", "snapchat", "whatsapp"
            ],
            defaultValue: "instagram"
          }
        }
      },
      defaultValue: [
        { id: "instagram", platform: "Instagram", url: "https://instagram.com", icon: "instagram" },
        { id: "facebook", platform: "Facebook", url: "https://facebook.com", icon: "facebook" },
      ],
    },
    socialIconSize: { type: "number", description: "Social icon size", defaultValue: 24 },
    socialIconColor: { type: "color", description: "Social icon color", defaultValue: "#D97639" },
    socialBgColor: { type: "color", description: "Social button background", defaultValue: "#FEF3EE" },
    socialHoverColor: { type: "color", description: "Social button hover", defaultValue: "#FED7C3" },
    bgColor: { type: "color", description: "Background color", defaultValue: "#FAFAFA" },
    padding: { type: "string", description: "Section padding", defaultValue: "3rem 2rem" },
    maxWidth: { type: "string", description: "Maximum width", defaultValue: "1280px" },
  },
});

PLASMIC.registerComponent(ServicesShowcase, {
  name: "ServicesShowcase",
  props: {
    title: { type: "string", description: "Section title", defaultValue: "Our Services" },
    titleColor: { type: "color", description: "Title color", defaultValue: "#1a1a1a" },
    searchPlaceholder: { type: "string", description: "Search placeholder", defaultValue: "Search" },
    showSearch: { type: "boolean", description: "Show search bar", defaultValue: true },
    showFilter: { type: "boolean", description: "Show filter button", defaultValue: true },
    cardBgColor: { type: "color", description: "Card background color", defaultValue: "white" },
    cardHoverColor: { type: "color", description: "Card hover color", defaultValue: "#f9fafb" },
    priceBadgeColor: { type: "color", description: "Price badge color", defaultValue: "#f3f4f6" },
    priceTextColor: { type: "color", description: "Price text color", defaultValue: "#1f2937" },
    seeAllBgColor: { type: "color", description: "See all button color", defaultValue: "#D97639" },
    seeAllTextColor: { type: "color", description: "See all text color", defaultValue: "white" },
    bgColor: { type: "color", description: "Background color", defaultValue: "white" },
    padding: { type: "string", description: "Section padding", defaultValue: "3rem 2rem" },
    cardImageHeight: { type: "string", description: "Card image height", defaultValue: "200px" },
  },
});

PLASMIC.registerComponent(HomepageStaff, {
  name: "HomepageStaff",
  props: {
    // API Configuration
    apiPath: { 
      type: "choice", 
      description: "API endpoint to fetch staff data",
      options: [
        "/api/supabasestaff",
        "/api/staff",
        "/api/appointment",
        "/api/services",
        "/api/customer"
      ],
      defaultValue: "/api/supabasestaff" 
    },
    
    // Title Controls
    title: { type: "string", description: "Section title", defaultValue: "Our Professionals" },
    titleColor: { type: "color", description: "Title color", defaultValue: "#1a1a1a" },
    titleSizeMobile: { type: "string", description: "Title size - Mobile (e.g., 1.5rem, 24px)", defaultValue: "1.5rem" },
    titleSizeTablet: { type: "string", description: "Title size - Tablet (e.g., 1.875rem, 30px)", defaultValue: "1.875rem" },
    titleSizeDesktop: { type: "string", description: "Title size - Desktop (e.g., 2.25rem, 36px)", defaultValue: "2.25rem" },
    
    // See All Link
    showSeeAll: { type: "boolean", description: "Show See All link", defaultValue: true },
    seeAllHref: { type: "string", description: "See All link", defaultValue: "/staff" },
    seeAllColor: { type: "color", description: "See All color", defaultValue: "#D97639" },
    seeAllSizeMobile: { type: "string", description: "See All size - Mobile", defaultValue: "0.875rem" },
    seeAllSizeTablet: { type: "string", description: "See All size - Tablet", defaultValue: "1rem" },
    seeAllSizeDesktop: { type: "string", description: "See All size - Desktop", defaultValue: "1.125rem" },
    
    // Card Appearance
    cardBgColor: { type: "color", description: "Card background", defaultValue: "white" },
    cardHoverColor: { type: "color", description: "Card hover color", defaultValue: "#f9fafb" },
    cardWidthMobile: { type: "number", description: "Card width - Mobile (px)", defaultValue: 280 },
    cardWidthTablet: { type: "number", description: "Card width - Tablet (px)", defaultValue: 300 },
    cardWidthDesktop: { type: "number", description: "Card width - Desktop (px)", defaultValue: 320 },
    cardImageHeightMobile: { type: "number", description: "Card image height - Mobile (px)", defaultValue: 250 },
    cardImageHeightTablet: { type: "number", description: "Card image height - Tablet (px)", defaultValue: 280 },
    cardImageHeightDesktop: { type: "number", description: "Card image height - Desktop (px)", defaultValue: 300 },
    nameColor: { type: "color", description: "Staff name color", defaultValue: "#1a1a1a" },
    nameFontSize: { type: "string", description: "Staff name font size", defaultValue: "1.25rem" },
    subtitleColor: { type: "color", description: "Subtitle color", defaultValue: "#6b7280" },
    subtitleFontSize: { type: "string", description: "Subtitle font size", defaultValue: "0.875rem" },
    
    // Section Style
    bgColor: { type: "color", description: "Background color", defaultValue: "#f9fafb" },
    paddingMobile: { type: "string", description: "Section padding - Mobile (e.g., 2rem 1rem)", defaultValue: "2rem 1rem" },
    paddingTablet: { type: "string", description: "Section padding - Tablet (e.g., 2.5rem 1.5rem)", defaultValue: "2.5rem 1.5rem" },
    paddingDesktop: { type: "string", description: "Section padding - Desktop (e.g., 3rem 2rem)", defaultValue: "3rem 2rem" },
    
    // Carousel Controls
    cardsPerViewMobile: { type: "number", description: "Cards per view - Mobile", defaultValue: 1 },
    cardsPerViewTablet: { type: "number", description: "Cards per view - Tablet", defaultValue: 2 },
    cardsPerViewDesktop: { type: "number", description: "Cards per view - Desktop", defaultValue: 4 },
    showArrows: { type: "boolean", description: "Show navigation arrows", defaultValue: true },
    showArrowsMobile: { type: "boolean", description: "Show arrows on mobile (when using 2-grid layout)", defaultValue: false },
    arrowColor: { type: "color", description: "Arrow color", defaultValue: "#D97639" },
    arrowBgColor: { type: "color", description: "Arrow background", defaultValue: "white" },
    showScrollDots: { type: "boolean", description: "Show scroll indicator dots", defaultValue: true },
  },
});

PLASMIC.registerComponent(HomepageServices, {
  name: "HomepageServices",
  props: {
    // API Configuration
    apiPath: { 
      type: "choice", 
      description: "API endpoint to fetch services data",
      options: [
        "/api/supabaseservices",
        "/api/services",
        "/api/appointment",
        "/api/customer"
      ],
      defaultValue: "/api/supabaseservices" 
    },
    
    // Title Controls
    title: { type: "string", description: "Section title", defaultValue: "Our Services" },
    titleColor: { type: "color", description: "Title color", defaultValue: "#1a1a1a" },
    titleSizeMobile: { type: "string", description: "Title size - Mobile (e.g., 1.5rem, 24px)", defaultValue: "1.5rem" },
    titleSizeTablet: { type: "string", description: "Title size - Tablet (e.g., 1.875rem, 30px)", defaultValue: "1.875rem" },
    titleSizeDesktop: { type: "string", description: "Title size - Desktop (e.g., 2.25rem, 36px)", defaultValue: "2.25rem" },
    
    // Search & Filter
    showSearch: { type: "boolean", description: "Show search bar", defaultValue: true },
    searchPlaceholder: { type: "string", description: "Search placeholder text", defaultValue: "Search" },
    showFilter: { type: "boolean", description: "Show filter button", defaultValue: true },
    filterButtonText: { type: "string", description: "Filter button text", defaultValue: "Filter" },
    searchBgColor: { type: "color", description: "Search/Filter background", defaultValue: "#f3f4f6" },
    searchTextColor: { type: "color", description: "Search/Filter text color", defaultValue: "#6b7280" },
    searchBorderColor: { type: "color", description: "Search/Filter border color", defaultValue: "#e5e7eb" },
    
    // Category Display
    groupByCategory: { type: "boolean", description: "Group services by category", defaultValue: true },
    showCategoryTitles: { type: "boolean", description: "Show category titles", defaultValue: true },
    categoryTitleColor: { type: "color", description: "Category title color", defaultValue: "#1a1a1a" },
    categoryTitleSize: { type: "string", description: "Category title font size", defaultValue: "1.5rem" },
    showSeeAll: { type: "boolean", description: "Show 'See All/View Less' button", defaultValue: true },
    seeAllColor: { type: "color", description: "See All button color", defaultValue: "#D97639" },
    seeAllSizeMobile: { type: "string", description: "See All size - Mobile", defaultValue: "0.875rem" },
    seeAllSizeTablet: { type: "string", description: "See All size - Tablet", defaultValue: "1rem" },
    seeAllSizeDesktop: { type: "string", description: "See All size - Desktop", defaultValue: "1.125rem" },
    initialItemsToShow: { type: "number", description: "Initial items to show when collapsed", defaultValue: 4 },
    seeAllText: { type: "string", description: "See All button text", defaultValue: "See All" },
    viewLessText: { type: "string", description: "View Less button text", defaultValue: "View Less" },
    
    // Card Appearance
    cardBgColor: { type: "color", description: "Card background", defaultValue: "white" },
    cardHoverColor: { type: "color", description: "Card hover color", defaultValue: "#f9fafb" },
    cardWidthMobile: { type: "number", description: "Card width - Mobile (px)", defaultValue: 280 },
    cardWidthTablet: { type: "number", description: "Card width - Tablet (px)", defaultValue: 300 },
    cardWidthDesktop: { type: "number", description: "Card width - Desktop (px)", defaultValue: 320 },
    cardImageHeightMobile: { type: "number", description: "Card image height - Mobile (px)", defaultValue: 200 },
    cardImageHeightTablet: { type: "number", description: "Card image height - Tablet (px)", defaultValue: 220 },
    cardImageHeightDesktop: { type: "number", description: "Card image height - Desktop (px)", defaultValue: 240 },
    nameColor: { type: "color", description: "Service name color", defaultValue: "#1a1a1a" },
    nameFontSize: { type: "string", description: "Service name font size", defaultValue: "1rem" },
    priceColor: { type: "color", description: "Price color", defaultValue: "#D97639" },
    priceFontSize: { type: "string", description: "Price font size", defaultValue: "0.875rem" },
    durationColor: { type: "color", description: "Duration color", defaultValue: "#6b7280" },
    durationFontSize: { type: "string", description: "Duration font size", defaultValue: "0.875rem" },
    showDuration: { type: "boolean", description: "Show service duration", defaultValue: true },
    
    // Section Style
    bgColor: { type: "color", description: "Background color", defaultValue: "white" },
    paddingMobile: { type: "string", description: "Section padding - Mobile (e.g., 2rem 1rem)", defaultValue: "2rem 1rem" },
    paddingTablet: { type: "string", description: "Section padding - Tablet (e.g., 2.5rem 1.5rem)", defaultValue: "2.5rem 1.5rem" },
    paddingDesktop: { type: "string", description: "Section padding - Desktop (e.g., 3rem 2rem)", defaultValue: "3rem 2rem" },
    
    // Carousel Controls
    cardsPerViewMobile: { type: "number", description: "Cards per view - Mobile", defaultValue: 1 },
    cardsPerViewTablet: { type: "number", description: "Cards per view - Tablet", defaultValue: 2 },
    cardsPerViewDesktop: { type: "number", description: "Cards per view - Desktop", defaultValue: 4 },
    showArrows: { type: "boolean", description: "Show navigation arrows", defaultValue: true },
    showArrowsMobile: { type: "boolean", description: "Show arrows on mobile (when using 2-grid layout)", defaultValue: false },
    arrowColor: { type: "color", description: "Arrow color", defaultValue: "#D97639" },
    arrowBgColor: { type: "color", description: "Arrow background", defaultValue: "white" },
    showScrollDots: { type: "boolean", description: "Show scroll indicator dots", defaultValue: true },
    scrollDotsColor: { type: "color", description: "Scroll dots color", defaultValue: "#D97639" },
    
    // Card Click Behavior
    cardLinkTemplate: { type: "string", description: "Card link template (use {id} for service ID)", defaultValue: "/booking?serviceId={id}" },
  },
});

PLASMIC.registerComponent(StaffShowcase, {
  name: "StaffShowcase",
  props: {
    // Title Controls
    title: { type: "string", description: "Section title", defaultValue: "Our Professionals" },
    titleColor: { type: "color", description: "Title color", defaultValue: "#1a1a1a" },
    titleSizeMobile: { type: "string", description: "Title size - Mobile (e.g., 1.5rem, 24px)", defaultValue: "1.5rem" },
    titleSizeTablet: { type: "string", description: "Title size - Tablet (e.g., 2rem, 32px)", defaultValue: "2rem" },
    titleSizeDesktop: { type: "string", description: "Title size - Desktop (e.g., 2.5rem, 40px)", defaultValue: "2.5rem" },
    
    // Breadcrumb
    breadcrumb: { type: "string", description: "Breadcrumb text", defaultValue: "Home / All" },
    breadcrumbColor: { type: "color", description: "Breadcrumb color", defaultValue: "#6b7280" },
    showBreadcrumb: { type: "boolean", description: "Show breadcrumb", defaultValue: true },
    breadcrumbSize: { type: "string", description: "Breadcrumb font size", defaultValue: "0.875rem" },
    
    // Card Appearance
    cardBgColor: { type: "color", description: "Card background", defaultValue: "white" },
    cardHoverColor: { type: "color", description: "Card hover color", defaultValue: "#f9fafb" },
    cardImageHeightMobile: { type: "number", description: "Card image height - Mobile (px)", defaultValue: 250 },
    cardImageHeightTablet: { type: "number", description: "Card image height - Tablet (px)", defaultValue: 300 },
    cardImageHeightDesktop: { type: "number", description: "Card image height - Desktop (px)", defaultValue: 350 },
    cardBorderRadius: { type: "string", description: "Card border radius (e.g., 0.75rem, 12px)", defaultValue: "0.75rem" },
    
    // Staff Info
    nameColor: { type: "color", description: "Staff name color", defaultValue: "#1a1a1a" },
    nameFontSize: { type: "string", description: "Staff name font size", defaultValue: "1.25rem" },
    subtitleColor: { type: "color", description: "Staff subtitle color", defaultValue: "#6b7280" },
    subtitleFontSize: { type: "string", description: "Staff subtitle font size", defaultValue: "0.875rem" },
    
    // Layout Controls  
    columnsMobile: { type: "number", description: "Columns - Mobile (1-3)", defaultValue: 2 },
    columnsTablet: { type: "number", description: "Columns - Tablet (2-4)", defaultValue: 3 },
    columnsDesktop: { type: "number", description: "Columns - Desktop (3-6)", defaultValue: 4 },
    cardGap: { type: "string", description: "Gap between cards (e.g., 1.5rem, 24px)", defaultValue: "1.5rem" },
    
    // Section Style
    bgColor: { type: "color", description: "Background color", defaultValue: "white" },
    paddingMobile: { type: "string", description: "Section padding - Mobile (e.g., 2rem 1rem)", defaultValue: "2rem 1rem" },
    paddingTablet: { type: "string", description: "Section padding - Tablet (e.g., 2.5rem 1.5rem)", defaultValue: "2.5rem 1.5rem" },
    paddingDesktop: { type: "string", description: "Section padding - Desktop (e.g., 3rem 2rem)", defaultValue: "3rem 2rem" },
    maxWidth: { type: "string", description: "Maximum container width (e.g., 1280px)", defaultValue: "1280px" },
  },
});

PLASMIC.registerComponent(StaffGrid, {
  name: "StaffGrid",
  props: {
    // API Configuration
    apiPath: { 
      type: "choice", 
      description: "API endpoint to fetch staff data",
      options: [
        "/api/supabasestaff",
        "/api/staff",
      ],
      defaultValue: "/api/supabasestaff" 
    },
    
    // Title Controls
    title: { type: "string", description: "Section title", defaultValue: "Our Professionals" },
    titleColor: { type: "color", description: "Title color", defaultValue: "#1a1a1a" },
    titleSizeMobile: { type: "string", description: "Title size - Mobile (e.g., 1.5rem, 24px)", defaultValue: "1.5rem" },
    titleSizeTablet: { type: "string", description: "Title size - Tablet (e.g., 2rem, 32px)", defaultValue: "2rem" },
    titleSizeDesktop: { type: "string", description: "Title size - Desktop (e.g., 2.5rem, 40px)", defaultValue: "2.5rem" },
    
    // Breadcrumb
    breadcrumb: { type: "string", description: "Breadcrumb text", defaultValue: "Home / All" },
    breadcrumbColor: { type: "color", description: "Breadcrumb color", defaultValue: "#6b7280" },
    showBreadcrumb: { type: "boolean", description: "Show breadcrumb", defaultValue: true },
    breadcrumbSize: { type: "string", description: "Breadcrumb font size", defaultValue: "0.875rem" },
    
    // Card Appearance
    cardBgColor: { type: "color", description: "Card background", defaultValue: "white" },
    cardHoverColor: { type: "color", description: "Card hover color", defaultValue: "#f9fafb" },
    cardImageHeightMobile: { type: "number", description: "Card image height - Mobile (px)", defaultValue: 250 },
    cardImageHeightTablet: { type: "number", description: "Card image height - Tablet (px)", defaultValue: 300 },
    cardImageHeightDesktop: { type: "number", description: "Card image height - Desktop (px)", defaultValue: 350 },
    cardBorderRadius: { type: "string", description: "Card border radius (e.g., 0.75rem, 12px)", defaultValue: "0.75rem" },
    
    // Staff Info
    nameColor: { type: "color", description: "Staff name color", defaultValue: "#1a1a1a" },
    nameFontSize: { type: "string", description: "Staff name font size", defaultValue: "1.25rem" },
    subtitleColor: { type: "color", description: "Staff subtitle color", defaultValue: "#6b7280" },
    subtitleFontSize: { type: "string", description: "Staff subtitle font size", defaultValue: "0.875rem" },
    
    // Layout Controls  
    columnsMobile: { type: "number", description: "Columns - Mobile (1-3)", defaultValue: 2 },
    columnsTablet: { type: "number", description: "Columns - Tablet (2-4)", defaultValue: 3 },
    columnsDesktop: { type: "number", description: "Columns - Desktop (3-6)", defaultValue: 4 },
    cardGap: { type: "string", description: "Gap between cards (e.g., 1.5rem, 24px)", defaultValue: "1.5rem" },
    
    // Section Style
    bgColor: { type: "color", description: "Background color", defaultValue: "white" },
    paddingMobile: { type: "string", description: "Section padding - Mobile (e.g., 2rem 1rem)", defaultValue: "2rem 1rem" },
    paddingTablet: { type: "string", description: "Section padding - Tablet (e.g., 2.5rem 1.5rem)", defaultValue: "2.5rem 1.5rem" },
    paddingDesktop: { type: "string", description: "Section padding - Desktop (e.g., 3rem 2rem)", defaultValue: "3rem 2rem" },
    maxWidth: { type: "string", description: "Maximum container width (e.g., 1280px)", defaultValue: "1280px" },
  },
});

PLASMIC.registerComponent(StaffProfilePage, {
  name: "StaffProfilePage",
  props: {
    slug: { 
      type: "string", 
      description: "Staff member slug (e.g., 'daniel', 'aj-samson'). This should match the URL slug from /staff/[slug]",
      defaultValue: "daniel"
    },
    apiPath: { 
      type: "choice", 
      description: "API endpoint to fetch staff data",
      options: [
        "/api/supabasestaff",
        "/api/staff",
      ],
      defaultValue: "/api/supabasestaff" 
    },
  },
});

// Wrapper component that automatically extracts slug from URL - use this in Plasmic pages
PLASMIC.registerComponent(StaffProfilePageWrapper, {
  name: "StaffProfilePageWrapper",
  props: {
    // No props needed - automatically gets slug from URL
  },
  importPath: "@/components/StaffProfilePageWrapper",
});

PLASMIC.registerComponent(AppointmentsList, {
  name: "AppointmentsList",
  props: {
    title: { type: "string", defaultValue: "Your bookings" },
    subtitle: { type: "string", defaultValue: "Here's what's coming up. Need to make changes? Just reschedule or cancel below." },
    emptyText: { type: "string", defaultValue: "No upcoming bookings." },
    containerMaxWidth: { type: "string", defaultValue: "860px" },
    brandColor: { type: "color", defaultValue: "#D97639" },
    cardBgColor: { type: "color", defaultValue: "#ffffff" },
    borderColor: { type: "color", defaultValue: "#e5e7eb" },
    textPrimary: { type: "color", defaultValue: "#0f172a" },
    textMuted: { type: "color", defaultValue: "#6b7280" },
    chipBg: { type: "color", defaultValue: "#f3f4f6" },
    showHeader: { type: "boolean", defaultValue: true },
    // Actions
    showActions: { type: "boolean", defaultValue: true },
    cancelButtonText: { type: "string", defaultValue: "Cancel" },
    rescheduleButtonText: { type: "string", defaultValue: "Reschedule" },
    // Logo
    logoSrc: { type: "imageUrl", defaultValue: "/next.svg" },
    logoWidth: { type: "number", defaultValue: 68 },
    logoHeight: { type: "number", defaultValue: 68 },
    logoBgColor: { type: "color", defaultValue: "#ffffff" },
    logoBorderColor: { type: "color", defaultValue: "#e5e7eb" },
  },
});