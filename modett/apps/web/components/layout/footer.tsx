import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#f5f3ef] border-t border-gray-200">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Customer Care */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase mb-4">
              Customer Care
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shipping"
                  className="text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  Shipping and Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/size-guide"
                  className="text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/care"
                  className="text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  Care Instructions
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Philosophy */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase mb-4">
              Philosophy
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/sustainability"
                  className="text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  Sustainability
                </Link>
              </li>
              <li>
                <Link
                  href="/craftmanship"
                  className="text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  Our Craftmanship
                </Link>
              </li>
              <li>
                <Link
                  href="/journal"
                  className="text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  The Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Information */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase mb-4">
              Legal Information
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/legal"
                  className="text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  Legal Area
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase mb-4">
              Follow us
            </h3>
            <div className="flex gap-4 mb-6">
              <Link href="#" aria-label="Facebook" className="hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Instagram" className="hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Twitter" className="hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="YouTube" className="hover:text-accent transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Email" className="hover:text-accent transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <span className="text-xl font-serif tracking-wider">MODETT</span>
            </div>
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} Modett. All rights reserved. | Privacy Policy | Cookie Settings
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}