'use client';

import Link from 'next/link';
import { Search, User, Heart, ShoppingBag, Menu } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="border-b border-border py-2 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex gap-4">
            <Link href="#" className="hover:underline">SRI LANKA</Link>
            <span>|</span>
            <Link href="/contact" className="hover:underline">CONTACT US</Link>
            <span>|</span>
            <Link href="#newsletter" className="hover:underline">NEWSLETTER</Link>
          </div>
          <div className="flex gap-4 items-center">
            <button className="hover:text-accent">
              <Search className="h-4 w-4" />
            </button>
            <Link href="/account" className="hover:text-accent">
              <User className="h-4 w-4" />
            </Link>
            <Link href="/account/wishlist" className="hover:text-accent">
              <Heart className="h-4 w-4" />
            </Link>
            <Link href="/cart" className="hover:text-accent">
              <ShoppingBag className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex-1 md:flex-none text-center md:text-left">
            <span className="font-serif text-2xl tracking-wider">MODETT</span>
          </Link>

          <nav className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href="/collections/summer-2025" className="text-sm hover:text-accent transition-colors">
              SUMMER 2025
            </Link>
            <Link href="/collections" className="text-sm hover:text-accent transition-colors">
              COLLECTIONS
            </Link>
            <Link href="/about" className="text-sm hover:text-accent transition-colors">
              BRAND PHILOSOPHY
            </Link>
            <Link href="/contact" className="text-sm hover:text-accent transition-colors">
              CONTACT
            </Link>
          </nav>

          <div className="flex gap-4 items-center md:hidden">
            <button>
              <Search className="h-5 w-5" />
            </button>
            <Link href="/account">
              <User className="h-5 w-5" />
            </Link>
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <nav className="flex flex-col p-4 space-y-4">
            <Link href="/collections/summer-2025" className="text-sm hover:text-accent">
              SUMMER 2025
            </Link>
            <Link href="/collections" className="text-sm hover:text-accent">
              COLLECTIONS
            </Link>
            <Link href="/about" className="text-sm hover:text-accent">
              BRAND PHILOSOPHY
            </Link>
            <Link href="/contact" className="text-sm hover:text-accent">
              CONTACT
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
