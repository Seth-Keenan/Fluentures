import { Metadata } from "next";
import SettingsPage from "./SettingsPage";

export const metadata: Metadata = {
  title: "Settings",
  description: "Update account settings",
};

export default function Page() {
  return <SettingsPage />;
}
