import { CSSProperties } from "react";
import { TEXT_STYLES } from "@/features/cart/constants/styles";
import { cn } from "@/lib/utils";

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: any;
}

const BaseText = ({
  children,
  className,
  as: Component = "p",
  style,
  variantStyle,
  ...props
}: TextProps & { variantStyle?: any }) => {
  return (
    <Component
      className={cn(className)}
      style={{ ...variantStyle, ...style } as CSSProperties}
      {...props}
    >
      {children}
    </Component>
  );
};

export const Text = {
  BodyTeal: (props: TextProps) => (
    <BaseText {...props} variantStyle={TEXT_STYLES.bodyTeal} />
  ),
  BodyGraphite: (props: TextProps) => (
    <BaseText {...props} variantStyle={TEXT_STYLES.bodyGraphite} />
  ),
  Button: (props: TextProps) => (
    <BaseText {...props} variantStyle={TEXT_STYLES.button} />
  ),
  Accent: (props: TextProps) => (
    <BaseText {...props} variantStyle={TEXT_STYLES.accent} />
  ),
  Secondary: (props: TextProps) => (
    <BaseText {...props} variantStyle={TEXT_STYLES.secondary} />
  ),
  PageTitle: (props: TextProps) => (
    <BaseText {...props} variantStyle={TEXT_STYLES.pageTitle} />
  ),
  TableHeader: (props: TextProps) => (
    <BaseText {...props} variantStyle={TEXT_STYLES.tableHeader} />
  ),
  BodySlate: (props: TextProps) => (
    <BaseText {...props} variantStyle={TEXT_STYLES.bodySlate} />
  ),
};
