"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Search, User, Heart, ShoppingBag, X, Globe, Phone, Mail } from "lucide-react";

// ============================================================================
// Theme Constants
// ============================================================================

const THEME = {
  background: "bg-[#f5f3ef]",
  accent: {
    text: "text-[#8c6f5a]",
    hover: "hover:text-[#5d4639]",
  },
  nav: {
    text: "text-[#445160]",
    hover: "hover:text-[#2f3946]",
  },
  logo: "text-[#2f4050]",
  border: "border-[#d9d2c4]",
} as const;

// ============================================================================
// Navigation Data
// ============================================================================

const MAIN_NAV_LINKS = [
  { label: "SUMMER 2025", href: "/catalog" },
  { label: "COLLECTIONS", href: "/catalog" },
  { label: "BRAND PHILOSOPHY", href: "/about" },
  { label: "CONTACT", href: "/contact" },
] as const;

const UTILITY_LINKS = [
  { label: "Sri Lanka", href: "#", icon: Globe },
  { label: "Contact Us", href: "/contact", icon: Phone },
  { label: "Newsletter", href: "#newsletter", icon: Mail },
] as const;

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Logo component
 */
const Logo = ({ className = "" }: { className?: string }) => (
  <Link href="/" className={`flex items-center ${className}`}>
    <span className={`font-serif ${THEME.logo}`}>MODETT</span>
  </Link>
);

/**
 * Icon button component
 */
const IconButton = ({
  icon: Icon,
  label,
  href,
  onClick,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}) => {
  const buttonClass = `transition-colors ${THEME.accent.text} ${THEME.accent.hover} ${className}`;

  if (href) {
    return (
      <Link href={href} aria-label={label} className={buttonClass}>
        <Icon className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <button aria-label={label} className={buttonClass} onClick={onClick}>
      <Icon className="h-4 w-4" />
    </button>
  );
};

/**
 * Utility bar for desktop - shows location, contact, newsletter, and action icons
 */
const UtilityBar = () => (
  <div className={`hidden lg:block ${THEME.background}`}>
    <div className="container mx-auto px-6">
      <div className="flex items-center justify-between py-2.5 text-xs">
        {/* Left Side: Utility Links */}
        <div className={`flex items-center gap-6 ${THEME.accent.text}`}>
          {UTILITY_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-1.5 transition-colors ${THEME.accent.hover}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Right Side: Action Icons */}
        <div className={`flex items-center gap-5 ${THEME.accent.text}`}>
          <IconButton icon={Search} label="Search" />
          <IconButton icon={Heart} label="Wishlist" href="/wishlist" />
          <IconButton icon={User} label="Account" href="/account" />
          <IconButton icon={ShoppingBag} label="Cart" href="/cart" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Desktop navigation
 */
const DesktopNav = () => (
  <div className="hidden lg:flex flex-col items-center py-6">
    {/* Logo */}
    <Logo className="mb-5 text-2xl tracking-[0.3em]" />

    {/* Navigation Links */}
    <nav className="flex items-center gap-10">
      {MAIN_NAV_LINKS.map(({ label, href }) => (
        <Link
          key={label}
          href={href}
          className={`text-xs font-medium tracking-[0.15em] uppercase transition-colors ${THEME.nav.text} ${THEME.nav.hover}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  </div>
);

/**
 * Mobile header bar
 */
const MobileHeaderBar = ({
  isMobileMenuOpen,
  toggleMobileMenu,
}: {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}) => (
  <div className={`lg:hidden flex items-center justify-between py-4 ${THEME.accent.text}`}>
    {/* Menu Toggle Button */}
    <button
      className={`p-2 -ml-2 transition-colors ${THEME.accent.hover}`}
      onClick={toggleMobileMenu}
      aria-label="Toggle menu"
      aria-expanded={isMobileMenuOpen}
    >
      {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>

    {/* Logo */}
    <Logo className="text-xl tracking-[0.2em]" />

    {/* Action Icons */}
    <div className="flex items-center gap-3">
      <IconButton icon={Search} label="Search" className="h-5 w-5" />
      <IconButton icon={ShoppingBag} label="Cart" href="/cart" className="h-5 w-5" />
    </div>
  </div>
);

/**
 * Mobile menu dropdown
 */
const MobileMenu = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className={`lg:hidden border-t ${THEME.border} ${THEME.background}`}>
      <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
        {/* Main Navigation Links */}
        {MAIN_NAV_LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className={`text-sm font-medium tracking-wider py-2 uppercase transition-colors ${THEME.nav.text} ${THEME.nav.hover}`}
            onClick={onClose}
          >
            {label}
          </Link>
        ))}

        {/* Utility Links (Mobile) */}
        <div className={`border-t ${THEME.border} mt-4 pt-4 flex flex-col gap-3 text-sm ${THEME.accent.text}`}>
          {UTILITY_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={`py-2 flex items-center gap-2 transition-colors ${THEME.accent.hover}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

// ============================================================================
// Main Header Component
// ============================================================================

export function Header() {
  // ============================================================================
  // State Management
  // ============================================================================

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <header className={`sticky top-0 z-50 w-full ${THEME.background}`}>
      {/* Desktop Utility Bar (hidden on mobile) */}
      <UtilityBar />

      {/* Main Header Content */}
      <div className={THEME.background}>
        <div className="container mx-auto px-6">
          {/* Mobile Header (visible on mobile only) */}
          <MobileHeaderBar
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />

          {/* Desktop Header (hidden on mobile) */}
          <DesktopNav />
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </header>
  );
}
