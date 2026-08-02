import { Suspense } from "react";
import { getRecommendations } from "@/lib/recommendations";
import HomeClient from "./HomeClient";
import HomeSkeleton from "./HomeSkeleton";
import { redirect } from "next/navigation";

async function RecommendationsContent() {
  const data = await getRecommendations();

  if (!data) {
    redirect("/login");
  }

  const initialData = {
    ...data,
    stats: data.stats
  };

  return <HomeClient initialData={initialData as any} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <RecommendationsContent />
    </Suspense>
  );
}



