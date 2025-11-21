"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, User, Heart, ShoppingBag, Menu, Globe, Mail } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#EFECE5] sticky top-0 z-50">
      <div className="hidden md:block">
        <div className="w-[1440px] h-[182px] mx-auto pt-[8px] pb-[16px]">
          <div className="w-[1440px] h-full mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between h-5 text-[11px] text-gray-700">
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
                  <Mail className="h-3.5 w-3.5" />
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

            <div className="flex flex-col gap-4 items-center">
              <Link href="/" className="group">
                {/* Full Modett Logo */}
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

      <div className="md:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </button>

          <Link
            href="/"
            className="font-serif text-xl tracking-[0.2em] text-[#4A4034]"
          >
            MODETT
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/account/wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
            </Link>
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
