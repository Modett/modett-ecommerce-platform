"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSettings } from "../../api/settings.api";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useStore } from "@/providers/StoreProvider";

const appearanceSettingsSchema = z.object({
  announcement_enabled: z.boolean().default(false),
  announcement_text: z.string().optional(),
  announcement_link: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
  announcement_bg_color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid Hex Color")
    .optional()
    .or(z.literal("")),
  announcement_text_color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid Hex Color")
    .optional()
    .or(z.literal("")),
});

type AppearanceSettingsValues = z.infer<typeof appearanceSettingsSchema>;

interface AppearanceSettingsFormProps {
  initialData: Record<string, any>;
}

export default function AppearanceSettingsForm({
  initialData,
}: AppearanceSettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refetch } = useStore();

  const form = useForm<AppearanceSettingsValues>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: {
      announcement_enabled:
        initialData?.announcement_enabled === true ||
        initialData?.announcement_enabled === "true",
      announcement_text: initialData?.announcement_text || "",
      announcement_link: initialData?.announcement_link || "",
      announcement_bg_color:
        initialData?.announcement_bg_color || "#000000",
      announcement_text_color:
        initialData?.announcement_text_color || "#FFFFFF",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: AppearanceSettingsValues) => {
      const settingsToUpdate = Object.entries(values).map(([key, value]) => ({
        key,
        value,
        group: "appearance",
      }));
      return updateSettings(settingsToUpdate);
    },
    onSuccess: async (data) => {
      if (data.success) {
        toast({
          title: "Settings updated",
          description: "Appearance settings have been saved.",
        });
        queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
        // Refetch public store settings so frontend immediately reflects changes
        await refetch();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update settings",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const onSubmit = (values: AppearanceSettingsValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">Announcement Bar</h3>

          <FormField
            control={form.control}
            name="announcement_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Enable Announcement Bar</FormLabel>
                  <FormDescription>
                    Show a top banner on the storefront.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch("announcement_enabled") && (
            <>
              <FormField
                control={form.control}
                name="announcement_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Free shipping on orders over..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="announcement_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="announcement_bg_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color</FormLabel>
                      <div className="flex gap-2">
                        <div
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: field.value || "#000" }}
                        ></div>
                        <FormControl>
                          <Input placeholder="#000000" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="announcement_text_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Color</FormLabel>
                      <div className="flex gap-2">
                        <div
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: field.value || "#FFF" }}
                        ></div>
                        <FormControl>
                          <Input placeholder="#FFFFFF" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
