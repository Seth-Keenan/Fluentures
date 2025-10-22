import { Metadata } from "next";
import dynamic from "next/dynamic";
import LoadingSpinner from "./components/LoadingSpinner";

const LandingPage = dynamic(() => import("./LandingPage"), {
  loading: () => <LoadingSpinner />,
});

export default function LandingPageWrapper() {
  return <LandingPage />;
}

export const metadata: Metadata = {
  title: "Fluentures",
};
