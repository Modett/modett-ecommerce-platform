import { ReactNode } from "react";
import { Container } from "../../../components/ui/container";
import { Text } from "../../../components/ui/text";
import { Separator } from "../../../components/ui/separator";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <Container className="py-6 space-y-6">
      <div>
        <Text.PageTitle>Settings</Text.PageTitle>
        <Text.Secondary className="text-secondary-500">
          Manage your store settings and preferences.
        </Text.Secondary>
      </div>
      <Separator />
      {children}
    </Container>
  );
}
