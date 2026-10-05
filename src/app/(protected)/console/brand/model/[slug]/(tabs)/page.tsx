import { redirect } from "next/navigation";

export default async function ModelRootPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  redirect(`/console/brand/model/${resolvedParams.slug}/specification`);
}
