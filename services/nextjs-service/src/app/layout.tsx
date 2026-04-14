import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Service",
  description: "Next.js microservice - Product catalog",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "2rem", background: "#f5f5f5" }}>
        {children}
      </body>
    </html>
  );
}
