"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SIDEBAR_LINKS = [
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Order history", href: "/account/orders" },
  { label: "Personal Details", href: "/account/details" },
  { label: "User Details", href: "/account/user-details" },
  { label: "Addresses", href: "/account/addresses" },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full md:w-[220px] flex-shrink-0">
      <div className="flex flex-col gap-6">
        {SIDEBAR_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-[16px] transition-colors font-normal hover:text-[#C78869]",
                isActive ? "text-[#C78869]" : "text-[#765C4D]",
              )}
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
