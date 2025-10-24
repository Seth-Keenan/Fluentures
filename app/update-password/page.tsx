import { Metadata } from "next";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/app/components/LoadingSpinner";

const UpdatePassword = dynamic(() => import("./UpdatePasswordPage"), {
  loading: () => <LoadingSpinner />,
});

export default function UpdatePasswordWrapper() {
  return <UpdatePassword />;
}

export const metadata: Metadata = {
  title: "Update Password",
};
