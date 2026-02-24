import { AdSlot } from "@/components/ads/ad-slot";

export function InterstitialAd({
  slot = "interstitial",
  className,
}: {
  slot?: string;
  className?: string;
}) {
  return <AdSlot slot={slot} format="horizontal" className={className} />;
}
