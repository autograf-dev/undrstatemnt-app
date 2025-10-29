'use client';

import * as React from 'react';
import { PlasmicCanvasHost } from '@plasmicapp/loader-nextjs';
// Ensure code component registrations are loaded for Studio
import '../plasmic-init';

export default function PlasmicHostPage() {
  // Add class to body to identify Plasmic Studio environment
  React.useEffect(() => {
    document.body.classList.add('plasmic-studio');
    return () => {
      document.body.classList.remove('plasmic-studio');
    };
  }, []);
  
  return <PlasmicCanvasHost />;
}