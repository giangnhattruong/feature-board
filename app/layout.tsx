import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Feature Board",
  description: "Submit and vote on feature requests",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="w-full border-t border-border mt-auto">
          <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
            <span>Built by Truong Giang — MVP Builder for Non-Technical Founders</span>
            <a
              href="https://www.upwork.com/freelancers/~01fe60f85903527def"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover transition-colors font-medium"
            >
              Upwork Profile →
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
