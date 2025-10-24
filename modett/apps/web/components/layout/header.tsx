"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Search, User, Heart, ShoppingBag, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      {/* Utility Bar - Desktop Only */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-xs">
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:underline">
                My Links
              </Link>
              <Link href="#" className="hover:underline">
                Contact Us
              </Link>
              <Link href="#" className="hover:underline">
                Newsletter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-serif tracking-wider">MODETT</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/catalog"
              className="text-sm font-medium tracking-wide hover:text-accent transition-colors"
            >
              SUMMER 2025
            </Link>
            <Link
              href="/catalog"
              className="text-sm font-medium tracking-wide hover:text-accent transition-colors"
            >
              COLLECTIONS
            </Link>
            <span className="text-2xl font-serif">MODETT</span>
            <Link
              href="/about"
              className="text-sm font-medium tracking-wide hover:text-accent transition-colors"
            >
              BRAND PHILOSOPHY
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium tracking-wide hover:text-accent transition-colors"
            >
              CONTACT
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button aria-label="Search" className="p-2">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/account" aria-label="Account" className="p-2">
              <User className="h-5 w-5" />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="p-2">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href="/cart" aria-label="Cart" className="p-2 relative">
              <ShoppingBag className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <Link
              href="/catalog"
              className="text-sm font-medium tracking-wide py-2 hover:text-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              SUMMER 2025
            </Link>
            <Link
              href="/catalog"
              className="text-sm font-medium tracking-wide py-2 hover:text-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              COLLECTIONS
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium tracking-wide py-2 hover:text-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              BRAND PHILOSOPHY
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium tracking-wide py-2 hover:text-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              CONTACT
            </Link>
            <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col gap-2">
              <Link href="#" className="text-sm py-2">
                My Links
              </Link>
              <Link href="#" className="text-sm py-2">
                Contact Us
              </Link>
              <Link href="#" className="text-sm py-2">
                Newsletter
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}