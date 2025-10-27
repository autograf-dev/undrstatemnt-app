'use client';

import * as React from 'react';
import { PlasmicRootProvider } from '@plasmicapp/loader-nextjs';
import { PLASMIC } from './plasmic-init';

// You can register any code components here if needed.
// PLASMIC.registerComponent(...);

export function PlasmicClientRootProvider(
  props: Omit<React.ComponentProps<typeof PlasmicRootProvider>, 'loader'>
) {
  return <PlasmicRootProvider loader={PLASMIC} {...props} />;
}
