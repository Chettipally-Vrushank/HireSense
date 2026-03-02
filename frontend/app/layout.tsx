import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HireSense — AI Resume Intelligence",
  description: "Upload your resume, paste a job description, and get an instant AI match score, skill gap analysis, and a personalized learning roadmap — in seconds.",
  keywords: ["resume analyzer", "ATS resume", "AI resume tailor", "job match score", "skill gap analysis"],
  openGraph: {
    title: "HireSense — AI Resume Intelligence",
    description: "Stop guessing. Land the job. AI-powered resume matching in under 5 seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
