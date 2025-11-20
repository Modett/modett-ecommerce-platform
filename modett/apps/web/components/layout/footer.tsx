import Link from 'next/link';
import { Facebook, Instagram, X, Youtube, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-wider mb-4">OUR PHILOSOPHY</p>
          <h3 className="font-serif text-2xl md:text-3xl text-white mb-8 max-w-3xl mx-auto">
            Join the Modern Muse community
          </h3>
          <p className="text-sm mb-8 max-w-2xl mx-auto">
            Enjoy latest trends, fashion insights and exclusive promotions
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" id="newsletter">
            <Input
              type="email"
              placeholder="Enter e-mail"
              className="bg-white text-gray-900 border-0"
            />
            <Button variant="default" className="whitespace-nowrap">
              SUBSCRIBE
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="text-white font-medium mb-4">Customer Care</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/shipping" className="hover:text-white">Shipping and Returns</Link></li>
              <li><Link href="/sizing" className="hover:text-white">Size Guide</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Philosophy</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-white">The Loom</Link></li>
              <li><Link href="/sustainability" className="hover:text-white">Our Sustainability</Link></li>
              <li><Link href="/craft" className="hover:text-white">The Craftsman</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">General Information</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/legal" className="hover:text-white">Legal Note</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Follow us</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white">
                <X className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-700 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl text-white">MODETT</span>
          </div>
          <div className="text-sm text-center">
            © 2024 Modern Muses Ltd. All rights reserved. | Privacy Policy | Terms of Service | General Warning
          </div>
        </div>
      </div>
    </footer>
  );
}
