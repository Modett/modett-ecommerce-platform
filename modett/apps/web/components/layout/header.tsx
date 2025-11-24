"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  Globe,
  Mail,
  Headphones,
} from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[#EFECE5] sticky top-0 z-50 overflow-x-hidden">
      <div className="hidden md:block w-full">
        <div className="w-full max-w-[1440px] mx-auto pt-[8px] pb-[16px] px-[64px]">
          <div className="flex flex-col gap-[24px]">
            <div className="flex items-center justify-between h-[20px] text-[11px] text-gray-700">
              <div className="flex items-center gap-6">
                <Link
                  href="#"
                  className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Sri Lanka</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                >
                  <Headphones className="h-3.5 w-3.5" />
                  <span>Contact Us</span>
                </Link>
                <Link
                  href="#newsletter"
                  className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Newsletter</span>
                </Link>
              </div>

              {/* Right Icons */}
              <div className="flex items-center gap-5">
                <button className="hover:text-gray-900 transition-colors">
                  <Search className="h-[18px] w-[18px]" />
                </button>
                <Link
                  href="/account/wishlist"
                  className="hover:text-gray-900 transition-colors"
                >
                  <Heart className="h-[18px] w-[18px]" />
                </Link>
                <Link
                  href="/account"
                  className="hover:text-gray-900 transition-colors"
                >
                  <User className="h-[18px] w-[18px]" />
                </Link>
                <Link
                  href="/cart"
                  className="hover:text-gray-900 transition-colors"
                >
                  <ShoppingBag className="h-[18px] w-[18px]" />
                </Link>
              </div>
            </div>

            {/* Logo & Navigation */}
            <div className="flex flex-col items-center gap-4">
              <Link href="/" className="group">
                <Image
                  src="/logo.png"
                  alt="Modett"
                  width={240}
                  height={64}
                  className="group-hover:opacity-90 transition-opacity"
                />
              </Link>

              <nav className="flex items-center gap-12 text-[11px] tracking-[0.15em] font-medium text-gray-700">
                <Link
                  href="/collections/summer-2025"
                  className="hover:text-gray-900 transition-colors"
                >
                  SUMMER 2025
                </Link>
                <Link
                  href="/collections"
                  className="hover:text-gray-900 transition-colors"
                >
                  COLLECTIONS
                </Link>
                <Link
                  href="/about"
                  className="hover:text-gray-900 transition-colors"
                >
                  BRAND PHILOSOPHY
                </Link>
                <Link
                  href="/contact"
                  className="hover:text-gray-900 transition-colors"
                >
                  CONTACT
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header: 390px width, 82px height, bottom border 1px */}
      <div className="md:hidden border-b border-[#E5E0D6]">
        <div className="flex flex-col h-[82px]">
          {/* Top Row: Sri Lanka, Contact Us, Newsletter - 18px margins on both sides */}
          <div className="flex items-center justify-between mx-[18px] pt-[7px] text-[12px] font-medium text-[#7A6A5C]">
            <Link
              href="#"
              className="flex items-center gap-2 hover:opacity-70"
            >
              <Globe className="h-4 w-4" />
              <span>Sri Lanka</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 hover:opacity-70"
            >
              <Headphones className="h-4 w-4" />
              <span>Contact Us</span>
            </Link>
            <Link
              href="#newsletter"
              className="flex items-center gap-2 hover:opacity-70"
            >
              <Mail className="h-4 w-4" />
              <span>Newsletter</span>
            </Link>
          </div>

          {/* Bottom Row: Menu | Logo | Search, Cart */}
          <div className="flex items-center justify-between flex-1 px-4">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-[20px] h-[20px] flex items-center justify-center">
              <Menu className="w-[20px] h-[20px] text-[#4A4034]" />
            </button>

            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <Image src="/footer-logo.png" alt="Modett - Elegance, Amplified" width={157} height={42} />
            </Link>

            <div className="flex items-center gap-4 w-[112px] h-[20px] justify-end">
              <button className="hover:opacity-70 w-[20px] h-[20px] flex items-center justify-center">
                <Search className="w-[20px] h-[20px] text-[#765C4D]" />
              </button>
              <Link href="/cart" className="hover:opacity-70 w-[20px] h-[20px] flex items-center justify-center">
                <ShoppingBag className="w-[20px] h-[20px] text-[#765C4D]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-[#DDD9D0] bg-[#EFECE5]">
            <nav className="flex flex-col py-4 px-4">
              <Link
                href="/collections/summer-2025"
                className="py-3 text-sm tracking-wider hover:text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                SUMMER 2025
              </Link>
              <Link
                href="/collections"
                className="py-3 text-sm tracking-wider hover:text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                COLLECTIONS
              </Link>
              <Link
                href="/about"
                className="py-3 text-sm tracking-wider hover:text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                BRAND PHILOSOPHY
              </Link>
              <Link
                href="/contact"
                className="py-3 text-sm tracking-wider hover:text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                CONTACT
              </Link>
              <div className="flex items-center gap-6 pt-4 mt-4 border-t border-[#DDD9D0]">
                <button>
                  <Search className="h-5 w-5" />
                </button>
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
