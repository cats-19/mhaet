import type { Metadata } from "next";
import { LandingPage } from "../src/landing/LandingPage";

export default function Page() {
  return <LandingPage />;
}

export const metadata: Metadata = {
  title: "Aurelia — Gentle care for every stage of motherhood",
};
