import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Litimus — AI Text Detection",
  description:
    "Litimus scores rhythm, phrasing, and repetition the way an editor reads a manuscript — then shows its work sentence by sentence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5BMVDCZJ3H"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5BMVDCZJ3H');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
