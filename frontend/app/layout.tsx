import type { Metadata } from "next";
//import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppLayout } from "@/components/app-layout";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "fawredd foreign trade budget app",
  description: "Foreign trade budget app",
  generator: "fawredd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
	const initialTheme = 'light'; // Default theme
  return (
    <html lang="en" className={initialTheme}>
      <body className={`bg-background text-foreground`}>
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
