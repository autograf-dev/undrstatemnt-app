import { PlasmicComponent } from "@plasmicapp/loader-nextjs";
import { PLASMIC } from "../plasmic-init";

export default async function Home() {
  // Fetch Plasmic page data for homepage
  const plasmicData = await PLASMIC.maybeFetchComponentData("/home");
  
  if (!plasmicData) {
    // If no Plasmic page found for /home, try root /
    const rootData = await PLASMIC.maybeFetchComponentData("/");
    if (!rootData) {
      return <div>Homepage not found in Plasmic. Please create a page with path "/home" or "/" in Plasmic Studio.</div>;
    }
    const pageMeta = rootData.entryCompMetas[0];
    return <PlasmicComponent component={pageMeta.displayName} />;
  }
  
  const pageMeta = plasmicData.entryCompMetas[0];
  return <PlasmicComponent component={pageMeta.displayName} />;
}
