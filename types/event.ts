export interface Category {
  id: string;
  title: string;
  price: number;
  minAge: number;
  maxAge: number;
  distance: string;
  maxSeats: number;
  bookedSeats: number;
  status?: "open" | "closed";
  waitlistEnabled?: boolean;
}

export interface Inclusions {
  timing?: string[];
  apparel?: string[];
  awards?: string[];
  support?: string[];
  certificates?: string[];
  media?: string[];
}

export interface EventData {
  id: string;
  name: string;
  slug: string;
  bannerURL: string;

  eventType?: string;

  date: Date | null;

  venue: string;
  city: string;
  mapLink: string;

  gateOpen: string;
  raceStart: string;

  maxParticipants: number;

  description: string;

  medicalNote?: string;

  categories: Category[];

  inclusions?: Inclusions;

  registration?: {
    start?: Date;
    end?: Date;
    status?: string;
  };
}
