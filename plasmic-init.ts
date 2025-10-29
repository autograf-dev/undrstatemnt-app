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
import StaffShowcase from "./components/StaffShowcase";

// Register code components used by Plasmic pages so Studio and runtime can render them
PLASMIC.registerComponent(BookingWidget, {
  name: "BookingWidget",
  importPath: "@/components/BookingWidget",
  isDefaultExport: true,
  props: {},
});

PLASMIC.registerComponent(ServiceListWidget, {
  name: "ServiceListWidget",
  importPath: "@/components/ServiceListWidget",
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
  importPath: "@/components/StaffListWidget",
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
  importPath: "@/components/ServicesExplorer",
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

PLASMIC.registerComponent(ServicesCatalog, {
  name: "ServicesCatalog",
  importPath: "@/components/ServicesCatalog",
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

PLASMIC.registerComponent(MainSidebar, {
  name: "MainSidebar",
  importPath: "@/components/MainSidebar",
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
  importPath: "@/components/MainSidebar",
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
        nameFunc: (item: any) => item?.label || "New Menu Item",
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
  importPath: "@/components/PageShellShadcn",
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
        nameFunc: (item: any) => item?.label || "New Menu Item",
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
  importPath: "@/components/MainHeader",
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
        nameFunc: (item: any) => item?.label || "New Menu Item",
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
    activeHref: { type: "string", description: "Active href" },
    signInLabel: { type: "string", description: "Sign in button text", defaultValue: "Sign In" },
    signInHref: { type: "string", description: "Sign-in link", defaultValue: "/signin" },
    bgColor: { type: "color", description: "Header background (use rgba for transparency)", defaultValue: "rgba(255, 255, 255, 0.8)" },
    textColor: { type: "color", description: "Text color", defaultValue: "#1a1a1a" },
    activeColor: { type: "color", description: "Active item color", defaultValue: "#000000" },
    hoverColor: { type: "color", description: "Hover background color", defaultValue: "rgba(0, 0, 0, 0.05)" },
    buttonBgColor: { type: "color", description: "Sign-in button background", defaultValue: "#000000" },
    buttonTextColor: { type: "color", description: "Sign-in button text", defaultValue: "#ffffff" },
  },
});

PLASMIC.registerComponent(PageShellWithHeader, {
  name: "PageShellWithHeader",
  importPath: "@/components/PageShellWithHeader",
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
        nameFunc: (item: any) => item?.label || "New Menu Item",
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
    activeHref: { type: "string", description: "Active href" },
    signInLabel: { type: "string", description: "Sign in button text", defaultValue: "Sign In" },
    signInHref: { type: "string", description: "Sign-in link", defaultValue: "/signin" },
    headerBgColor: { type: "color", description: "Header background (use rgba for glassy effect)", defaultValue: "rgba(255, 255, 255, 0.8)" },
    headerTextColor: { type: "color", description: "Header text color", defaultValue: "#1a1a1a" },
    headerActiveColor: { type: "color", description: "Active item color", defaultValue: "#000000" },
    headerHoverColor: { type: "color", description: "Hover background color", defaultValue: "rgba(0, 0, 0, 0.05)" },
    buttonBgColor: { type: "color", description: "Sign-in button background", defaultValue: "#000000" },
    buttonTextColor: { type: "color", description: "Sign-in button text", defaultValue: "#ffffff" },
    children: { type: "slot", defaultValue: { type: "text", value: "Page content here" } },
  },
});

PLASMIC.registerComponent(HeroSection, {
  name: "HeroSection",
  importPath: "@/components/HeroSection",
  props: {
    logoSrc: { type: "imageUrl", description: "Logo image", defaultValue: "/next.svg" },
    logoWidth: { type: "number", description: "Logo width (px)", defaultValue: 120 },
    logoHeight: { type: "number", description: "Logo height (px)", defaultValue: 120 },
    logoBgColor: { type: "color", description: "Logo background", defaultValue: "white" },
    logoBorderColor: { type: "color", description: "Logo border", defaultValue: "#D4A574" },
    title: { type: "string", description: "Business name", defaultValue: "UNDRSTATEMNT CO." },
    titleSize: { type: "string", description: "Title font size", defaultValue: "3rem" },
    titleColor: { type: "color", description: "Title color", defaultValue: "#1a1a1a" },
    subtitle: { type: "string", description: "Subtitle/address", defaultValue: "1309 Edmonton Trl, Calgary, AB T2E 4Y8" },
    subtitleColor: { type: "color", description: "Subtitle color", defaultValue: "#666666" },
    buttonText: { type: "string", description: "Button text", defaultValue: "Make a Booking" },
    buttonHref: { type: "string", description: "Button link", defaultValue: "/booking" },
    buttonIcon: {
      type: "choice",
      description: "Button icon",
      options: [
        "scissors", "calendar", "clock", "arrow-right", "chevron-right", "phone", 
        "mail", "user", "star", "heart", "check", "plus", "shopping-cart"
      ],
      defaultValue: "scissors"
    },
    buttonBgColor: { type: "color", description: "Button background", defaultValue: "#D97639" },
    buttonTextColor: { type: "color", description: "Button text color", defaultValue: "white" },
    buttonHoverColor: { type: "color", description: "Button hover color", defaultValue: "#C06020" },
    containerBgColor: { type: "color", description: "Container background (use rgba for transparency)", defaultValue: "rgba(255, 255, 255, 0.8)" },
    containerBorderColor: { type: "color", description: "Container border color", defaultValue: "rgba(255, 255, 255, 0.3)" },
    shadowColor: { type: "color", description: "Shadow color (use rgba)", defaultValue: "rgba(0, 0, 0, 0.15)" },
    shadowBlur: { type: "number", description: "Shadow blur (px)", defaultValue: 40 },
    shadowSpread: { type: "number", description: "Shadow spread (px)", defaultValue: 8 },
  },
});

PLASMIC.registerComponent(OurStory, {
  name: "OurStory",
  importPath: "@/components/OurStory",
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
  importPath: "@/components/CTASection",
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
  importPath: "@/components/Footer",
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
        nameFunc: (item: any) => item?.platform || "Social Link",
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
  importPath: "@/components/ServicesShowcase",
  isDefaultExport: true,
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
  importPath: "@/components/HomepageStaff",
  isDefaultExport: true,
  props: {
    title: { type: "string", description: "Section title", defaultValue: "Our Professionals" },
    titleColor: { type: "color", description: "Title color", defaultValue: "#1a1a1a" },
    showSeeAll: { type: "boolean", description: "Show See All link", defaultValue: true },
    seeAllHref: { type: "string", description: "See All link", defaultValue: "/staff" },
    seeAllColor: { type: "color", description: "See All color", defaultValue: "#D97639" },
    cardBgColor: { type: "color", description: "Card background", defaultValue: "white" },
    cardHoverColor: { type: "color", description: "Card hover color", defaultValue: "#f9fafb" },
    nameColor: { type: "color", description: "Name color", defaultValue: "#1a1a1a" },
    subtitleColor: { type: "color", description: "Subtitle color", defaultValue: "#6b7280" },
    bgColor: { type: "color", description: "Background color", defaultValue: "#f9fafb" },
    padding: { type: "string", description: "Section padding", defaultValue: "3rem 2rem" },
    cardImageHeight: { type: "string", description: "Card image height", defaultValue: "300px" },
    cardsPerView: { type: "number", description: "Cards per view (desktop)", defaultValue: 4 },
    showArrows: { type: "boolean", description: "Show navigation arrows", defaultValue: true },
    arrowColor: { type: "color", description: "Arrow color", defaultValue: "#D97639" },
    arrowBgColor: { type: "color", description: "Arrow background", defaultValue: "white" },
  },
});

PLASMIC.registerComponent(StaffShowcase, {
  name: "StaffShowcase",
  importPath: "@/components/StaffShowcase",
  isDefaultExport: true,
  props: {
    title: { type: "string", description: "Section title", defaultValue: "Our Professionals" },
    titleColor: { type: "color", description: "Title color", defaultValue: "#1a1a1a" },
    breadcrumb: { type: "string", description: "Breadcrumb text", defaultValue: "Home / All" },
    breadcrumbColor: { type: "color", description: "Breadcrumb color", defaultValue: "#6b7280" },
    showBreadcrumb: { type: "boolean", description: "Show breadcrumb", defaultValue: true },
    cardBgColor: { type: "color", description: "Card background", defaultValue: "white" },
    cardHoverColor: { type: "color", description: "Card hover color", defaultValue: "#f9fafb" },
    nameColor: { type: "color", description: "Name color", defaultValue: "#1a1a1a" },
    subtitleColor: { type: "color", description: "Subtitle color", defaultValue: "#6b7280" },
    bgColor: { type: "color", description: "Background color", defaultValue: "white" },
    padding: { type: "string", description: "Section padding", defaultValue: "3rem 2rem" },
    cardImageHeight: { type: "string", description: "Card image height", defaultValue: "350px" },
    columns: { type: "number", description: "Columns (desktop)", defaultValue: 4 },
  },
});