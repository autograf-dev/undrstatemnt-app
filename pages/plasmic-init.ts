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
  preview: true,
})