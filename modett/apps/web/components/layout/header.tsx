"use client";

import Link from "next/link";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  Mail,
  Globe,
} from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-50">
      {/* Top Bar - Desktop Only */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
          <div className="flex items-center justify-between h-12 text-xs text-gray-600">
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="flex items-center gap-2 hover:text-gray-900"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Sri Lanka</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 hover:text-gray-900"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Contact Us</span>
              </Link>
              <Link
                href="#newsletter"
                className="flex items-center gap-2 hover:text-gray-900"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Newsletter</span>
              </Link>
            </div>
            <div className="flex items-center gap-5">
              <button className="hover:text-gray-900">
                <Search className="h-4 w-4" />
              </button>
              <Link href="/account/wishlist" className="hover:text-gray-900">
                <Heart className="h-4 w-4" />
              </Link>
              <Link href="/account" className="hover:text-gray-900">
                <User className="h-4 w-4" />
              </Link>
              <Link href="/cart" className="hover:text-gray-900">
                <ShoppingBag className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo Section */}
          <div className="flex items-center justify-between h-16 md:h-16">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo - Centered */}
            <div className="flex-1 flex justify-center md:justify-center">
              <Link href="/" className="font-serif text-2xl tracking-[0.2em]">
                MODETT
              </Link>
            </div>

            {/* Mobile Icons */}
            <div className="flex md:hidden items-center gap-4">
              <Link href="/account">
                <User className="h-5 w-5" />
              </Link>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation - Below Logo */}
          <nav className="hidden md:flex items-center justify-center gap-12 pb-4 text-xs tracking-widest">
            <Link
              href="/collections/summer-2025"
              className="hover:text-gray-600 transition-colors"
            >
              SUMMER 2025
            </Link>
            <Link
              href="/collections"
              className="hover:text-gray-600 transition-colors"
            >
              COLLECTIONS
            </Link>
            <Link
              href="/about"
              className="hover:text-gray-600 transition-colors"
            >
              BRAND PHILOSOPHY
            </Link>
            <Link
              href="/contact"
              className="hover:text-gray-600 transition-colors"
            >
              CONTACT
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
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
            <div className="flex items-center gap-6 pt-4 mt-4 border-t border-gray-200">
              <button>
                <Search className="h-5 w-5" />
              </button>
              <Link href="/account/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
