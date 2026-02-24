import { AdSlot } from "@/components/ads/ad-slot";

export function SidebarAd({ slot = "sidebar" }: { slot?: string }) {
  return <AdSlot slot={slot} format="vertical" className="mx-auto" />;
}
