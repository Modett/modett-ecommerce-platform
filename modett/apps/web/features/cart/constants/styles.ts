// ============================================================================
// COLOR PALETTE
// ============================================================================
export const COLORS = {
  // Primary Colors
  graphite: "#232D35", // Main text color
  richUmber: "#765C4D", // Accent color (headers, icons)
  tealBlue: "#3E5460", // Interactive elements, links

  // Background Colors
  alabaster: "#E5E0D6", // Cart item background
  linen: "#EFECE5", // Page background, Order Summary

  // Border Colors
  warmBeige: "#D4C4A8", // Primary borders
  sand: "#BBA496", // Secondary borders, quantity controls

  // Supporting Colors
  slateGray: "#6B7B8A", // Secondary text
  lightGray: "#A0A0A0", // Placeholder text

  // Interactive States
  buttonHover: "#2c3b44", // Button hover state
  hoverBg: "#D4C4A8", // Background hover state

  // Utility
  white: "#FFFFFF",
  borderLight: "#E8F5F2",
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================
export const FONTS = {
  raleway: "Raleway, sans-serif",
  playfair: "Playfair Display, serif",
  reddit: "Reddit Sans, sans-serif",
} as const;

// Common text style objects
export const TEXT_STYLES = {
  // Headers
  pageTitle: {
    fontFamily: FONTS.playfair,
    color: COLORS.graphite,
  },

  // Table Headers
  tableHeader: {
    fontFamily: FONTS.raleway,
    color: COLORS.richUmber,
  },

  // Body Text - Graphite
  bodyGraphite: {
    fontFamily: FONTS.raleway,
    color: COLORS.graphite,
  },

  // Body Text - Slate Gray
  bodySlate: {
    fontFamily: FONTS.raleway,
    color: COLORS.slateGray,
  },

  // Body Text - Teal Blue
  bodyTeal: {
    fontFamily: FONTS.raleway,
    color: COLORS.tealBlue,
  },

  // Product Title
  productTitle: {
    fontFamily: FONTS.playfair,
    color: COLORS.graphite,
  },

  // SKU
  sku: {
    fontFamily: FONTS.reddit,
    color: COLORS.sand,
  },

  // Links/Interactive
  link: {
    fontFamily: FONTS.reddit,
    color: COLORS.tealBlue,
  },

  // Buttons
  button: {
    fontFamily: FONTS.raleway,
  },

  // Labels
  label: {
    fontFamily: FONTS.raleway,
    color: COLORS.graphite,
  },

  // Secondary Text
  secondary: {
    fontFamily: FONTS.raleway,
    color: COLORS.slateGray,
  },

  // Accent Text
  accent: {
    fontFamily: FONTS.raleway,
    color: COLORS.richUmber,
  },
} as const;

// ============================================================================
// COMMON CLASS NAMES
// ============================================================================
export const COMMON_CLASSES = {
  // Typography Classes
  tableHeaderText: "text-[14px] leading-[24px] font-normal tracking-[1.03px]",
  bodyExtraSmall: "text-[14px] leading-[24px] font-normal tracking-[1.03px]",
  bodySmall: "text-[12px] leading-[18px] font-normal",
  heading6: "text-[17.7px] leading-[28px] font-normal",

  // Container Classes
  pageContainer: "w-full max-w-[1440px] mx-auto px-[80px]",
  responsiveContainer: "w-full max-w-[1440px] mx-auto px-4 md:px-[80px]",

  // Button Classes
  primaryButton:
    "bg-[#3E5460] text-white hover:bg-[#2c3b44] transition-colors uppercase tracking-[3px]",
  secondaryButton:
    "bg-transparent border border-[#D4C4A8] hover:bg-[#E5E0D6] rounded-none",

  // Background Classes
  cartItemBg: "bg-[#E5E0D6]",
  orderSummaryBg: "bg-[#EFECE5]",
  pageBg: "bg-[#EFECE5]",

  // Border Classes
  borderPrimary: "border-[#D4C4A8]",
  borderSecondary: "border-[#BBA496]",
  borderLight: "border-[#E8F5F2]",
} as const;

// ============================================================================
// COMPONENT DIMENSIONS
// ============================================================================
export const DIMENSIONS = {
  // Cart Table
  cartTable: {
    height: "56px",
    productWidth: "149.61px",
    descriptionWidth: "342.02px",
    quantityWidth: "70px",
    priceWidth: "112px",
  },

  // Product Image
  productImage: {
    width: "149.61px",
    height: "190.88px",
  },

  // Order Summary
  orderSummary: {
    width: "300px",
    height: "716px",
  },

  // Buttons
  button: {
    proceedHeight: "50px",
    applyWidth: "80px",
    applyHeight: "40px",
  },

  // Input
  input: {
    discountWidth: "175px",
    height: "40px",
  },

  // Quantity Controls
  quantity: {
    minHeight: "44px",
  },

  // Payment Icons
  paymentIcon: {
    width: "40px",
    height: "26px",
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================
export const SPACING = {
  sectionGap: "gap-[40px]",
  itemGap: "gap-[24px]",
  smallGap: "gap-[8px]",
  tinyGap: "gap-[4px]",

  paddingPage: "px-[80px] py-[64px]",
  paddingContainer: "px-[24px] pb-[24px]",
  paddingItem: "px-[16px] py-[16px]",
} as const;

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================
export const RESPONSIVE = {
  // Container widths for different breakpoints
  containers: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1440px",
  },

  // Cart table responsive widths
  cartTable: {
    // Mobile: Stack vertically
    mobile: "w-full",
    // Tablet: Start showing table
    tablet: "md:w-full",
    // Desktop: Fixed width
    desktop: "lg:w-[884px] xl:w-[920px] 2xl:w-[960px]",
  },

  // Order summary responsive widths
  orderSummary: {
    mobile: "w-full",
    desktop: "lg:w-[300px] lg:sticky lg:top-[24px]",
  },

  // Padding responsive
  padding: {
    page: "px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-[80px]",
    section: "py-8 sm:py-12 md:py-16 lg:py-20 xl:py-[64px]",
  },

  // Gap responsive
  gap: {
    section: "gap-4 sm:gap-6 md:gap-8 lg:gap-[40px]",
    item: "gap-3 sm:gap-4 md:gap-6 lg:gap-[24px]",
  },
} as const;

// ============================================================================
// PRODUCT PAGE SPECIFIC STYLES
// ============================================================================

// Product Typography Classes
export const PRODUCT_CLASSES = {
  // Product Info Typography
  productTitle: "text-[18px] leading-[28px] font-normal",
  sectionHeader: "text-[16px] leading-[24px] font-medium uppercase tracking-[2px]",
  sizeLabel: "text-[14px] leading-[20px] font-medium uppercase tracking-[2px]",
  productDescription: "text-[14px] leading-[22px] font-normal",
  productPrice: "text-[14px] leading-[24px] font-normal",

  // Product Card Typography
  cardTitle: "text-[18px] leading-[24px] font-normal tracking-[0%]",
  cardPrice: "text-[14px] leading-[24px] font-normal",

  // Button Styles
  addToCartButton: "bg-[#232D35] hover:bg-[#232D35]/90 text-white uppercase tracking-[4px] font-medium rounded-none",
  sizeButton: "h-[48px] border transition-all",
  expandButton: "w-[29.86px] h-[29.86px] flex items-center justify-center hover:bg-gray-100 rounded transition-colors",

  // Container Styles
  productInfoContainer: "flex flex-col gap-[10px] w-full max-w-[300px] pr-[1px] pt-[10px] sticky top-0",
  colorSelectionContainer: "flex flex-col gap-[12px] w-full max-w-[299px] h-[81px] px-[15px] py-[10px] border-t border-b border-[#E5E0D6]",
  sizeSelectionContainer: "flex flex-col gap-[12px] w-full max-w-[299px] px-[15px] pt-[10px]",
} as const;

// Product Dimensions
export const PRODUCT_DIMENSIONS = {
  // Product Card
  card: {
    home: {
      width: "w-full max-w-[350px] md:max-w-[394px]",
      height: "h-[520px]",
      imageHeight: "h-[420px]",
      gap: "gap-[19.27px]",
    },
    collection: {
      width: "w-full",
      height: "h-[516px]",
      imageHeight: "h-[400px]",
      gap: "gap-[16px]",
    },
  },

  // Product Info
  info: {
    maxWidth: "max-w-[300px]",
    colorSwatch: "w-5 h-5",
    colorSwatchGap: "13.33px",
    sizeButtonHeight: "h-[48px]",
    addToCartHeight: "h-[50px]",
    wishlistButton: "h-[50px] w-[46px]",
  },

  // Product Images
  image: {
    productPage: {
      width: "w-[149.61px]",
      height: "h-[190.88px]",
    },
  },
} as const;
