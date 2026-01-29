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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSettings } from "../../api/settings.api";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Schema for General Settings
const generalSettingsSchema = z.object({
  store_name: z.string().min(1, "Store name is required"),
  support_email: z.string().email("Invalid email address"),
  support_phone: z.string().min(10, "Phone number must be at least 10 digits"),
  currency: z.string().default("LKR"), // Read-only mostly
  social_facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
  social_instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
  social_tiktok: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

interface GeneralSettingsFormProps {
  initialData: Record<string, any>;
}

export default function GeneralSettingsForm({
  initialData,
}: GeneralSettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      store_name: initialData?.store_name || "",
      support_email: initialData?.support_email || "",
      support_phone: initialData?.support_phone || "",
      currency: initialData?.currency || "LKR",
      social_facebook: initialData?.social_facebook || "",
      social_instagram: initialData?.social_instagram || "",
      social_tiktok: initialData?.social_tiktok || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: GeneralSettingsValues) => {
      // Convert form values to API format (array of UpdateSettingRequest)
      const settingsToUpdate = Object.entries(values).map(([key, value]) => ({
        key,
        value,
        group: "general",
      }));
      return updateSettings(settingsToUpdate);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Settings updated",
          description: "General settings have been saved.",
        });
        queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
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

  const onSubmit = (values: GeneralSettingsValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="store_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Name</FormLabel>
                <FormControl>
                  <Input placeholder="Modett" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="support_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Support Email</FormLabel>
                <FormControl>
                  <Input placeholder="support@modett.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="support_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Support Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+94 7X XXX XXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-500">Social Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="social_instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://instagram.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="social_facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://facebook.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="social_tiktok"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TikTok URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://tiktok.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
