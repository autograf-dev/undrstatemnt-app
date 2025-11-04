import { use } from "react";
import StaffProfilePage from "@/components/StaffProfilePage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function StaffPage({ params }: PageProps) {
  const { slug } = use(params);

  return <StaffProfilePage slug={slug} />;
}

