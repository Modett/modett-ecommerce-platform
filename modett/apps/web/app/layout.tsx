import "@/styles/globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "sonner";

import { AuthProvider } from "@/providers/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
