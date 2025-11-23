import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, X, Youtube, Mail, Linkedin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section - Fixed 1440px, 80px padding */}
      <div className="w-full bg-[#3E5460]">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[80px] py-[48px] md:py-[64px]">
          {/* Container: Fill 1280px, Hug 84px, 80px gap */}
          <div className="w-full max-w-[1280px] flex flex-col md:flex-row justify-between items-start md:items-start gap-6 md:gap-[80px]" id="newsletter">
            {/* Left - Content: Vertical flow, Fill 560px, Fixed 54px height */}
            <div className="flex flex-col justify-start w-full md:w-[560px] h-auto md:h-[84px] max-w-[560px]">
              <h3
                className="text-[24px] md:text-[28px] font-semibold text-[#F8F5F2]"
                style={{
                  fontFamily: "Playfair Display, serif",
                  lineHeight: "130%",
                  letterSpacing: "0%"
                }}
              >
                Join the Modern Muse community
              </h3>
              <p className="text-[14px] leading-[20px] text-white/80">
                Get the latest fashion trends and exclusive offers
              </p>
            </div>

            {/* Right - Actions: Vertical flow, Fixed 459px, Hug 84px, 12px gap */}
            <div className="flex flex-col gap-[12px] w-full md:w-[459px]">
              <div className="flex flex-col sm:flex-row">
                <Input
                  type="email"
                  placeholder="Enter e-mail"
                  className="w-full sm:flex-1 h-[48px] bg-transparent border border-white/40 text-white placeholder:text-white/60 rounded-none focus:border-white"
                />
                <Button
                  variant="default"
                  className="h-[48px] px-6 bg-white text-[#3E5460] hover:bg-white/90 rounded-none flex items-center justify-center gap-2 text-[14px] tracking-[2px] uppercase"
                >
                  <Mail className="h-4 w-4" />
                  SUBSCRIBE
                </Button>
              </div>
              <p className="text-[12px] leading-[16px] text-white/60">
                By subscribing, you agree to our privacy policy and terms of service
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links Section - Fixed 1440px, Hug 524px, 80px gap, Alabaster bg */}
      <div className="w-full bg-[#E5E0D6]">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[80px] pt-[64px] pb-[60px]">
          <div className="flex flex-col gap-[80px]">
            {/* Links: Horizontal flow, Fill 1280px, Hug 220px, 119px gap */}
            <div className="flex flex-col md:flex-row justify-between gap-8 w-full max-w-[1280px]">
              <div>
                <h4
                  className="text-[18px] leading-[28px] font-normal mb-4"
                  style={{ fontFamily: "Raleway, sans-serif", color: "#262626" }}
                >
                  Customer Care
                </h4>
                <ul className="space-y-3 text-sm text-[#232D35]/70">
                  <li><Link href="/orders-returns" className="hover:text-[#232D35]">Orders and Returns</Link></li>
                  <li><Link href="/size-guide" className="hover:text-[#232D35]">Size Guide</Link></li>
                  <li><Link href="/shipment" className="hover:text-[#232D35]">Shipment</Link></li>
                  <li><Link href="/contact" className="hover:text-[#232D35]">Contact Us</Link></li>
                  <li><Link href="/wishlist" className="hover:text-[#232D35]">Wishlist</Link></li>
                  <li><Link href="/faq" className="hover:text-[#232D35]">FAQ</Link></li>
                </ul>
              </div>

              <div>
                <h4
                  className="text-[18px] leading-[28px] font-normal mb-4"
                  style={{ fontFamily: "Raleway, sans-serif", color: "#262626" }}
                >
                  Philosophy
                </h4>
                <ul className="space-y-3 text-sm text-[#232D35]/70">
                  <li><Link href="/the-lover" className="hover:text-[#232D35]">The Lover</Link></li>
                  <li><Link href="/the-creator" className="hover:text-[#232D35]">The Creator</Link></li>
                  <li><Link href="/the-company" className="hover:text-[#232D35]">The Company</Link></li>
                </ul>
              </div>

              <div>
                <h4
                  className="text-[18px] leading-[28px] font-normal mb-4"
                  style={{ fontFamily: "Raleway, sans-serif", color: "#262626" }}
                >
                  General Information
                </h4>
                <ul className="space-y-3 text-sm text-[#232D35]/70">
                  <li><Link href="/legal" className="hover:text-[#232D35]">Legal Area</Link></li>
                  <li><Link href="/privacy-policy" className="hover:text-[#232D35]">Privacy Policy</Link></li>
                  <li><Link href="/cookie-policy" className="hover:text-[#232D35]">Cookie Policy</Link></li>
                </ul>
              </div>

              <div>
                <h4
                  className="text-[18px] leading-[28px] font-normal mb-4"
                  style={{ fontFamily: "Raleway, sans-serif", color: "#262626" }}
                >
                  Follow us on
                </h4>
                <div className="flex gap-4">
                  <a href="#" className="hover:opacity-70">
                    <Facebook className="h-6 w-6 text-[#232D35]" fill="#232D35" />
                  </a>
                  <a href="#" className="hover:opacity-70">
                    <Instagram className="h-6 w-6 text-[#232D35]" />
                  </a>
                  <a href="#" className="hover:opacity-70">
                    <X className="h-6 w-6 text-[#232D35]" fill="#232D35" />
                  </a>
                  <a href="#" className="hover:opacity-70">
                    <Linkedin className="h-6 w-6 text-[#232D35]" fill="#232D35" />
                  </a>
                  <a href="#" className="hover:opacity-70">
                    <Youtube className="h-6 w-6 text-[#232D35]" />
                  </a>
                </div>
              </div>
            </div>

            {/* Frame 272: Vertical flow, Fill 1280px, Hug 124px, 16px gap */}
            <div className="flex flex-col items-center gap-[16px] w-full max-w-[1280px]">
              {/* Logo - 181px × 60px */}
              <Image
                src="/footer-logo.png"
                alt="Modett - Elegance, Amplified"
                width={181}
                height={60}
              />

              <div className="w-full max-w-[1280px] h-0 border-t border-[#232D35]" />

              {/* Copyright: Horizontal flow, Hug 585px, Hug 16px, 24px gap */}
              <div className="flex flex-row items-center gap-[24px]">
                <span
                  className="text-[10px] leading-[16px] font-semibold"
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    letterSpacing: "1.03px",
                    color: "#232D35"
                  }}
                >
                  © 2025 Modett Fashion. All rights reserved.
                </span>
                <Link
                  href="/privacy-policy"
                  className="text-[10px] leading-[16px] font-semibold hover:opacity-70"
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    letterSpacing: "1.03px",
                    color: "#232D35"
                  }}
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-[10px] leading-[16px] font-semibold hover:opacity-70"
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    letterSpacing: "1.03px",
                    color: "#232D35"
                  }}
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="text-[10px] leading-[16px] font-semibold hover:opacity-70"
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    letterSpacing: "1.03px",
                    color: "#232D35"
                  }}
                >
                  Cookies Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
