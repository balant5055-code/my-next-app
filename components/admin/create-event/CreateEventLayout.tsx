"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BasicInfoSection from "./BasicInfoSection";
import OrganizerSection from "./OrganizerSection";
import RegistrationSection from "./RegistrationSection";
import CategoryBuilderSection from "./CategoryBuilderSection";
import MediaSection from "./MediaSection";
import ReviewSubmitSection from "./ReviewSubmitSection";
import { secureFetch } from "@/lib/secureFetch";
import EventInclusionsSection from "./EventInclusionsSection";
import KitDistributionSection from "./KitDistributionSection";
import {
  CheckIcon,
  InformationCircleIcon,
  UserIcon,
  CalendarDaysIcon,
  Squares2X2Icon,
  PhotoIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/solid";
import { EVENT_INCLUSIONS } from "@/components/constants/eventInclusions";
/* ============================= */
/* TYPES */
/* ============================= */

type Tab =
  | "basic"
  | "organizer"
  | "registration"
  | "kit"
  | "inclusions"
  | "categories"
  | "media"
  | "review";

interface Category {
  title: string;
  distance: string;
  price: string;

  earlyBirdPrice?: string;
  earlyBirdEnd?: string;

  minAge: string;
  maxAge: string;
  maxSeats: string;
  unlimited?: boolean;
  timedRun?: boolean;
}

interface CreateEventForm {
  startLocation: string;
  endLocation: string;
  routeStops: {
    name: string;
    description: string;
  }[];
  routeLabel: string;
  distance: number;

  name: string;
  slug: string;
  tagline: string;
  eventType: string;

  date: string;
  raceStart: string;

  venue: string;
  city: string;
  mapLink: string;

  organizer: {
    name: string;
    phone: string;
  };

  registration: {
    start: string;
    end: string;
  };

  socialLinks: {
    whatsapp: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };

  description: string;
  terms: string;
  refundPolicy: string;
  medicalNote: string;

  bannerURL: string;
  kitDistribution: {
    date: string;
    venue: string;
    time: string;
  }[];
  categories: Category[];
  // ✅ ADD THIS
  inclusions: {
    key: string;
    title: string;
    items: string[];
  }[];

  eventFormat: "timed" | "non-timed" | "fun-run" | "awareness";
}

/* ============================= */
/* COMPONENT */
/* ============================= */

export default function CreateEventLayout() {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateEventForm>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("eventDraft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);

          return {
            ...parsed,
            startLocation: parsed.startLocation || "",
            endLocation: parsed.endLocation || "",
            routeStops: (parsed.routeStops || []).map((s: any) => {
              if (typeof s === "string") {
                return { name: s, description: "" };
              }
              return s;
            }),
            routeLabel: parsed.routeLabel || "",
            distance: parsed.distance || 0,
          };
        } catch {
          console.error("Draft parse failed");
        }
      }
    }

    return {
      name: "",
      slug: "",
      eventType: "marathon",
      date: "",
      raceStart: "",
      venue: "",
      city: "",
      mapLink: "",
      organizer: { name: "", phone: "" },
      registration: { start: "", end: "" },
      socialLinks: {
        whatsapp: "",
        facebook: "",
        instagram: "",
        youtube: "",
      },
      description: "",
      terms: "",
      refundPolicy: "",
      medicalNote: "",
      bannerURL: "",
      kitDistribution: [
        {
          date: "",
          venue: "",
          time: "",
        },
      ],
      categories: [],
      eventFormat: "timed",
      startLocation: "",
      endLocation: "",
      routeStops: [],
      routeLabel: "",
      distance: 0,
      inclusions: EVENT_INCLUSIONS.map((cat) => ({
        key: cat.key,
        title: cat.title,
        items: [],
      })),
    };
  });

  useEffect(() => {
    localStorage.setItem("eventDraft", JSON.stringify(formData));
  }, [formData]);

  /* ============================= */
  /* VALIDATION */
  /* ============================= */
  const updateField = (path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split(".");
      const updated = { ...prev };

      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      return updated;
    });

    // clear error when field becomes valid
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[path];
      return copy;
    });
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Event name is required";
    if (!formData.slug) newErrors.slug = "Slug is required";
    if (!formData.date) newErrors.date = "Event date is required";
    if (!formData.raceStart) newErrors.raceStart = "Race start time required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.venue) newErrors.venue = "Venue is required";
    if (!formData.organizer.name)
      newErrors["organizer.name"] = "Organizer name required";

    if (!formData.organizer.phone)
      newErrors["organizer.phone"] = "Organizer phone required";
    if (!formData.registration.start)
      newErrors["registration.start"] = "Registration start required";

    if (!formData.registration.end)
      newErrors["registration.end"] = "Registration end required";

    if (!formData.categories || formData.categories.length === 0)
      newErrors.categories = "At least one category required";
    if (formData.eventFormat === "awareness") {
      if (!formData.startLocation)
        newErrors.startLocation = "Start location required";

      if (!formData.endLocation)
        newErrors.endLocation = "End location required";

      if (!formData.distance) newErrors.distance = "Distance required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ============================= */
  /* SUBMIT */
  /* ============================= */

  const handleSubmit = async () => {
    //localStorage.removeItem("eventDraft");

    if (!validateForm()) {
      setActiveTab("basic");
      return;
    }

    try {
      setLoading(true);

      /* CREATE FORM DATA */

      const form = new FormData();

      /* attach event data */
      console.log(formData);

      form.append("data", JSON.stringify(formData));

      /* attach poster file */

      if (bannerFile) {
        form.append("banner", bannerFile);
      }

      const res = await secureFetch("/api/admin/create-event", {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error);

      router.push("/admin/events");
    } catch (err) {
      console.error("Create event failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ============================= */
  /* RENDER */
  /* ============================= */

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* PAGE CONTAINER */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* HEADER */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">Create New Event</h1>

          <p className="text-slate-400 text-sm">
            Enterprise event configuration panel
          </p>
        </div>

        {/* STEPPER */}
        <div className="bg-[#0b1220] border border-slate-700 rounded-2xl p-8">
          {(() => {
            const steps = [
              {
                key: "basic",
                label: "Basic Info",
                icon: InformationCircleIcon,
              },
              { key: "organizer", label: "Organizer", icon: UserIcon },
              {
                key: "registration",
                label: "Registration",
                icon: CalendarDaysIcon,
              },
              { key: "kit", label: "Kit Distribution", icon: Squares2X2Icon },
              { key: "inclusions", label: "Inclusions", icon: Squares2X2Icon },
              { key: "categories", label: "Categories", icon: Squares2X2Icon },
              { key: "media", label: "Media", icon: PhotoIcon },
              {
                key: "review",
                label: "Review",
                icon: ClipboardDocumentCheckIcon,
              },
            ] as { key: Tab; label: string; icon: any }[];

            const currentIndex = steps.findIndex((s) => s.key === activeTab);
            const progressPercent = (currentIndex / (steps.length - 1)) * 100;

            return (
              <div className="relative">
                {/* LINE */}
                <div className="absolute top-7 left-7 right-7 h-[3px] bg-slate-700 rounded-full" />

                <div
                  className="absolute top-7 left-7 h-[3px] bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `calc(${progressPercent}% - 14px)` }}
                />

                {/* STEPS */}
                <div className="relative flex justify-between">
                  {steps.map((step, index) => {
                    const isActive = index === currentIndex;
                    const isCompleted = index < currentIndex;
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.key}
                        onClick={() => setActiveTab(step.key)}
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                      >
                        <div
                          className={`w-14 h-14 flex items-center justify-center rounded-xl transition-all
                        ${
                          isActive
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
                            : isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-800 text-slate-400 border border-slate-600"
                        }`}
                        >
                          {isCompleted ? (
                            <CheckIcon className="w-6 h-6" />
                          ) : (
                            <Icon className="w-6 h-6" />
                          )}
                        </div>

                        <span
                          className={`text-xs font-semibold uppercase tracking-wide
                        ${
                          isActive
                            ? "text-indigo-400"
                            : isCompleted
                              ? "text-emerald-400"
                              : "text-slate-500"
                        }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* FORM CONTENT */}
        <div className="bg-[#020617]">
          {activeTab === "basic" && (
            <BasicInfoSection
              data={formData}
              errors={errors}
              onChange={updateField}
            />
          )}

          {activeTab === "organizer" && (
            <OrganizerSection
              data={formData.organizer}
              errors={errors}
              onChange={updateField}
            />
          )}

          {activeTab === "registration" && (
            <RegistrationSection
              data={formData}
              errors={errors}
              onChange={updateField}
            />
          )}

          {activeTab === "kit" && (
            <KitDistributionSection data={formData} onChange={updateField} />
          )}

          {activeTab === "inclusions" && (
            <EventInclusionsSection data={formData} onChange={updateField} />
          )}

          {activeTab === "categories" && (
            <CategoryBuilderSection
              categories={formData.categories}
              setCategories={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  categories:
                    typeof value === "function"
                      ? value(prev.categories)
                      : value,
                }))
              }
              errors={errors}
            />
          )}

          {activeTab === "media" && (
            <MediaSection
              data={formData}
              errors={errors}
              onChange={updateField}
              bannerPreview={bannerPreview}
              setBannerFile={setBannerFile}
              setBannerPreview={setBannerPreview}
              uploadProgress={uploadProgress}
              setUploadProgress={setUploadProgress}
            />
          )}

          {activeTab === "review" && (
            <ReviewSubmitSection
              data={formData}
              bannerPreview={bannerPreview}
              onSubmit={handleSubmit}
              loading={loading}
              onEdit={(tab) => setActiveTab(tab as Tab)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
