"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Footer() {
  const [openSections, setOpenSections] = useState({
    customerCare: false,
    philosophy: false,
    generalInfo: false,
    followUs: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="w-full bg-[#3E5460]">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[80px] py-[48px] md:py-[64px]">
          <div
            className="w-full max-w-[1280px] flex flex-col md:flex-col lg:flex-row justify-between items-start md:items-start gap-6 lg:gap-[80px]"
            id="newsletter"
          >
            <div className="flex flex-col justify-start w-full md:w-[560px] h-auto md:h-[84px] max-w-[560px]">
              <h3
                className="text-[24px] md:text-[28px] font-semibold text-[#F8F5F2]"
                style={{
                  fontFamily: "Playfair Display, serif",
                  lineHeight: "130%",
                  letterSpacing: "0%",
                }}
              >
                Join the Modern Muse community
              </h3>
              <p className="text-[14px] leading-[20px] text-white/80">
                Get the latest fashion trends and exclusive offers
              </p>
            </div>

            <div className="flex flex-col gap-[12px] w-full md:w-full lg:w-[459px]">
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
                By subscribing, you agree to our privacy policy and terms of
                service
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#E5E0D6] border-t border-[#BBA496]">
        <div className="w-full md:max-w-[1440px] mx-auto px-0 md:px-[80px] pt-[20px] md:pt-[64px] pb-[40px] md:pb-[60px]">
          <div className="flex flex-col gap-[40px] md:gap-[80px]">
            <div className="flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row lg:justify-between gap-0 md:gap-x-8 md:gap-y-6 lg:gap-8 w-full md:max-w-[1280px] md:mx-auto">
              <div className="border-b border-[#BBA496] md:border-none pb-0 md:pb-0">
                <button
                  onClick={() => toggleSection("customerCare")}
                  className="flex justify-between items-center w-full max-w-[390px] md:max-w-none mx-auto h-[70px] px-[20px] md:px-0 md:h-auto md:cursor-default md:pointer-events-none"
                >
                  <h4
                    className="text-[18px] leading-[28px] font-normal"
                    style={{
                      fontFamily: "Raleway, sans-serif",
                      color: "#262626",
                    }}
                  >
                    Customer Care
                  </h4>
                  <span className="md:hidden">
                    {openSections.customerCare ? (
                      <Minus className="h-5 w-5 text-[#232D35]" />
                    ) : (
                      <Plus className="h-5 w-5 text-[#232D35]" />
                    )}
                  </span>
                </button>
                <ul
                  className={`flex flex-col gap-[16px] text-sm text-[#232D35]/70 mt-[8px] px-[20px] max-w-[390px] md:max-w-none mx-auto w-auto pb-[20px] md:mt-4 md:px-0 md:w-auto md:pb-0 ${openSections.customerCare ? "flex" : "hidden md:flex"}`}
                >
                  <li>
                    <Link
                      href="/orders-returns"
                      className="hover:text-[#232D35]"
                    >
                      Orders and Returns
                    </Link>
                  </li>
                  <li>
                    <Link href="/size-guide" className="hover:text-[#232D35]">
                      Size Guide
                    </Link>
                  </li>
                  <li>
                    <Link href="/shipment" className="hover:text-[#232D35]">
                      Shipment
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-[#232D35]">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/wishlist" className="hover:text-[#232D35]">
                      Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:text-[#232D35]">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="border-b border-[#BBA496] md:border-none pb-0 md:pb-0">
                <button
                  onClick={() => toggleSection("philosophy")}
                  className="flex justify-between items-center w-full max-w-[390px] md:max-w-none mx-auto h-[70px] px-[20px] md:px-0 md:h-auto md:cursor-default md:pointer-events-none"
                >
                  <h4
                    className="text-[18px] leading-[28px] font-normal"
                    style={{
                      fontFamily: "Raleway, sans-serif",
                      color: "#262626",
                    }}
                  >
                    Philosophy
                  </h4>
                  <span className="md:hidden">
                    {openSections.philosophy ? (
                      <Minus className="h-5 w-5 text-[#232D35]" />
                    ) : (
                      <Plus className="h-5 w-5 text-[#232D35]" />
                    )}
                  </span>
                </button>
                <ul
                  className={`flex flex-col gap-[16px] text-sm text-[#232D35]/70 mt-[8px] px-[20px] max-w-[390px] md:max-w-none mx-auto w-auto pb-[20px] md:mt-4 md:px-0 md:w-auto md:pb-0 ${openSections.philosophy ? "flex" : "hidden md:flex"}`}
                >
                  <li>
                    <Link href="/the-lover" className="hover:text-[#232D35]">
                      The Lover
                    </Link>
                  </li>
                  <li>
                    <Link href="/the-creator" className="hover:text-[#232D35]">
                      The Creator
                    </Link>
                  </li>
                  <li>
                    <Link href="/the-company" className="hover:text-[#232D35]">
                      The Company
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="border-b border-[#BBA496] md:border-none pb-0 md:pb-0">
                <button
                  onClick={() => toggleSection("generalInfo")}
                  className="flex justify-between items-center w-full max-w-[390px] md:max-w-none mx-auto h-[70px] px-[20px] md:px-0 md:h-auto md:cursor-default md:pointer-events-none"
                >
                  <h4
                    className="text-[18px] leading-[28px] font-normal"
                    style={{
                      fontFamily: "Raleway, sans-serif",
                      color: "#262626",
                    }}
                  >
                    General Information
                  </h4>
                  <span className="md:hidden">
                    {openSections.generalInfo ? (
                      <Minus className="h-5 w-5 text-[#232D35]" />
                    ) : (
                      <Plus className="h-5 w-5 text-[#232D35]" />
                    )}
                  </span>
                </button>
                <ul
                  className={`flex flex-col gap-[16px] text-sm text-[#232D35]/70 mt-[8px] px-[20px] max-w-[390px] md:max-w-none mx-auto w-auto pb-[20px] md:mt-4 md:px-0 md:w-auto md:pb-0 ${openSections.generalInfo ? "flex" : "hidden md:flex"}`}
                >
                  <li>
                    <Link href="/legal" className="hover:text-[#232D35]">
                      Legal Area
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="hover:text-[#232D35]"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="hover:text-[#232D35]"
                    >
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Follow us on - Non-collapsible, centered on mobile, left-aligned on tablet+ */}
              <div className="border-b border-[#BBA496] md:border-none pb-0 md:pb-0">
                <div className="flex flex-col items-center md:items-start max-w-[390px] md:max-w-none mx-auto md:mx-0 py-[20px] md:py-0 px-[20px] md:px-0">
                  <h4
                    className="text-[18px] leading-[28px] font-normal text-center md:text-left mb-[16px] md:mb-4"
                    style={{
                      fontFamily: "Raleway, sans-serif",
                      color: "#232D35",
                      letterSpacing: "0%",
                    }}
                  >
                    Follow us on
                  </h4>
                  {/* Social icons: Full width on mobile centered, left-aligned on tablet+ */}
                  <div className="flex items-center gap-[24px] w-full md:w-auto h-[32px] md:h-auto justify-center md:justify-start">
                    <a href="#" className="hover:opacity-70">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M24 2.66669H20C18.2319 2.66669 16.5362 3.36907 15.286 4.61931C14.0358 5.86955 13.3334 7.56524 13.3334 9.33335V13.3334H9.33337V18.6667H13.3334V29.3334H18.6667V18.6667H22.6667L24 13.3334H18.6667V9.33335C18.6667 8.97973 18.8072 8.64059 19.0572 8.39054C19.3073 8.14049 19.6464 8.00002 20 8.00002H24V2.66669Z"
                          fill="#232D35"
                        />
                      </svg>
                    </a>
                    <a href="#" className="hover:opacity-70">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.6667 2.66669H9.33333C5.65144 2.66669 2.66667 5.65146 2.66667 9.33335V22.6667C2.66667 26.3486 5.65144 29.3334 9.33333 29.3334H22.6667C26.3486 29.3334 29.3333 26.3486 29.3333 22.6667V9.33335C29.3333 5.65146 26.3486 2.66669 22.6667 2.66669Z"
                          stroke="#232D35"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21.3333 15.16C21.4977 16.2696 21.3084 17.4028 20.7937 18.3988C20.2791 19.3948 19.4656 20.2016 18.4653 20.7082C17.465 21.2147 16.3302 21.3949 15.2221 21.2218C14.114 21.0486 13.0894 20.5311 12.2958 19.7375C11.5022 18.9439 10.9847 17.9193 10.8115 16.8112C10.6384 15.7031 10.8186 14.5683 11.3251 13.568C11.8317 12.5677 12.6385 11.7542 13.6345 11.2396C14.6305 10.7249 15.7637 10.5356 16.8733 10.7C18.0051 10.868 19.0545 11.3903 19.8487 12.1846C20.643 12.9788 21.1653 14.0282 21.3333 15.16Z"
                          stroke="#232D35"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M23.3333 8.66669H23.3467"
                          stroke="#232D35"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                    <a href="#" className="hover:opacity-70">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M24.4 3H28.5L19.1 13.7L30 29H21.4L14.7 20.2L7 29H2.9L13 17.5L2.5 3H11.3L17.3 11L24.4 3ZM22.9 26.4H25.3L9.7 5.4H7.1L22.9 26.4Z"
                          fill="#232D35"
                        />
                      </svg>
                    </a>
                    <a href="#" className="hover:opacity-70">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21.3334 10.6667C23.4551 10.6667 25.4899 11.5095 26.9902 13.0098C28.4905 14.5101 29.3334 16.5449 29.3334 18.6667V28H24.0001V18.6667C24.0001 17.9594 23.719 17.2811 23.219 16.781C22.7189 16.281 22.0406 16 21.3334 16C20.6261 16 19.9478 16.281 19.4477 16.781C18.9477 17.2811 18.6667 17.9594 18.6667 18.6667V28H13.3334V18.6667C13.3334 16.5449 14.1763 14.5101 15.6765 13.0098C17.1768 11.5095 19.2116 10.6667 21.3334 10.6667Z"
                          fill="#232D35"
                        />
                        <path
                          d="M8.00002 12H2.66669V28H8.00002V12Z"
                          fill="#232D35"
                        />
                        <path
                          d="M5.33335 8.00002C6.80611 8.00002 8.00002 6.80611 8.00002 5.33335C8.00002 3.86059 6.80611 2.66669 5.33335 2.66669C3.86059 2.66669 2.66669 3.86059 2.66669 5.33335C2.66669 6.80611 3.86059 8.00002 5.33335 8.00002Z"
                          fill="#232D35"
                        />
                      </svg>
                    </a>
                    <a href="#" className="hover:opacity-70">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M30.0547 9.24C29.9212 8.7147 29.6509 8.23353 29.2713 7.8435C28.8917 7.45347 28.4165 7.16877 27.8934 7.01867C25.5067 6.4 16 6.4 16 6.4C16 6.4 6.49337 6.4 4.10671 7.06667C3.58356 7.21678 3.10837 7.50148 2.72875 7.8915C2.34914 8.28153 2.0789 8.7627 1.94538 9.288C1.48689 11.7145 1.26299 14.1789 1.27604 16.648C1.26026 19.1336 1.48416 21.6147 1.94538 24.0573C2.09271 24.5669 2.36884 25.0306 2.74713 25.4052C3.12542 25.7798 3.59256 26.0522 4.10671 26.1973C6.49337 26.864 16 26.864 16 26.864C16 26.864 25.5067 26.864 27.8934 26.1973C28.4165 26.0472 28.8917 25.7625 29.2713 25.3725C29.6509 24.9825 29.9212 24.5013 30.0547 23.976C30.5104 21.5662 30.7343 19.1189 30.724 16.6667C30.7398 14.1811 30.5159 11.6999 30.0547 9.25733V9.24Z"
                          stroke="#232D35"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.0667 21.0373L20.8 16.6666L13.0667 12.296V21.0373Z"
                          fill="#232D35"
                          stroke="#232D35"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Frame 272: Logo and Copyright section */}
            <div className="flex flex-col items-center gap-[16px] w-full max-w-[390px] md:max-w-[1280px] mx-auto px-[20px] md:px-0">
              {/* Logo - 181px × 60px */}
              <div className="w-full flex justify-center">
                <Image
                  src="/footer-logo.png"
                  alt="Modett - Elegance, Amplified"
                  width={181}
                  height={60}
                  className="w-[181px] h-[60px]"
                />
              </div>

              {/* Copyright: Mobile 320px fixed, Tablet/Desktop full width with links */}
              <div className="flex flex-col md:flex-row items-center justify-center w-[320px] md:w-full h-auto p-[10px] gap-[10px] md:gap-[24px] border-t border-[#232D35]">
                <span
                  className="text-[10px] leading-[16px] font-semibold text-center whitespace-nowrap"
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    letterSpacing: "1.03px",
                    color: "#232D35",
                  }}
                >
                  © 2025 Modett Fashion. All rights reserved.
                </span>
                <div className="hidden md:flex flex-col md:flex-row items-center gap-[8px] md:gap-[24px]">
                  <Link
                    href="/privacy-policy"
                    className="text-[10px] leading-[16px] font-semibold hover:opacity-70"
                    style={{
                      fontFamily: "Raleway, sans-serif",
                      letterSpacing: "1.03px",
                      color: "#232D35",
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
                      color: "#232D35",
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
                      color: "#232D35",
                    }}
                  >
                    Cookies Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
