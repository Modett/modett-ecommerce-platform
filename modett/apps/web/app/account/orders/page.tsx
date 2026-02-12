"use client";

import { ChevronDown } from "lucide-react";
import { useMyOrders } from "@/features/account/queries";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AccountSidebar } from "@/features/account/components/shared/account-sidebar";
import { OrderList } from "@/features/account/components/orders/order-list";
import { BackToAccountLink } from "@/features/account/components/shared/back-to-account-link";

export default function OrderHistoryPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  // Map UI filters to Backend statuses
  const statusMap: Record<string, string | undefined> = {
    all: undefined,
    return: "REFUNDED",
    exchange: "PARTIALLY_RETURNED",
  };

  const { data: orders = [], isLoading } = useMyOrders(
    statusMap[activeFilter] ? { status: statusMap[activeFilter] } : undefined,
  );

  return (
    <div className="w-full min-h-screen bg-[#EFECE5]">
      {/* Top Strip - Back Link */}
      <div className="w-full flex justify-center border-t border-b border-[#C3B0A5]/30">
        <div className="w-full max-w-[1440px] px-4 md:px-[60px] py-[32px]">
          <BackToAccountLink />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[60px] pt-[56px] pb-20">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-12">
          {/* Left Sidebar */}
          <AccountSidebar />

          {/* Right Content */}
          <div className="flex-1 max-w-[745px]">
            <h1
              className="text-[24px] font-normal text-[#765C4D] mb-8"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Order History
            </h1>

            {/* Filter Panel */}
            <div className="bg-[#FBF9F6] p-8 min-h-[400px]">
              {/* Filter Controls */}
              <div className="mb-8">
                {/* Year/Time Filter Dropdown */}
                <div className="border-b border-[#E5E0D6] pb-2 mb-6">
                  <div className="flex items-center justify-between cursor-pointer">
                    <span
                      className="text-[14px] text-[#765C4D]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      All
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#765C4D]" />
                  </div>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-8">
                  {[
                    { id: "all", label: "All orders" },
                    { id: "return", label: "Return orders" },
                    { id: "exchange", label: "Exchange orders" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full border border-[#C78869]",
                          activeFilter === tab.id
                            ? "bg-[#C78869]"
                            : "bg-transparent group-hover:bg-[#C78869]/20",
                        )}
                      />
                      <span
                        className="text-[14px] text-[#765C4D] font-light"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order List Component */}
              <OrderList orders={orders} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
