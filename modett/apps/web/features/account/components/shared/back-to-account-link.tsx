import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackToAccountLinkProps {
  className?: string;
  href?: string;
}

export const BackToAccountLink = ({
  className = "",
  href = "/account",
}: BackToAccountLinkProps) => {
  return (
    <Link
      href={href}
      className={`inline-flex items-center text-[#765C4D] no-underline hover:text-[#5d493e] mb-2 ${className}`}
      style={{
        fontFamily: "var(--font-raleway)",
        fontSize: "16px",
        fontWeight: 400,
        lineHeight: "24px",
        letterSpacing: "0.02em",
      }}
    >
      Back to Modett Account
    </Link>
  );
};
