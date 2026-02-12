export const ACCOUNT_COLORS = {
  background: "#EFECE5", // Matches Header background
  textPrimary: "#4A4A4A", // Dark Grey for headings
  textSecondary: "#765C4D", // Brownish/Bronze text for buttons/links
  border: "#D3CDC1", // Light separator line
  buttonBackground: "#F5F3EF", // Light button bg
  buttonBorder: "#C0B8A9", // Button border
} as const;

export const ACCOUNT_FONTS = {
  serif: "var(--font-instrument-serif), serif",
  sans: "var(--font-raleway), sans-serif",
} as const;

/* ── Shared form style tokens (used across all account forms) ── */
export const FORM_FONT = { fontFamily: "Raleway, sans-serif" } as const;

export const FORM_CLASSES = {
  label:
    "text-[10px] leading-[16px] font-semibold text-[#765C4D] tracking-[1.03px] block",
  input:
    "h-[34px] border-0 border-b border-[#BBA496] rounded-none px-2 bg-transparent text-[#765C4D] focus-visible:ring-0 focus-visible:border-[#765C4D] placeholder:text-[#765C4D]/50",
  selectTrigger:
    "w-full h-[34px] border-0 border-b border-[#BBA496] rounded-none px-2 bg-transparent text-[#765C4D] focus:ring-0 focus:border-[#765C4D]",
  submitBtn:
    "w-full h-[48px] bg-[#F5F3EF] border border-[#C0B8A9] text-[#765C4D] hover:bg-[#D3CDC1] hover:text-[#765C4D] uppercase tracking-[2px] text-[12px] font-medium",
  saveBtn:
    "w-full h-[48px] bg-[#C0A080] border border-[#C0A080] text-white hover:bg-[#a88a6c] uppercase tracking-[2px] text-[12px] font-medium",
  sectionCard: "bg-[#F8F5F2] pt-[56px] px-[24px] pb-[32px] space-y-8",
  sectionTitle: "text-[18px] leading-[26px] font-normal text-[#765C4D] mb-2",
  sectionDesc: "text-[13px] leading-[22px] font-normal text-[#765C4D]/80",
} as const;

export const ACCOUNT_CLASSES = {
  pageContainer:
    "min-h-screen flex flex-col items-center pt-[126px] pb-[80px] px-8",
  sectionContainer: "w-full max-w-[1440px] flex flex-col items-center",

  // Headers
  headerContainer:
    "flex flex-col items-center gap-6 w-full max-w-[661px] mb-[80px]",
  welcomeTitle:
    "text-[24px] leading-[140%] text-center font-medium text-[#765C4D]",
  subTitle: "text-[14px] uppercase tracking-[2px] text-center text-[#765C4D]",

  // Dashboard Grid
  gridContainer:
    "flex flex-col md:flex-row justify-center items-center gap-8 w-full mb-16",
  card: "flex flex-col items-center w-full max-w-[443px] transition-transform hover:scale-[1.01]",
  cardImageContainer: "relative w-full h-[620px] overflow-hidden",
  cardContent: "flex flex-col items-center gap-4 mt-6 w-full",
  button:
    "w-[199px] h-[42px] flex items-center justify-center text-[13px] tracking-[1px] uppercase border border-[#765C4D] text-[#765C4D] hover:bg-[#765C4D] hover:text-white transition-colors duration-300 bg-[#F3F0EB]",

  // Nav Links
  navContainer: "w-full max-w-[901px] flex flex-col",
  navItem:
    "flex justify-between items-center py-[18px] border-b border-[#BBA496] first:border-t border-[#BBA496] group transition-all",
  navText: "text-[16px] text-[#765C4D] group-hover:text-[#4A4A4A] font-medium",
  navIcon: "w-6 h-6 text-[#765C4D]",

  // Buttons
  cardButton:
    "uppercase tracking-[2px] text-[12px] px-8 py-3 border border-[#C0B8A9] text-[#765C4D] hover:bg-[#D3CDC1] transition-colors bg-[#F5F3EF]",
} as const;
