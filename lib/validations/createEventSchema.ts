import { z } from "zod";

/* ========================= */
/* CATEGORY SCHEMA */
/* ========================= */

export const categorySchema = z
  .object({
    title: z.string().min(1, "Category title is required"),

    distance: z
      .string()
      .min(1, "Distance is required")
      .refine((val) => !isNaN(Number(val)), {
        message: "Distance must be a number",
      }),

    price: z
      .string()
      .min(1, "Price is required")
      .refine((val) => !isNaN(Number(val)), {
        message: "Price must be a number",
      }),

    minAge: z.string().optional(),

    maxAge: z.string().optional(),

    maxSeats: z
      .string()
      .min(1, "Max seats required")
      .refine((val) => !isNaN(Number(val)), {
        message: "Max seats must be a number",
      }),
  })
  .refine(
    (data) => {
      if (!data.minAge || !data.maxAge) return true;
      return Number(data.maxAge) >= Number(data.minAge);
    },
    {
      message: "Max age must be greater than min age",
      path: ["maxAge"],
    },
  );

/* ========================= */
/* MAIN EVENT SCHEMA */
/* ========================= */

export const createEventSchema = z
  .object({
    name: z.string().min(3, "Event name must be at least 3 characters"),

    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and URL friendly"),

    eventType: z.string(),

    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid event date",
    }),

    raceStart: z.string().min(1, "Race start time is required"),

    venue: z.string().min(1, "Venue is required"),
    city: z.string().min(1, "City is required"),
    mapLink: z.string().optional(),

    organizer: z.object({
      name: z.string().min(1, "Organizer name required"),
      phone: z.string().min(1, "Organizer phone required"),
    }),

    registration: z.object({
      start: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date",
      }),

      end: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid end date",
      }),
    }),

    socialLinks: z.object({
      whatsapp: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      youtube: z.string().optional(),
    }),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),

    terms: z.string().min(5, "Terms required"),

    refundPolicy: z.string().min(5, "Refund policy required"),

    medicalNote: z.string().optional(),

    bannerURL: z.string().optional(),

    categories: z
      .array(categorySchema)
      .min(1, "At least one category is required"),
  })

  /* ========================= */
  /* CROSS FIELD VALIDATIONS */
  /* ========================= */

  .refine(
    (data) => {
      if (!data.registration.start || !data.registration.end) return true;

      return (
        new Date(data.registration.end) >= new Date(data.registration.start)
      );
    },
    {
      message: "Registration end must be after start date",
      path: ["registration", "end"],
    },
  )

  .refine(
    (data) => {
      if (!data.date || !data.registration.end) return true;

      return new Date(data.date) >= new Date(data.registration.end);
    },
    {
      message: "Event date must be after registration end",
      path: ["date"],
    },
  );

/* ========================= */
/* TYPE EXPORT */
/* ========================= */

export type CreateEventFormValues = z.infer<typeof createEventSchema>;
