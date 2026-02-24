import { DisplayAd } from "@/components/ads/display-ad";

export function AdSlot({
  slot,
  format = "horizontal",
  className,
}: {
  slot: string;
  format?: "horizontal" | "vertical" | "square";
  className?: string;
}) {
  return <DisplayAd slot={slot} format={format} className={className} />;
}
