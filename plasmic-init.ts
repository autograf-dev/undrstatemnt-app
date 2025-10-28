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

// Register code components used by Plasmic pages so Studio and runtime can render them
PLASMIC.registerComponent(BookingWidget, {
  name: "BookingWidget",
  importPath: "@/components/BookingWidget",
  isDefaultExport: true,
  props: {
    fullHeight: {
      type: "boolean",
      description: "Use full viewport height (min-h-screen)",
      defaultValue: false,
    },
  },
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
import PageShell from "./components/PageShell";
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

PLASMIC.registerComponent(PageShell, {
  name: "PageShell",
  importPath: "@/components/PageShell",
  props: {
    logoSrc: { type: "string", description: "Logo URL", defaultValue: "/next.svg" },
    title: { type: "string", description: "Business name", defaultValue: "UNDERSTATEMNT CO." },
    subtitle: { type: "string", description: "Address", defaultValue: "1309 Edmonton Trl, Calgary, AB" },
    sidebarItems: {
      type: "object",
      description: "Sidebar nav items",
      defaultValue: [
        { id: "home", label: "Home", href: "/", icon: "home" },
        { id: "barbers", label: "Barbers", href: "/barbers", icon: "barbers" },
        { id: "services", label: "Services", href: "/services", icon: "services" },
      ],
    },
    activeHref: { type: "string", description: "Active href" },
    signInHref: { type: "string", description: "Sign-in link", defaultValue: "/login" },
    children: { type: "slot", defaultValue: { type: "text", value: "Page content here" } },
  },
});