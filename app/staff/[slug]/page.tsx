import StaffProfilePage from "@/components/StaffProfilePage";

interface PageProps {
  params: { slug: string };
}

export default function StaffPage({ params }: PageProps) {
  const { slug } = params;

  return <StaffProfilePage slug={slug} />;
}

