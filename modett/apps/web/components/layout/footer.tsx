"use client";

import * as React from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";

// ============================================================================
// Footer Data
// ============================================================================

const FOOTER_SECTIONS = {
  customerCare: {
    title: "Customer Care",
    links: [
      { label: "Orders and Returns", href: "/orders" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Shipment", href: "/shipment" },
      { label: "Contact Us", href: "/contact" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  philosophy: {
    title: "Philosophy",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Our Craftmanship", href: "/craftmanship" },
      { label: "The Journal", href: "/journal" },
    ],
  },
  generalInfo: {
    title: "General Information",
    links: [
      { label: "Legal Area", href: "/legal" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/privacy" },
    ],
  },
} as const;

const SOCIAL_LINKS = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
] as const;

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Footer link component
 */
const FooterLink = ({ href, label }: { href: string; label: string }) => (
  <li>
    <Link
      href={href}
      className="text-sm text-gray-600 hover:text-accent transition-colors"
    >
      {label}
    </Link>
  </li>
);

/**
 * Social media icon link
 */
const SocialLink = ({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}) => (
  <Link
    href={href}
    aria-label={label}
    className="text-gray-700 hover:text-accent transition-colors"
  >
    <Icon className="h-5 w-5" />
  </Link>
);

/**
 * Social media links row
 */
const SocialLinks = () => (
  <div className="flex gap-4">
    {SOCIAL_LINKS.map(({ icon, label, href }) => (
      <SocialLink key={label} icon={icon} label={label} href={href} />
    ))}
  </div>
);

/**
 * Mobile accordion section
 */
const MobileAccordionSection = ({
  title,
  links,
  isOpen,
  onToggle,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div className="py-4">
    {/* Section Header/Toggle */}
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left"
      aria-expanded={isOpen}
    >
      <h3 className="text-base font-normal text-gray-600">{title}</h3>
      <span className="text-2xl text-gray-600 font-light">
        {isOpen ? "−" : "+"}
      </span>
    </button>

    {/* Section Links (shown when open) */}
    {isOpen && (
      <ul className="mt-4 space-y-3">
        {links.map(({ label, href }) => (
          <FooterLink key={label} href={href} label={label} />
        ))}
      </ul>
    )}
  </div>
);

/**
 * Mobile follow us section (always visible)
 */
const MobileFollowSection = () => (
  <div className="py-4 flex items-center justify-between">
    <h3 className="text-base font-normal text-gray-600">Follow us on</h3>
    <SocialLinks />
  </div>
);

/**
 * Mobile footer accordion layout
 */
const MobileFooter = ({
  openSections,
  toggleSection,
}: {
  openSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) => (
  <div className="lg:hidden space-y-0 divide-y divide-gray-300">
    {/* Customer Care Section */}
    <MobileAccordionSection
      title={FOOTER_SECTIONS.customerCare.title}
      links={FOOTER_SECTIONS.customerCare.links}
      isOpen={openSections.customerCare}
      onToggle={() => toggleSection("customerCare")}
    />

    {/* Philosophy Section */}
    <MobileAccordionSection
      title={FOOTER_SECTIONS.philosophy.title}
      links={FOOTER_SECTIONS.philosophy.links}
      isOpen={openSections.philosophy}
      onToggle={() => toggleSection("philosophy")}
    />

    {/* General Information Section */}
    <MobileAccordionSection
      title={FOOTER_SECTIONS.generalInfo.title}
      links={FOOTER_SECTIONS.generalInfo.links}
      isOpen={openSections.generalInfo}
      onToggle={() => toggleSection("generalInfo")}
    />

    {/* Social Media Links */}
    <MobileFollowSection />
  </div>
);

/**
 * Desktop footer column
 */
const DesktopFooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) => (
  <div>
    <h3 className="text-sm font-semibold tracking-wide uppercase mb-4">
      {title}
    </h3>
    <ul className="space-y-3">
      {links.map(({ label, href }) => (
        <FooterLink key={label} href={href} label={label} />
      ))}
    </ul>
  </div>
);

/**
 * Desktop social media column
 */
const DesktopSocialColumn = () => (
  <div>
    <h3 className="text-sm font-semibold tracking-wide uppercase mb-4">
      Follow us
    </h3>
    <div className="flex gap-4 mb-6">
      {SOCIAL_LINKS.map(({ icon, label, href }) => (
        <SocialLink key={label} icon={icon} label={label} href={href} />
      ))}
    </div>
  </div>
);

/**
 * Desktop footer grid layout
 */
const DesktopFooter = () => (
  <div className="hidden lg:grid grid-cols-4 gap-12">
    {/* Customer Care Column */}
    <DesktopFooterColumn
      title={FOOTER_SECTIONS.customerCare.title}
      links={FOOTER_SECTIONS.customerCare.links}
    />

    {/* Philosophy Column */}
    <DesktopFooterColumn
      title={FOOTER_SECTIONS.philosophy.title}
      links={FOOTER_SECTIONS.philosophy.links}
    />

    {/* General Information Column */}
    <DesktopFooterColumn
      title={FOOTER_SECTIONS.generalInfo.title}
      links={FOOTER_SECTIONS.generalInfo.links}
    />

    {/* Social Media Column */}
    <DesktopSocialColumn />
  </div>
);

/**
 * Footer bottom section with logo and copyright
 */
const FooterBottom = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-12 pt-8 border-t border-gray-300">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-xl font-serif tracking-wider">MODETT</span>
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-600">
          © {currentYear} Modett. All rights reserved. | Privacy Policy | Cookie
          Settings
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// Main Footer Component
// ============================================================================

export function Footer() {
  // ============================================================================
  // State Management - Mobile Accordion
  // ============================================================================

  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    customerCare: true,
    philosophy: false,
    generalInfo: false,
  });

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <footer className="bg-[#ede9e3] border-t border-gray-300">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Mobile Layout: Accordion */}
        <MobileFooter openSections={openSections} toggleSection={toggleSection} />

        {/* Desktop Layout: Grid */}
        <DesktopFooter />

        {/* Bottom Section: Logo & Copyright */}
        <FooterBottom />
      </div>
    </footer>
  );
}
