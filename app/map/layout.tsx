import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fluentures",
  icons: { icon: "/favicon.ico" },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
