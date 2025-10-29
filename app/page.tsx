import { PLASMIC } from "../plasmic-init";
import PlasmicHomepage from "@/components/PlasmicHomepage";

export default async function Home() {
  // Fetch Plasmic page data for homepage
  const plasmicData = await PLASMIC.maybeFetchComponentData("/home");
  
  if (!plasmicData) {
    // If no Plasmic page found for /home, show message
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Homepage not found in Plasmic</h1>
          <p>Please create a page with path &quot;/home&quot; in Plasmic Studio.</p>
        </div>
      </div>
    );
  }
  
  return <PlasmicHomepage plasmicData={plasmicData} />;
}
