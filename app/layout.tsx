import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NB Septic Installer Quiz",
  description: "Study quiz for the New Brunswick On-site Sewage Disposal Systems installer course and exam.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="wrap">
          <nav className="nav">
            <a href="/">Quiz</a>
            <a href="/progress">Progress</a>
            <a href="/prep">Interview prep</a>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
