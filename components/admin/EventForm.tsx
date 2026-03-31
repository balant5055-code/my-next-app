"use client";

import { useState, useEffect } from "react";

import BasicInfoSection from "@/components/admin/create-event/BasicInfoSection";
import OrganizerSection from "@/components/admin/create-event/OrganizerSection";
import RegistrationSection from "@/components/admin/create-event/RegistrationSection";
import CategoryBuilderSection from "@/components/admin/create-event/CategoryBuilderSection";
import EventInclusionsSection from "@/components/admin/create-event/EventInclusionsSection";
import KitDistributionSection from "@/components/admin/create-event/KitDistributionSection";
import MediaSection from "@/components/admin/create-event/MediaSection";
import ReviewSubmitSection from "@/components/admin/create-event/ReviewSubmitSection";

type Props = {
  mode?: "create" | "edit";
  initialData?: any;
  eventId?: string;
};

export default function EventForm({
  mode = "create",
  initialData = {},
  eventId,
}: Props) {
  /* ================= STATE ================= */

  const [form, setForm] = useState<any>(initialData || {});
  const [original, setOriginal] = useState<any>(initialData || {});
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  /* MEDIA */
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  /* CATEGORY (separate state) */
  const [categories, setCategories] = useState<any[]>(
    initialData?.categories || [],
  );

  /* ================= SYNC INITIAL DATA ================= */

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setOriginal(initialData);
      setCategories(initialData.categories || []);
    }
  }, [initialData]);

  /* ================= NESTED UPDATE ================= */

  const update = (path: string, value: any) => {
    setForm((prev: any) => {
      const keys = path.split(".");
      const newObj = { ...prev };

      let current = newObj;

      keys.forEach((k, i) => {
        if (i === keys.length - 1) {
          current[k] = value;
        } else {
          current[k] = current[k] || {};
          current = current[k];
        }
      });

      return newObj;
    });
  };

  /* ================= DIFF FUNCTION ================= */

  function getDiff(oldObj: any, newObj: any) {
    let diff: any = {};

    for (const key in newObj) {
      if (typeof newObj[key] === "object" && !Array.isArray(newObj[key])) {
        const nested = getDiff(oldObj[key] || {}, newObj[key]);
        if (Object.keys(nested).length) diff[key] = nested;
      } else if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
        diff[key] = newObj[key];
      }
    }

    return diff;
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    try {
      setLoading(true);

      let url = "/api/admin/create-event";
      let method = "POST";

      if (mode === "edit") {
        url = `/api/admin/events/${eventId}`;
        method = "PATCH";
      }

      const fullData = {
        ...form,
        categories,
      };

      let payload = fullData;

      if (mode === "edit") {
        payload = getDiff(original, fullData);
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error");
        setLoading(false);
        return;
      }

      alert(
        mode === "edit"
          ? "Event Updated Successfully"
          : "Event Created Successfully",
      );

      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Unexpected error");
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* BASIC */}
      <BasicInfoSection data={form} errors={errors} onChange={update} />

      {/* ORGANIZER */}
      <OrganizerSection data={form} errors={errors} onChange={update} />

      {/* REGISTRATION */}
      <RegistrationSection data={form} errors={errors} onChange={update} />

      {/* CATEGORY */}
      <CategoryBuilderSection
        categories={categories}
        setCategories={setCategories}
        errors={errors}
      />

      {/* INCLUSIONS */}
      <EventInclusionsSection data={form} onChange={update} />

      {/* KIT */}
      <KitDistributionSection data={form} onChange={update} />

      {/* MEDIA */}
      <MediaSection
        data={form}
        errors={errors}
        onChange={update}
        bannerPreview={bannerPreview}
        setBannerFile={setBannerFile}
        setBannerPreview={setBannerPreview}
        uploadProgress={uploadProgress}
        setUploadProgress={setUploadProgress}
      />

      {/* REVIEW */}
      <ReviewSubmitSection
        data={{ ...form, categories }}
        bannerPreview={bannerPreview}
        onSubmit={handleSubmit}
        loading={loading}
        onEdit={() => {}}
      />
    </div>
  );
}
