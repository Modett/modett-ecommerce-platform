"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Globe,
  Headphones,
  Mail,
  Search,
  Heart,
  User,
  ShoppingBag,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";

export function HeroNew() {
  return (
    <section className="relative w-full h-[1036px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-beach.png" // Using existing hero image as placeholder
          alt="Modett Hero Background"
          fill
          className="object-cover"
          style={{ objectPosition: "center 20%" }}
          priority
        />
        {/* Subtle overlay for text readability if needed */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Integrated Header Content (Top Bar + Main Nav) */}
      <div className="absolute top-0 left-0 right-0 z-10 w-full text-white">
        {/* Top Utility Bar */}
        <div className="border-b border-white/20">
          <div className="max-w-[1440px] mx-auto px-4 md:px-[64px] h-[40px] flex items-center justify-between text-[11px] tracking-wide font-medium">
            {/* Left: Utilities */}
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Sri Lanka</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Headphones className="h-3.5 w-3.5" />
                <span>Contact Us</span>
              </Link>
              <Link
                href="#newsletter"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Newsletter</span>
              </Link>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-5">
              <button className="hover:opacity-80 transition-opacity">
                <Search className="h-[18px] w-[18px]" />
              </button>
              <Link
                href="/account/wishlist"
                className="hover:opacity-80 transition-opacity"
              >
                <Heart className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href="/account"
                className="hover:opacity-80 transition-opacity"
              >
                <User className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href="/cart"
                className="hover:opacity-80 transition-opacity"
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navigation Area */}
        <div className="flex flex-col items-center pt-[24px]">
          {/* Logo */}
          <Link href="/" className="mb-4">
            {/* Using the text version for now to match style, or the logo image if transparent */}
            {/* Note: The design shows a specific vertical logo layout with 'Lyra' icon on top of 'MODETT' */}
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/logo.png"
                alt="MODETT"
                width={200}
                height={60}
                className="brightness-0 invert drop-shadow-md"
              />
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-8 md:gap-12 text-[12px] tracking-[0.15em] font-medium text-white/90">
            <Link
              href="/collections/summer-2025"
              className="hover:text-white transition-colors"
            >
              SUMMER 2025
            </Link>
            <Link
              href="/collections"
              className="hover:text-white transition-colors"
            >
              COLLECTIONS
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              BRAND PHILOSOPHY
            </Link>
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              CONTACT
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative h-full max-w-[1440px] mx-auto flex flex-col items-center justify-center text-center text-white pt-20">
        <h1
          className="text-[48px] md:text-[80px] leading-[1.1]"
          style={{
            fontFamily: "Playfair Display, serif",
            fontWeight: 400, // Regular weight as per image look
          }}
        >
          Quiet luxury.
          <br />
          Timeless craft.
        </h1>
      </div>

      {/* Bottom Buttons */}
      <div className="absolute bottom-12 md:bottom-24 left-0 right-0 w-full max-w-[1440px] mx-auto px-4 md:px-[64px] flex justify-between items-end">
        <Button
          variant="outline"
          className="bg-transparent text-white border-white hover:bg-white hover:text-black transition-all px-8 py-6 h-auto text-[13px] tracking-[0.2em] uppercase rounded-none min-w-[200px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          SHOP COLLECTION
        </Button>

        <Button
          variant="outline"
          className="bg-transparent text-white border-white hover:bg-white hover:text-black transition-all px-8 py-6 h-auto text-[13px] tracking-[0.2em] uppercase rounded-none min-w-[200px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          OUR JOURNAL
        </Button>
      </div>

      {/* Floating Widget (KT Icons) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2">
        {/* Mocking the floating widget from the screenshot */}
        <div className="bg-black/20 backdrop-blur-md p-2 rounded-full flex gap-2 border border-white/10 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold">
            K
          </div>
          <div className="w-10 h-10 rounded-full bg-[#EC4899] flex items-center justify-center text-white font-bold">
            T
          </div>
        </div>
      </div>
    </section>
  );
}
