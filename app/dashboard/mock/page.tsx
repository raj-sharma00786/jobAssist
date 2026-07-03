import type { Metadata } from "next";
import StarMockChat from "./StarMockChat";

export const metadata: Metadata = {
  title: "STAR Mock Interview | JobAssist",
  description:
    "Practice behavioral interview questions with an AI recruiter. Get STAR-method feedback and a score out of 100.",
};

export default function MockInterviewPage() {
  return <StarMockChat />;
}
