import { redirect } from "next/navigation";

export default async function ModelRootPage({ params }: { params: Promise<{ slug: string, modelSlug?: string }> }) {
  const resolvedParams = await params;
  const targetSlug = resolvedParams.modelSlug || resolvedParams.slug;
  const brandSlug = resolvedParams.modelSlug ? resolvedParams.slug : null;
  
  if (brandSlug) {
    redirect(`/console/brand/${brandSlug}/model/${targetSlug}/specification`);
  } else {
    redirect(`/console/brand/model/${targetSlug}/specification`);
  }
}
