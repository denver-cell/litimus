import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Litimus — AI Text Detection",
  description:
    "Litimus scores rhythm, phrasing, and repetition the way an editor reads a manuscript — then shows its work sentence by sentence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
