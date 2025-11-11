import { Metadata } from "next";
import ContactPage from "./ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact us and let us know what we can improve on!",
};

export default function Page() {
  return <ContactPage />;
}
