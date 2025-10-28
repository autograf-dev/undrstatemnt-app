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