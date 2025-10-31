"use client";

import { PlasmicComponent, PlasmicRootProvider } from "@plasmicapp/loader-nextjs/react-server-conditional";
import { PLASMIC } from "../plasmic-init";
import { ComponentRenderData } from "@plasmicapp/loader-nextjs";
import { useEffect } from "react";

interface PlasmicHomepageProps {
  plasmicData: ComponentRenderData;
}

export default function PlasmicHomepage({ plasmicData }: PlasmicHomepageProps) {
  const pageMeta = plasmicData.entryCompMetas[0];
  
  // Scroll fix - but SKIP in Plasmic Studio
  useEffect(() => {
    // Check if we're in Plasmic Studio (don't apply fixes there)
    const isInStudio = 
      window.location.hostname.includes('studio.plasmic') ||
      window.parent !== window || // In iframe
      document.querySelector('.__wab_editor-canvas') !== null;
    
    if (isInStudio) {
      // In Plasmic Studio - don't apply aggressive fixes
      return;
    }
    
    // Only apply minimal fixes on actual website
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.body.style.minHeight = 'auto';

    const nextRoot = document.getElementById('__next') as HTMLElement | null;
    if (nextRoot) {
      nextRoot.style.minHeight = 'auto';
      nextRoot.style.height = 'auto';
      nextRoot.style.overflow = 'visible';
    }
  }, []);
  
  return (
    <div style={{ height: 'auto', overflow: 'visible', position: 'relative' }}>
      <PlasmicRootProvider loader={PLASMIC} prefetchedData={plasmicData}>
        <PlasmicComponent component={pageMeta.displayName} />
      </PlasmicRootProvider>
    </div>
  );
}

