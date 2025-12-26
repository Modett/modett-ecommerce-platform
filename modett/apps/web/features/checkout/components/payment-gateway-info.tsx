import { Info } from "lucide-react";
import { TEXT_STYLES } from "@/features/cart/constants/styles";

export function PaymentGatewayInfo() {
  return (
    <div className="pb-6 pt-2">
      <div
        className="bg-[#F8F5F2] p-[25px] mb-4 text-[13.2px] leading-[18px] text-[#3E5460] border border-[#E5E0D6] flex items-center gap-[8px]"
        style={TEXT_STYLES.bodyTeal}
      >
        <Info className="w-6 h-6 text-[#3E5460]" />
        You will be redirected to PAYable IPG secure payment page to complete
        your payment
      </div>
      <p
        className="text-[12px] leading-[18px] text-[#3E5460] font-normal"
        style={TEXT_STYLES.bodyTeal}
      >
        Your payment information will be securely handled by PAYable IPG. We
        accept Visa, Mastercard, American Express, and other major cards.
      </p>
    </div>
  );
}
