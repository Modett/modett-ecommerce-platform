"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Calendar } from "lucide-react";

export function DashboardHeader({
  title,
  subtitle,
  children,
  searchTerm,
  onSearchChange,
}: {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}) {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(date.toLocaleDateString("en-US", options));
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 mb-6">
      <div>
        <h1
          className="text-3xl font-normal text-[#232D35] tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {title || "Overview"}
        </h1>
        <div className="flex items-center gap-2 mt-2 text-[#8B7355] text-sm">
          {subtitle ? (
            <p style={{ fontFamily: "Raleway, sans-serif" }}>{subtitle}</p>
          ) : (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <p style={{ fontFamily: "Raleway, sans-serif" }}>
                Today is {currentDate}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {children}

        {/* Search Bar - Hidden on mobile, or managed by page */}
        <div className="hidden md:flex items-center bg-white border border-[#BBA496]/30 rounded-full px-4 py-2 w-64 shadow-sm focus-within:ring-1 focus-within:ring-[#BBA496]">
          <Search className="w-4 h-4 text-[#BBA496] mr-2" />
          <input
            type="text"
            placeholder="Global Search..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#BBA496]/70"
            value={searchTerm || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        <button className="relative w-10 h-10 rounded-full bg-white border border-[#BBA496]/30 flex items-center justify-center hover:bg-[#F8F5F2] transition-colors shadow-sm">
          <Bell className="w-5 h-5 text-[#232D35]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        <div className="w-10 h-10 rounded-full bg-[#232D35] flex items-center justify-center shadow-md">
          <span className="text-white text-sm font-medium">AD</span>
        </div>
      </div>
    </div>
  );
}
