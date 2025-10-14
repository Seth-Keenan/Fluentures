import { OasisProvider } from "@/app/context/OasisContext";

export default function OasisLayout({ children }: { children: React.ReactNode }) {
  return <OasisProvider>{children}</OasisProvider>;
}
