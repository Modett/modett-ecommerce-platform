import { Hero } from "@/components/ui/hero";
import { InvestmentPieces } from "@/features/product-catalog/components/investment-pieces";
import { CollectionBanner } from "@/components/ui/collection-banner";
import { BrandPhilosophy } from "@/components/ui/brand-philosophy";
import { Newsletter } from "@/features/engagement/components/newsletter";

// Mock products data - Replace with actual API call
const featuredProducts = [
  {
    id: "1",
    name: "Crispy silk shirt",
    price: 366.0,
    image:
      "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800&h=1000&fit=crop",
    handle: "crispy-silk-shirt",
    rating: 4,
    totalReviews: 128,
    sizes: ["34", "36", "38", "40", "42", "44", "46", "48", "50"],
  },
  {
    id: "2",
    name: "Linen wide-leg pants",
    price: 428.0,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop",
    handle: "linen-wide-leg-pants",
    rating: 5,
    totalReviews: 89,
    sizes: ["34", "36", "38", "40", "42", "44", "46", "48", "50"],
  },
  {
    id: "3",
    name: "Tailored blazer",
    price: 892.0,
    image:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&h=1000&fit=crop",
    handle: "tailored-blazer",
    rating: 5,
    totalReviews: 215,
    sizes: ["34", "36", "38", "40", "42", "44", "46", "48", "50"],
  },
  {
    id: "4",
    name: "Organic cotton dress",
    price: 512.0,
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1000&fit=crop",
    handle: "organic-cotton-dress",
    rating: 4,
    totalReviews: 156,
    sizes: ["34", "36", "38", "40", "42", "44", "46", "48", "50"],
  },
  {
    id: "5",
    name: "Cashmere sweater",
    price: 685.0,
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop",
    handle: "cashmere-sweater",
    rating: 5,
    totalReviews: 342,
    sizes: ["34", "36", "38", "40", "42", "44", "46", "48", "50"],
  },
  {
    id: "6",
    name: "Silk midi skirt",
    price: 445.0,
    image:
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&h=1000&fit=crop",
    handle: "silk-midi-skirt",
    rating: 4,
    totalReviews: 98,
    sizes: ["34", "36", "38", "40", "42", "44", "46", "48", "50"],
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero
        title={["Quiet luxury.", "Timeless craft."]}
        imageSrc="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1920&h=1080&fit=crop&auto=format"
        imageAlt="Woman in a linen set standing on a beach at sunset"
        primaryCta={{
          text: "SHOP COLLECTION",
          href: "/catalog",
        }}
        secondaryCta={{
          text: "OUR JOURNAL",
          href: "/journal",
        }}
      />

      {/* Investment Pieces Section */}
      <InvestmentPieces
        products={featuredProducts}
        subtitle="Born from subtle complexity. Crafted for the woman who values quiet confidence."
      />

      {/* Combined Banner: Collections & The Journal */}
      <CollectionBanner
        title="COLLECTIONS"
        subtitle="SIGNATURE"
        secondaryTitle="THE JOURNAL"
        secondarySubtitle="BEHIND THE CRAFT"
        imageSrc="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1920&h=1080&fit=crop"
      />

      {/* Brand Philosophy Section */}
      <BrandPhilosophy imageSrc="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=800&fit=crop" />

      {/* Newsletter Section */}
      <Newsletter />
    </>
  );
}
