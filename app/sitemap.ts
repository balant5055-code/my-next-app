/* SEO CODE FOR GOOGLE */

import { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://racelineindia.com";

async function getEvents() {
  try {
    const res = await fetch(`${SITE_URL}/api/events`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    return res.json();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEvents();

  const eventPages = events.map((event: any) => ({
    url: `${SITE_URL}/events/${event.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: `${SITE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    ...eventPages,
  ];
}
