import { Metadata } from "next";
import AboutPage from "./AboutPage";

export const metadata: Metadata = {
  title: "About",
  description: "About fluentures, our mission, and our team",
};

export default function Page() {
  return <AboutPage />;
}
