import Image from "next/image";
import Link from "next/link";
import { ACCOUNT_CLASSES } from "../constants/styles";

interface DashboardCardProps {
  title: string;
  imageSrc: string;
  buttonText: string;
  href: string;
}

export const DashboardCard = ({
  title,
  imageSrc,
  buttonText,
  href,
}: DashboardCardProps) => {
  return (
    <div className={ACCOUNT_CLASSES.card}>
      <div className={ACCOUNT_CLASSES.cardImageContainer}>
        <Image src={imageSrc} alt={title} fill className="object-cover" />
      </div>
      <div className={ACCOUNT_CLASSES.cardContent}>
        <h3 className="text-[16px] text-[#765C4D] text-center font-normal tracking-[1px] font-sans">
          {title}
        </h3>
        <Link href={href} className={ACCOUNT_CLASSES.button}>
          {buttonText}
        </Link>
      </div>
    </div>
  );
};
