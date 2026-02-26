import { HeroSkeleton, CarouselSectionSkeleton, EngagementSectionSkeleton, WhyColdSkeleton, DiscoverNFTSSkeleton } from "@/components/loading/LoadingSkeleton";

export default function Loading() {
  return (
    <div>
      <HeroSkeleton />
      <CarouselSectionSkeleton />
      <EngagementSectionSkeleton />
      <WhyColdSkeleton />
      <DiscoverNFTSSkeleton />
    </div>
  );
}
