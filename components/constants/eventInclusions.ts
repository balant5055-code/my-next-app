export interface EventInclusion {
  key: string;
  title: string;
  items: string[];
}

export const EVENT_INCLUSIONS: EventInclusion[] = [
  {
    key: "apparel",
    title: "Apparel & Kit",
    items: [
      "T-Shirt",
      "Finisher T-Shirt",
      "Running Bib",
      "RFID Timing Bib",
      "Wrist Band",
      "Goodie Bag",
      "Cap",
      "Medal",
    ],
  },
  {
    key: "timing",
    title: "Timing & Results",
    items: ["Chip Timing", "Instant SMS Result", "Online Result Portal"],
  },
  {
    key: "certificates",
    title: "Certificates",
    items: [
      "Printed Certificate",
      "Digital Certificate",
      "Downloadable PDF Certificate",
      "Participation Certificate",
      "Finisher Certificate",
    ],
  },
  {
    key: "media",
    title: "Media",
    items: [
      "Free Event Photos",
      "AI-Based Photo Recognition",
      "Downloadable Photos",
    ],
  },
  {
    key: "support",
    title: "Refreshments & Support",
    items: [
      "Water Stations",
      "Energy Drinks",
      "Refreshments",
      "Medical Support",
      "Ambulance Support",
      "Physiotherapy Support",
      "Recovery Zone",
    ],
  },
  {
    key: "awards",
    title: "Awards",
    items: [
      "Trophy for Winners",
      "Medal for Finishers",
      "Cash Prize",
      "Category Prizes",
      "Lucky Draw",
    ],
  },
];