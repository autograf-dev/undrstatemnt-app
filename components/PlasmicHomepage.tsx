"use client";

import { PlasmicComponent, PlasmicRootProvider } from "@plasmicapp/loader-nextjs";
import { PLASMIC } from "../plasmic-init";
import { ComponentRenderData } from "@plasmicapp/loader-nextjs";

interface PlasmicHomepageProps {
  plasmicData: ComponentRenderData;
}

export default function PlasmicHomepage({ plasmicData }: PlasmicHomepageProps) {
  const pageMeta = plasmicData.entryCompMetas[0];
  
  return (
    <PlasmicRootProvider loader={PLASMIC} prefetchedData={plasmicData}>
      <PlasmicComponent component={pageMeta.displayName} />
    </PlasmicRootProvider>
  );
}

