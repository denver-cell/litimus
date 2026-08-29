export const metadata = {
  title: "litmus-backend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "monospace", padding: 32 }}>{children}</body>
    </html>
  );
}
