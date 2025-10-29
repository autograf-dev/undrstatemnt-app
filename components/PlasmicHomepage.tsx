"use client";

import { PlasmicComponent, PlasmicRootProvider } from "@plasmicapp/loader-nextjs";
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
    
    // Only apply fixes on actual website
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.minHeight = '100vh';
    document.body.style.height = 'auto';
    
    const fix100vh = () => {
      const allDivs = document.querySelectorAll('body *');
      allDivs.forEach((el) => {
        const element = el as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        const inlineStyle = element.getAttribute('style') || '';
        
        if (
          computedStyle.height === '100vh' ||
          computedStyle.minHeight === '100vh' ||
          inlineStyle.includes('100vh')
        ) {
          if (element.tagName === 'DIV' || element.tagName === 'SECTION' || element.tagName === 'MAIN') {
            element.style.height = 'auto';
            element.style.minHeight = '0';
          }
        }
      });
      
      const nextChildren = document.querySelectorAll('#__next > div, #__next > div > div, #__next > div > div > div');
      nextChildren.forEach((el) => {
        (el as HTMLElement).style.height = 'auto';
        (el as HTMLElement).style.minHeight = '0';
      });
    };
    
    fix100vh();
    const timer1 = setTimeout(fix100vh, 100);
    const timer2 = setTimeout(fix100vh, 300);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  return (
    <div style={{ height: 'auto', overflow: 'visible', position: 'relative' }}>
      <PlasmicRootProvider loader={PLASMIC} prefetchedData={plasmicData}>
        <PlasmicComponent component={pageMeta.displayName} />
      </PlasmicRootProvider>
    </div>
  );
}

