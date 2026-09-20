export const metadata = {
  title: "litmus-backend",
  // API host, not a website: never index it.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "monospace", padding: 32 }}>{children}</body>
    </html>
  );
}
