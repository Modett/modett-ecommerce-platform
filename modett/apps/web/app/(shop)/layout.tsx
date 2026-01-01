"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NewsletterPopup } from "@/features/engagement/components/newsletter-popup";
import { useNewsletterSubscribe } from "@/features/engagement";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const subscribe = useNewsletterSubscribe();

  const handleNewsletterSubmit = async (email: string) => {
    await subscribe(email, "popup");
  };

  return (
    <>
      <Header />
      {children}
      <Footer />
      <NewsletterPopup delay={5000} onSubmit={handleNewsletterSubmit} />
    </>
  );
}
