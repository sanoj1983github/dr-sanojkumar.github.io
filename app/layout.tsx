import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "sanoj1983github.github.io";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Dr. Sanoj Kumar",
      template: "%s · Dr. Sanoj Kumar",
    },
    description:
      "Academic portfolio of Dr. Sanoj Kumar, Senior Associate Professor in the Data Science Cluster, SOCS, UPES Dehradun, researching applied mathematics, optimization, digital image processing, computer vision, machine learning, and deep learning.",
    keywords: [
      "Sanoj Kumar",
      "Applied Mathematics",
      "UPES Dehradun",
      "Computer Vision",
      "Machine Learning",
      "Optimization",
      "Digital Image Processing",
      "Deep Learning",
    ],
    authors: [{ name: "Dr. Sanoj Kumar" }],
    icons: {
      icon: "/apple-touch-icon.png",
      shortcut: "/apple-touch-icon.png",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      url: origin,
      title: "Dr. Sanoj Kumar",
      description:
        "Senior Associate Professor at UPES Dehradun · Researcher in applied mathematics, computer vision, machine learning, optimization, and deep learning.",
      siteName: "Dr. Sanoj Kumar",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1736,
          height: 909,
          alt: "Dr. Sanoj Kumar academic portfolio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Dr. Sanoj Kumar",
      description:
        "Senior Associate Professor at UPES Dehradun · Researcher in applied mathematics, computer vision, machine learning, optimization, and deep learning.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={geistMono.variable}>
        {children}
      </body>
    </html>
  );
}
