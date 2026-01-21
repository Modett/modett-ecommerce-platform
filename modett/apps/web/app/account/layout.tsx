import { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12 bg-[#EFECE5]">{children}</main>
      <Footer />
    </>
  );
}
