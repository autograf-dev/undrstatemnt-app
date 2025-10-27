import * as React from 'react';
import {
  PlasmicComponent,
  ComponentRenderData,
  PlasmicRootProvider,
  extractPlasmicQueryData
} from '@plasmicapp/loader-nextjs';
import { GetStaticProps } from 'next';
import Error from 'next/error';
import { useRouter } from 'next/router';
import { PLASMIC } from '../plasmic-init';

export const getStaticProps: GetStaticProps = async () => {
  const plasmicData = await PLASMIC.maybeFetchComponentData('/');
  if (!plasmicData) {
    // No Plasmic root page; let Next handle this as a normal index (or 404)
    return { props: {} };
  }

  const pageMeta = plasmicData.entryCompMetas[0];

  const queryCache = await extractPlasmicQueryData(
    <PlasmicRootProvider loader={PLASMIC} prefetchedData={plasmicData} pageRoute={pageMeta.path} pageParams={pageMeta.params}>
      <PlasmicComponent component={pageMeta.displayName} />
    </PlasmicRootProvider>
  );

  return {
    props: { plasmicData, queryCache },
    revalidate: 300
  };
};

export default function IndexPage(props: { plasmicData?: ComponentRenderData; queryCache?: Record<string, any> }) {
  const { plasmicData, queryCache } = props;
  const router = useRouter();
  if (!plasmicData || plasmicData.entryCompMetas.length === 0) {
    return <Error statusCode={404} />;
  }
  const pageMeta = plasmicData.entryCompMetas[0];

  return (
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      prefetchedQueryData={queryCache}
      pageRoute={pageMeta.path}
      pageParams={pageMeta.params}
      pageQuery={router.query}
    >
      <PlasmicComponent component={pageMeta.displayName} />
    </PlasmicRootProvider>
  );
}
