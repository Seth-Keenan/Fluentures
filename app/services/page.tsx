import { Metadata } from "next";
import ServicesPage from "./ServicesPage";

export const metadata: Metadata = {
  title: "Services",
  description: "Fluentures services",
};

export default function Page() {
  return <ServicesPage />;
}
