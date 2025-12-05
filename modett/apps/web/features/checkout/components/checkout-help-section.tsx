import React from "react";

export const CheckoutHelpSection = () => {
  return (
    <div className="mt-6 md:mt-8 pt-4 md:pt-6 lg:pt-[25px] grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[261px_1fr] gap-4 md:gap-6 lg:gap-8">
      {/* Left Column: Shipping & Returns */}
      <div className="space-y-4 md:space-y-6 md:border-r border-[#E5E0D6] md:pr-3 lg:pr-[11px]">
        <div className="flex items-start gap-2 md:gap-[6px]">
          <div className="flex-shrink-0">
            <svg
              width="20"
              height="20"
              className="md:w-6 md:h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <p
              className="text-[11px] md:text-[12px] leading-[16px] md:leading-[18px] text-[#3E5460]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              We offer free shipping on all orders with Express Worldwide
              service.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 md:gap-[6px]">
          <div className="flex-shrink-0">
            <svg
              width="20"
              height="20"
              className="md:w-6 md:h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <div>
            <p
              className="text-[11px] md:text-[12px] leading-[16px] md:leading-[18px] text-[#3E5460]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              We guarantee 30 days to return or exchange, starting from the
              delivery date of the order. For fragrance returns, we invite you
              to consult the{" "}
              <a href="#" className="underline">
                Frequently Asked Questions
              </a>{" "}
              section.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Help */}
      <div className="flex flex-col gap-2 md:pl-3 lg:pl-[10px]">
        <h3
          className="text-sm md:text-[15px] lg:text-[16px] leading-[18px] md:leading-[20px] font-medium text-[#3E5460]"
          style={{
            fontFamily: "Raleway, sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          MAY WE HELP YOU?
        </h3>

        <p
          className="text-[11px] md:text-[12px] leading-[16px] md:leading-[18px] text-[#3E5460] break-words"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          Our Customer Care is available from Colombo, Sri Lanka. Monday through
          Friday from 8:30 a.m. to 6:30 p.m. and Saturday from 9:00 a.m. to 5:30
          p.m.
        </p>

        <div className="flex flex-wrap gap-4 md:gap-6">
          <button
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#3E5460] underline"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <svg
              width="16"
              height="16"
              className="md:w-[18px] md:h-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call us
          </button>
          <button
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#3E5460] underline"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <svg
              width="16"
              height="16"
              className="md:w-[18px] md:h-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            WhatsApp
          </button>
          <button
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#3E5460] underline"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <svg
              width="16"
              height="16"
              className="md:w-[18px] md:h-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Contact us by e-mail
          </button>
        </div>
      </div>
    </div>
  );
};
