"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

interface StoreSettings {
  store_name?: string;
  support_email?: string;
  support_phone?: string;
  currency?: string;
  social_links?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  announcement_enabled?: boolean;
  announcement_text?: string;
  announcement_link?: string;
  announcement_bg_color?: string;
  announcement_text_color?: string;
  shipping_rate_colombo?: number;
  shipping_rate_suburbs?: number;
  free_shipping_threshold?: number;
}

interface StoreContextType {
  settings: StoreSettings;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/public/context`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
      setSettings(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch store settings:", err);
      setError("Failed to load store settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <StoreContext.Provider value={{ settings, isLoading, error, refetch: fetchSettings }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
