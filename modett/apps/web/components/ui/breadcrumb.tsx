import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="w-full bg-[#EFECE5]">
      <div className="w-full max-w-[1440px] mx-auto px-[80px] py-[12px]">
        <ol className="flex items-center gap-[8px] h-[24px]">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-[8px]">
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-[12px] leading-[24px] font-medium uppercase tracking-[2px] text-[#6B7B8A] hover:text-[#232D35] transition-colors"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-[12px] leading-[24px] font-medium uppercase tracking-[2px] text-[#232D35]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {item.label}
                </span>
              )}
              {index < items.length - 1 && (
                <span className="text-[#6B7B8A]">/</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
