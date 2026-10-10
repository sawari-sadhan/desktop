import { redirect } from "next/navigation";

export default async function VariantRootPage({ params }: { params: Promise<{ slug: string, modelSlug: string, variantSlug: string }> }) {
  const p = await params;
  redirect(`/console/brand/${p.slug}/model/${p.modelSlug}/variant/${p.variantSlug}/specification`);
}
