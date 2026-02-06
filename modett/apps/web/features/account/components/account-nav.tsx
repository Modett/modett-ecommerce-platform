import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ACCOUNT_CLASSES } from "../constants/styles";

const NAV_ITEMS = [
  { label: "Personal Details", href: "/account/details" },
  { label: "User Details", href: "/account/user-details" }, // Assuming a distinction or placeholder
  { label: "Addresses", href: "/account/addresses" },
];

export const AccountNavigation = () => {
  return (
    <div className={ACCOUNT_CLASSES.navContainer}>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={ACCOUNT_CLASSES.navItem}
        >
          <span className={ACCOUNT_CLASSES.navText}>{item.label}</span>
          <ChevronRight className={ACCOUNT_CLASSES.navIcon} strokeWidth={1} />
        </Link>
      ))}
    </div>
  );
};
