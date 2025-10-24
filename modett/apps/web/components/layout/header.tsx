"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Search, User, Heart, ShoppingBag, X, Globe, Phone, Mail } from "lucide-react"

const BACKGROUND_COLOR = "bg-[#f5f3ef]"
const ACCENT_TEXT = "text-[#8c6f5a]"
const ACCENT_TEXT_HOVER = "hover:text-[#5d4639]"
const NAV_TEXT = "text-[#445160]"
const NAV_TEXT_HOVER = "hover:text-[#2f3946]"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <header className={`sticky top-0 z-50 w-full ${BACKGROUND_COLOR}`}>
      {/* Utility Bar - Desktop Only */}
      <div className={`hidden lg:block ${BACKGROUND_COLOR}`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-2.5 text-xs">
            <div className={`flex items-center gap-6 ${ACCENT_TEXT}`}>
              <Link href="#" className={`flex items-center gap-1.5 transition-colors ${ACCENT_TEXT_HOVER}`}>
                <Globe className="h-3.5 w-3.5" />
                <span>Sri Lanka</span>
              </Link>
              <Link href="/contact" className={`flex items-center gap-1.5 transition-colors ${ACCENT_TEXT_HOVER}`}>
                <Phone className="h-3.5 w-3.5" />
                <span>Contact Us</span>
              </Link>
              <Link href="#newsletter" className={`flex items-center gap-1.5 transition-colors ${ACCENT_TEXT_HOVER}`}>
                <Mail className="h-3.5 w-3.5" />
                <span>Newsletter</span>
              </Link>
            </div>

            <div className={`flex items-center gap-5 ${ACCENT_TEXT}`}>
              <button aria-label="Search" className={`transition-colors ${ACCENT_TEXT_HOVER}`}>
                <Search className="h-4 w-4" />
              </button>
              <Link href="/wishlist" aria-label="Wishlist" className={`transition-colors ${ACCENT_TEXT_HOVER}`}>
                <Heart className="h-4 w-4" />
              </Link>
              <Link href="/account" aria-label="Account" className={`transition-colors ${ACCENT_TEXT_HOVER}`}>
                <User className="h-4 w-4" />
              </Link>
              <Link href="/cart" aria-label="Cart" className={`transition-colors ${ACCENT_TEXT_HOVER}`}>
                <ShoppingBag className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`${BACKGROUND_COLOR}`}>
        <div className="container mx-auto px-6">
          {/* Mobile Header */}
          <div className={`lg:hidden flex items-center justify-between py-4 ${ACCENT_TEXT}`}>
            <button
              className={`p-2 -ml-2 transition-colors ${ACCENT_TEXT_HOVER}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            <Link href="/" className="flex items-center">
              <span className="text-xl font-serif tracking-[0.2em] text-[#2f4050]">MODETT</span>
            </Link>

            <div className={`flex items-center gap-3`}>
              <button aria-label="Search" className={`transition-colors ${ACCENT_TEXT_HOVER} ${ACCENT_TEXT}`}>
                <Search className="h-5 w-5" />
              </button>
              <Link href="/cart" aria-label="Cart" className={`transition-colors ${ACCENT_TEXT} ${ACCENT_TEXT_HOVER}`}>
                <ShoppingBag className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex flex-col items-center py-6">
            {/* Logo */}
            <Link href="/" className="flex items-center mb-5 text-[#2f4050]">
              <span className="text-2xl font-serif tracking-[0.3em]">MODETT</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-10">
              <Link
                href="/catalog"
                className={`text-xs font-medium tracking-[0.15em] uppercase transition-colors ${NAV_TEXT} ${NAV_TEXT_HOVER}`}
              >
                SUMMER 2025
              </Link>
              <Link
                href="/catalog"
                className={`text-xs font-medium tracking-[0.15em] uppercase transition-colors ${NAV_TEXT} ${NAV_TEXT_HOVER}`}
              >
                COLLECTIONS
              </Link>
              <Link
                href="/about"
                className={`text-xs font-medium tracking-[0.15em] uppercase transition-colors ${NAV_TEXT} ${NAV_TEXT_HOVER}`}
              >
                BRAND PHILOSOPHY
              </Link>
              <Link
                href="/contact"
                className={`text-xs font-medium tracking-[0.15em] uppercase transition-colors ${NAV_TEXT} ${NAV_TEXT_HOVER}`}
              >
                CONTACT
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden border-t border-[#d9d2c4] ${BACKGROUND_COLOR}`}>
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
            <Link
              href="/catalog"
              className={`text-sm font-medium tracking-wider py-2 uppercase transition-colors ${NAV_TEXT} ${NAV_TEXT_HOVER}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              SUMMER 2025
            </Link>
            <Link
              href="/catalog"
              className={`text-sm font-medium tracking-wider py-2 uppercase transition-colors ${NAV_TEXT} ${NAV_TEXT_HOVER}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              COLLECTIONS
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium tracking-wider py-2 uppercase transition-colors ${NAV_TEXT} ${NAV_TEXT_HOVER}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              BRAND PHILOSOPHY
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium tracking-wider py-2 uppercase transition-colors ${NAV_TEXT} ${NAV_TEXT_HOVER}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              CONTACT
            </Link>
            <div className={`border-t border-[#d9d2c4] mt-4 pt-4 flex flex-col gap-3 text-sm ${ACCENT_TEXT}`}>
              <Link href="#" className={`py-2 flex items-center gap-2 transition-colors ${ACCENT_TEXT_HOVER}`}>
                <Globe className="h-4 w-4" />
                Sri Lanka
              </Link>
              <Link href="/contact" className={`py-2 flex items-center gap-2 transition-colors ${ACCENT_TEXT_HOVER}`}>
                <Phone className="h-4 w-4" />
                Contact Us
              </Link>
              <Link href="#newsletter" className={`py-2 flex items-center gap-2 transition-colors ${ACCENT_TEXT_HOVER}`}>
                <Mail className="h-4 w-4" />
                Newsletter
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
