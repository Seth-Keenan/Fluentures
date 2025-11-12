import { Metadata } from "next";
import ResetPasswordPage from "./ResetPasswordPage";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Change account password",
};

export default function Page() {
  return <ResetPasswordPage />;
}
