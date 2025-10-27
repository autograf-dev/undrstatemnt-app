'use client';

import * as React from 'react';
import { PlasmicCanvasHost } from '@plasmicapp/loader-nextjs';
// Ensure code component registrations are loaded for Studio
import '../plasmic-init';

export default function PlasmicHostPage() {
  return <PlasmicCanvasHost />;
}