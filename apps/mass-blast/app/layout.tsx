import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MassBlast — WhatsApp Bulk Sender",
  description:
    "Streamline your outreach by instantly preparing bulk WhatsApp conversations with pre-filled messages and contact lists.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
