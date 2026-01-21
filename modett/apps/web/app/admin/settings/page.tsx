"use client";

import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/features/admin/api/settings.api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import GeneralSettingsForm from "@/features/admin/components/settings/GeneralSettingsForm";
import AppearanceSettingsForm from "@/features/admin/components/settings/AppearanceSettingsForm";
import ShippingSettingsForm from "@/features/admin/components/settings/ShippingSettingsForm";
import InventorySettingsForm from "@/features/admin/components/settings/InventorySettingsForm";
import { AccountSettingsForm } from "@/features/admin/components/settings/AccountSettingsForm";

export default function SettingsPage() {
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getSettings,
  });

  const settings = response?.data || {};

  if (isLoading) {
    return <div>Loading settings...</div>; // TODO: Skeleton
  }

  if (isError) {
    return <div>Failed to load settings. Please try again.</div>;
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="bg-transparent p-0 border-b border-neutral-200 w-full justify-start rounded-none h-auto">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none px-4 py-3"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none px-4 py-3"
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none px-4 py-3"
          >
            Shipping
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none px-4 py-3"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none px-4 py-3"
          >
            Account
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general">
            <Card className="p-6">
              <GeneralSettingsForm initialData={settings.general} />
            </Card>
          </TabsContent>
          <TabsContent value="appearance">
            <Card className="p-6">
              <AppearanceSettingsForm initialData={settings.appearance} />
            </Card>
          </TabsContent>
          <TabsContent value="shipping">
            <Card className="p-6">
              <ShippingSettingsForm initialData={settings.shipping} />
            </Card>
          </TabsContent>
          <TabsContent value="inventory">
            <Card className="p-6">
              <InventorySettingsForm initialData={settings.inventory} />
            </Card>
          </TabsContent>
          <TabsContent value="account">
            <Card className="p-6">
              <AccountSettingsForm />
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
