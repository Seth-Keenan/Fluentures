// app/page.tsx
import { Metadata } from "next";
import LandingPage from "./LandingPage";

export const metadata: Metadata = {
  title: "Fluentures",
  description: "A lighter, friendlier way to learn languages.",
};

export default function Page() {
  return <LandingPage />;
}
