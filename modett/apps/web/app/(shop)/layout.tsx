import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NewsletterPopup } from "@/features/engagement/components/newsletter-popup";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <NewsletterPopup delay={5000} />
    </>
  );
}
