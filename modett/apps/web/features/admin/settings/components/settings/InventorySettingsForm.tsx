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

const inventorySettingsSchema = z.object({
  low_stock_threshold: z.coerce.number().min(0, "Threshold must be positive"),
});

type InventorySettingsValues = z.infer<typeof inventorySettingsSchema>;

interface InventorySettingsFormProps {
  initialData: Record<string, any>;
}

export default function InventorySettingsForm({
  initialData,
}: InventorySettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InventorySettingsValues>({
    resolver: zodResolver(inventorySettingsSchema),
    defaultValues: {
      low_stock_threshold: initialData?.low_stock_threshold || 5,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: InventorySettingsValues) => {
      const settingsToUpdate = Object.entries(values).map(([key, value]) => ({
        key,
        value,
        group: "inventory",
      }));
      return updateSettings(settingsToUpdate);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Settings updated",
          description: "Inventory settings have been saved.",
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

  const onSubmit = (values: InventorySettingsValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="low_stock_threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Low Stock Threshold</FormLabel>
              <FormControl>
                <Input type="number" placeholder="5" {...field} />
              </FormControl>
              <FormDescription>
                Products with stock below this level will be marked as low
                stock.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
