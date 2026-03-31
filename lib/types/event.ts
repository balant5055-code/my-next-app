export type EventCategory = {
  id: string;
  distance: string;
  title?: string;
  price?: number;
};

export type EventType = {
  tagline: string;
  routeLabel: string;
  id: string;
  name?: string;
  city?: string;
  venue?: string;
  bannerURL?: string;
  slug?: string;
  date?: Date | null;
  eventType?: string;
  categories?: EventCategory[];
  registration?: {
    status?: string;
  };
  resultsPublished?: boolean;
  eventFormat?: "timed" | "non-timed" | "fun-run" | "awareness"; // ✅ ADD THIS
  metrics?: {
    totalParticipants?: number;
    totalRevenue?: number;
    occupancyRate?: number;
    confirmedCount?: number;
  };
};
