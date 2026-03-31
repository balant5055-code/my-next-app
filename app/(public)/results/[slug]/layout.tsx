import { ReactNode } from "react";

export default async function ResultsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug = "" } = await params;

  const formatLabel = (segment?: string) =>
    (segment || "")
      .replace(/-/g, " ")
      .replace(/(\d)\s+(\d)/g, "$1.$2")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const eventName = formatLabel(slug);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl + "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Results",
        item: baseUrl + "/results",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: eventName,
        item: baseUrl + `/results/${slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Photos",
        item: baseUrl + `/results/${slug}/photos`,
      },
    ],
  };

  return (
    <>
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {children}
    </>
  );
}
