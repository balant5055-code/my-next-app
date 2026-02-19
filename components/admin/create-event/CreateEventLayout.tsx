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
import {
  CheckIcon,
  InformationCircleIcon,
  UserIcon,
  CalendarDaysIcon,
  Squares2X2Icon,
  PhotoIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/solid";

/* ============================= */
/* TYPES */
/* ============================= */

type Tab =
  | "basic"
  | "organizer"
  | "registration"
  | "categories"
  | "media"
  | "review";

interface Category {
  title: string;
  distance: string;
  price: string;
  minAge: string;
  maxAge: string;
  maxSeats: string;
}

interface CreateEventForm {
  name: string;
  slug: string;
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

  categories: Category[];
}

/* ============================= */
/* COMPONENT */
/* ============================= */

export default function CreateEventLayout() {
  const router = useRouter();

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
          return JSON.parse(saved);
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
      categories: [],
    };
  });

  useEffect(() => {
    localStorage.setItem("eventDraft", JSON.stringify(formData));
  }, [formData]);

  /* ============================= */
  /* VALIDATION */
  /* ============================= */
  const updateField = (path: string, value: string) => {
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
      newErrors.organizerName = "Organizer name required";
    if (!formData.organizer.phone)
      newErrors.organizerPhone = "Organizer phone required";
    if (!formData.registration.start)
      newErrors.registrationStart = "Registration start required";
    if (!formData.registration.end)
      newErrors.registrationEnd = "Registration end required";
    if (!formData.categories || formData.categories.length === 0)
      newErrors.categories = "At least one category required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ============================= */
  /* SUBMIT */
  /* ============================= */

  const handleSubmit = async () => {
    localStorage.removeItem("eventDraft");
    if (!validateForm()) {
      setActiveTab("basic");
      return;
    }

    try {
      setLoading(true);
      const payload = { ...formData, status };
      const res = await secureFetch("/api/admin/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white">Create New Event</h1>
        <p className="text-slate-400 mt-2">
          Enterprise event configuration panel
        </p>
      </div>

      {/* PREMIUM STEPPER */}
      <div className="bg-[#0b1220] border border-slate-700 rounded-2xl p-8">
        {(() => {
          const steps = [
            { key: "basic", label: "Basic Info", icon: InformationCircleIcon },
            { key: "organizer", label: "Organizer", icon: UserIcon },
            {
              key: "registration",
              label: "Registration",
              icon: CalendarDaysIcon,
            },
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
              {/* Base Line */}
              <div className="absolute top-7 left-7 right-7 h-[3px] bg-slate-700 rounded-full" />

              {/* Progress Line */}
              <div
                className="absolute top-7 left-7 h-[3px] bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{
                  width: `calc(${progressPercent}% - 14px)`,
                }}
              />

              {/* Steps */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => {
                  const isActive = index === currentIndex;
                  const isCompleted = index < currentIndex;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.key}
                      onClick={() => setActiveTab(step.key)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      {/* Step Box */}
                      <div
                        className={`w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-300
                    ${
                      isActive
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-800 text-slate-400 border border-slate-600 group-hover:border-indigo-500"
                    }`}
                      >
                        {isCompleted ? (
                          <CheckIcon className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>

                      {/* Label */}
                      <span
                        className={`mt-3 text-xs font-semibold uppercase tracking-wide
                    ${
                      isActive
                        ? "text-indigo-400"
                        : isCompleted
                          ? "text-emerald-400"
                          : "text-slate-500 group-hover:text-slate-300"
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

      {/* CONTENT */}
      <div className="bg-[#111827]">
        {/* BASIC INFO */}
        {activeTab === "basic" && (
          <BasicInfoSection
            data={formData}
            errors={errors}
            onChange={updateField}
          />
        )}

        {/* ORGANIZER */}
        {activeTab === "organizer" && (
          <OrganizerSection
            data={formData.organizer}
            errors={errors}
            onChange={(field, value) =>
              setFormData((prev) => ({
                ...prev,
                organizer: {
                  ...prev.organizer,
                  [field]: value,
                },
              }))
            }
          />
        )}

        {/* REGISTRATION */}
        {activeTab === "registration" && (
          <RegistrationSection
            data={formData}
            errors={errors}
            onChange={updateField}
          />
        )}

        {/* CATEGORIES */}
        {activeTab === "categories" && (
          <CategoryBuilderSection
            categories={formData.categories}
            setCategories={(value) =>
              setFormData((prev) => ({
                ...prev,
                categories:
                  typeof value === "function" ? value(prev.categories) : value,
              }))
            }
            errors={errors}
          />
        )}

        {/* MEDIA */}
        {activeTab === "media" && (
          <MediaSection
            data={formData}
            errors={errors}
            onChange={updateField}
            bannerPreview={bannerPreview}
            setBannerFile={setBannerFile}
            setBannerPreview={setBannerPreview}
          />
        )}

        {/* REVIEW */}
        {activeTab === "review" && (
          <ReviewSubmitSection
            data={formData}
            onSubmit={handleSubmit}
            loading={loading}
            onEdit={(tab) => setActiveTab(tab as Tab)}
          />
        )}
      </div>
    </div>
  );
}
