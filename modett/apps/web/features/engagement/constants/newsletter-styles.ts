/**
 * Newsletter Component Style Constants
 * Following project conventions from @/features/cart/constants/styles
 */

export const NEWSLETTER_COLORS = {
  background: "#3E5460",
  text: "#F8F5F2",
  iconStroke: "#3E5460",
  buttonText: "#3E5460",
  buttonBg: "white",
  success: "#10B981",
  error: "#EF4444",
} as const;

export const NEWSLETTER_CLASSES = {
  // Section
  section: "bg-[#3E5460] text-white py-[60px] md:py-14",
  container: "max-w-7xl mx-auto px-0 md:px-6 lg:px-8",

  // Mobile layout
  mobileWrapper: "flex md:hidden text-center flex-col gap-[80px] px-5",
  mobileHeaderContainer: "flex flex-col gap-[24px] w-full max-w-[348px] mx-auto",
  mobileFormContainer: "w-full",
  mobileForm: "flex flex-col gap-4 w-[348px] mx-auto",
  mobileInput:
    "w-full bg-transparent border border-white/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white px-4 h-[54px] text-sm rounded-none transition-all",
  mobileButton:
    "w-full flex items-center justify-center gap-2 bg-white text-[#3E5460] uppercase font-medium tracking-wider px-6 h-12 border-none rounded-none text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",

  // Desktop layout
  desktopWrapper: "hidden md:flex md:items-start md:justify-between gap-8",
  desktopHeaderContainer: "flex-1 min-w-[260px]",
  desktopHeaderTitle: "text-2xl font-semibold mb-1",
  desktopHeaderDescription: "text-white/80 text-sm",
  desktopFormContainer: "flex-1 flex flex-col items-end w-full",
  desktopForm:
    "w-full max-w-md flex flex-row items-stretch border border-white/60 bg-transparent rounded-none overflow-hidden focus-within:ring-2 focus-within:ring-white/40 transition-all",
  desktopInput:
    "flex-1 bg-transparent border-none text-white placeholder:text-white/60 focus:outline-none px-4 h-11 text-sm",
  desktopButton:
    "flex items-center justify-center gap-2 bg-white text-[#3E5460] uppercase font-medium tracking-wider px-6 h-11 border-none rounded-none text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors border-l border-white/60 disabled:opacity-50 disabled:cursor-not-allowed",

  // Status messages
  statusSuccess: "text-xs mt-2 text-green-400",
  statusError: "text-xs mt-2 text-red-400",

  // Privacy disclaimer
  privacyMobile: "text-[11px] text-white/60 mt-4 leading-relaxed",
  privacyDesktop: "text-[11px] text-white/50 mt-2 leading-relaxed w-full max-w-md text-right",

  // Accessibility helpers
  srOnly: "sr-only",

  // Loading spinner
  spinner: "animate-spin h-4 w-4",
} as const;

export const NEWSLETTER_TYPOGRAPHY = {
  mobileTitle: {
    fontFamily: "Playfair Display, serif",
    fontSize: "24px",
    fontWeight: 600,
    lineHeight: "130%",
    textAlign: "center" as const,
    color: NEWSLETTER_COLORS.text,
  },
  mobileDescription: {
    fontFamily: "Raleway, sans-serif",
    fontSize: "18px",
    fontWeight: 400,
    lineHeight: "28px",
    letterSpacing: "0%",
    textAlign: "center" as const,
    color: NEWSLETTER_COLORS.text,
  },
} as const;

export const NEWSLETTER_CONFIG = {
  maxEmailLength: 254,
  submitDebounceMs: 300,
  successMessageDuration: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;
