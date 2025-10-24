"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterProps {
  title?: string;
  description?: string;
  onSubmit?: (email: string) => void | Promise<void>;
}

export function Newsletter({
  title = "Join the Modern Muse community",
  description = "Get the latest fashion trends and exclusive offers",
  onSubmit,
}: NewsletterProps) {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      if (onSubmit) {
        await onSubmit(email);
      }
      setMessage({ type: "success", text: "Thank you for subscribing!" });
      setEmail("");
    } catch (error) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-[#3E5460] text-white py-12 md:py-14">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Mobile Layout - Centered and Stacked */}
        <div className="block md:hidden text-center">
          <h2 className="text-2xl font-serif mb-4">{title}</h2>
          <p className="text-white/80 text-sm mb-8 max-w-md mx-auto">
            {description}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full bg-transparent border border-white/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-0 px-4 h-12 text-sm rounded-none"
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-white text-[#3E5460] uppercase font-medium tracking-wider px-6 h-12 border-none rounded-none text-sm hover:bg-gray-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="#3E5460"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M3 7l9 6 9-6"
                  stroke="#3E5460"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
              SUBSCRIBE
            </button>
            {/* Message */}
            {message && (
              <p
                className={`text-xs mt-2 ${
                  message.type === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {message.text}
              </p>
            )}
            <p className="text-[11px] text-white/60 mt-4 leading-relaxed">
              By subscribing, you agree to our privacy policy and terms of
              service
            </p>
          </form>
        </div>

        {/* Desktop Layout - Side by Side */}
        <div className="hidden md:flex md:items-start md:justify-between gap-8">
          {/* Left: Title & Description */}
          <div className="flex-1 min-w-[260px]">
            <h2 className="text-2xl font-semibold mb-1">{title}</h2>
            <p className="text-white/80 text-sm">{description}</p>
          </div>
          {/* Right: Form */}
          <div className="flex-1 flex flex-col items-end w-full">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md flex flex-row items-stretch border border-white/60 bg-transparent rounded-none overflow-hidden"
            >
              <input
                type="email"
                placeholder="Enter e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-transparent border-none text-white placeholder:text-white/60 focus:outline-none focus:ring-0 px-4 h-11 text-sm"
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-white text-[#3E5460] uppercase font-medium tracking-wider px-6 h-11 border-none rounded-none text-sm hover:bg-gray-100 transition-colors border-l border-white/60"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="mr-1"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="#3E5460"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M3 7l9 6 9-6"
                    stroke="#3E5460"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                SUBSCRIBE
              </button>
            </form>
            {/* Message */}
            {message && (
              <p
                className={`text-xs mt-2 ${
                  message.type === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {message.text}
              </p>
            )}
            <p className="text-[11px] text-white/50 mt-2 leading-relaxed w-full max-w-md text-right">
              By subscribing, you agree to our privacy policy and terms of
              service
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
