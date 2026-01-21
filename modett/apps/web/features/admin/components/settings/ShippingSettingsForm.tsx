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
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useStore } from "@/providers/StoreProvider";

const shippingSettingsSchema = z.object({
  shipping_rate_colombo: z.coerce.number().min(0, "Rate must be positive"),
  shipping_rate_suburbs: z.coerce.number().min(0, "Rate must be positive"),
  free_shipping_threshold: z.coerce
    .number()
    .min(0, "Threshold must be positive"),
});

type ShippingSettingsValues = z.infer<typeof shippingSettingsSchema>;

interface ShippingSettingsFormProps {
  initialData: Record<string, any>;
}

export default function ShippingSettingsForm({
  initialData,
}: ShippingSettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refetch } = useStore();

  const form = useForm<ShippingSettingsValues>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: {
      shipping_rate_colombo: initialData?.shipping_rate_colombo || 250,
      shipping_rate_suburbs: initialData?.shipping_rate_suburbs || 250,
      free_shipping_threshold: initialData?.free_shipping_threshold || 5000,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ShippingSettingsValues) => {
      const settingsToUpdate = Object.entries(values).map(([key, value]) => ({
        key,
        value,
        group: "shipping",
      }));
      return updateSettings(settingsToUpdate);
    },
    onSuccess: async (data) => {
      if (data.success) {
        toast({
          title: "Settings updated",
          description: "Shipping settings have been saved.",
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

  const onSubmit = (values: ShippingSettingsValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="shipping_rate_colombo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colombo Shipping Rate (LKR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="250" {...field} />
                </FormControl>
                <FormDescription>
                  Standard shipping cost for Colombo area.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shipping_rate_suburbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suburbs Shipping Rate (LKR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="350" {...field} />
                </FormControl>
                <FormDescription>
                  Standard shipping cost for suburbs/outstation.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="free_shipping_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Free Shipping Threshold (LKR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5000" {...field} />
                </FormControl>
                <FormDescription>
                  Order amount above which shipping is free.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
