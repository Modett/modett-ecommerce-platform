"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Settings,
  Users,
  ShoppingBag,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Warehouse,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Inventory",
    href: "/admin/inventory",
    icon: Warehouse,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

// ============================================================================
// ADMIN LAYOUT COMPONENT
// ============================================================================

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    // Clear authentication token
    localStorage.removeItem("authToken");
    // Clear any other session data
    localStorage.removeItem("user");
    // Redirect to login page
    router.push("/login");
    // Force a hard reload to clear any cached state
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F5F2]">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-[#BBA496]/30 hidden md:flex flex-col fixed inset-y-0 left-0">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#BBA496]/30 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#232D35] hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-[#232D35] rounded-sm flex items-center justify-center">
              <span
                className="text-white text-xl font-bold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                M
              </span>
            </div>
            <span
              className="text-lg font-normal tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Modett Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#232D35] text-white"
                    : "text-[#8B7355] hover:bg-[#F8F5F2] hover:text-[#232D35]"
                }`}
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#BBA496]/30">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#BBA496] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium text-[#232D35] truncate"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Admin User
              </p>
              <p
                className="text-xs text-[#8B7355] truncate"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                admin@modett.com
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#8B7355] hover:text-[#232D35] hover:bg-[#F8F5F2] rounded-lg transition-colors"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-[#BBA496]/30 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#BBA496]/30">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#232D35]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 bg-[#232D35] rounded-sm flex items-center justify-center">
              <span
                className="text-white text-xl font-bold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                M
              </span>
            </div>
            <span
              className="text-lg font-normal tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Modett Admin
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-[#8B7355] hover:text-[#232D35] hover:bg-[#F8F5F2] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#232D35] text-white"
                    : "text-[#8B7355] hover:bg-[#F8F5F2] hover:text-[#232D35]"
                }`}
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#BBA496]/30 bg-white">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#BBA496] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium text-[#232D35] truncate"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Admin User
              </p>
              <p
                className="text-xs text-[#8B7355] truncate"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                admin@modett.com
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#8B7355] hover:text-[#232D35] hover:bg-[#F8F5F2] rounded-lg transition-colors"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-64 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#BBA496]/30 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-[#8B7355] hover:text-[#232D35] hover:bg-[#F8F5F2] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page Title */}
          <h1
            className="text-lg font-medium text-[#232D35] hidden md:block"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {navigationItems.find((item) => item.href === pathname)?.name ||
              "Dashboard"}
          </h1>

          {/* Mobile Logo */}
          <Link
            href="/"
            className="md:hidden flex items-center gap-2 text-[#232D35]"
          >
            <div className="w-7 h-7 bg-[#232D35] rounded-sm flex items-center justify-center">
              <span
                className="text-white text-lg font-bold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                M
              </span>
            </div>
          </Link>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Search could go here */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#BBA496] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
