import { Metadata } from "next";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import UpdatePasswordPage from "./UpdatePasswordPage";

const LandingPage = dynamic(() => import("./UpdatePasswordPage"), {
  loading: () => <LoadingSpinner />,
});

export default function UpdatedPasswordWrapper() {
  return <UpdatePasswordPage />;
}

export const metadata: Metadata = {
  title: "Update Password",
};
