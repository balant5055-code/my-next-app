"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AnimatedInput from "@/components/ui/AnimatedInput";

import {
  TagIcon,
  LinkIcon,
  CalendarDaysIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  MapIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  PhotoIcon,
  CurrencyRupeeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const RED_ICON = "h-5 w-5 text-red-600";

  const INDIAN_STATES = [
    "Tamil Nadu",
    "Kerala",
    "Karnataka",
    "Andhra Pradesh",
    "Telangana",
    "Maharashtra",
    "Delhi",
  ];

  const [event, setEvent] = useState<any>(null);

  /* ---------------- FETCH EVENT ---------------- */
  useEffect(() => {
    const fetchEvent = async () => {
      const ref = doc(db, "events", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.push("/admin/events");
        return;
      }

      const data = snap.data();

      setEvent({
        ...data,
        categories: data.categories || [],
        rules: data.rules || {
          stateRules: {
            allowAllIndia: true,
            allowedStates: [],
          },
        },
      });

      setLoading(false);
    };

    fetchEvent();
  }, [id, router]);

  if (loading || !event) return <p>Loading...</p>;

  /* ---------------- BASIC CHANGE HANDLER ---------------- */
  const handleChange = (e: any) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  /* ---------------- CATEGORY HANDLER ---------------- */
  const handleCategoryChange = (index: number, field: string, value: string) => {
    const updated = [...event.categories];
    updated[index][field] = value;
    setEvent({ ...event, categories: updated });
  };

  const addCategory = () => {
    setEvent({
      ...event,
      categories: [
        ...event.categories,
        {
          title: "",
          distance: "",
          price: "",
          minAge: "",
          maxAge: "",
          maxSeats: "",
        },
      ],
    });
  };

  const removeCategory = (index: number) => {
    const updated = event.categories.filter(
      (_: any, i: number) => i !== index
    );
    setEvent({ ...event, categories: updated });
  };

  /* ---------------- SAVE ---------------- */
  const handleUpdate = async () => {
    const ref = doc(db, "events", id as string);

    const clean = { ...event };
    delete clean.createdAt;
    delete clean.createdBy;

    await updateDoc(ref, {
      ...clean,
      updatedAt: new Date().toISOString(),
    });

    router.push("/admin/events");
  };

  return (
    <div className="max-w-6xl space-y-12">
      <h1 className="text-3xl font-bold">Edit Event</h1>

      {/* ---------------- BASIC DETAILS ---------------- */}
      <Section title="Basic Details">
        <AnimatedInput name="name" value={event.name} onChange={handleChange} icon={<TagIcon className={RED_ICON} />} />
        <AnimatedInput name="slug" value={event.slug} onChange={handleChange} icon={<LinkIcon className={RED_ICON} />} />
        <AnimatedInput type="date" name="date" value={event.date} onChange={handleChange} icon={<CalendarDaysIcon className={RED_ICON} />} />
        <AnimatedInput name="city" value={event.city} onChange={handleChange} icon={<MapPinIcon className={RED_ICON} />} />
        <AnimatedInput name="venue" value={event.venue} onChange={handleChange} icon={<BuildingOfficeIcon className={RED_ICON} />} />
        <AnimatedInput name="mapLink" value={event.mapLink} onChange={handleChange} icon={<MapIcon className={RED_ICON} />} />
        <AnimatedInput type="time" name="gateOpen" value={event.gateOpen} onChange={handleChange} icon={<ClockIcon className={RED_ICON} />} />
        <AnimatedInput type="time" name="raceStart" value={event.raceStart} onChange={handleChange} icon={<ClockIcon className={RED_ICON} />} />
        <AnimatedInput name="bannerURL" value={event.bannerURL} onChange={handleChange} icon={<PhotoIcon className={RED_ICON} />} />

        {event.bannerURL && (
          <img src={event.bannerURL} className="h-48 rounded-xl mt-4 object-cover" />
        )}
      </Section>

      {/* ---------------- ORGANIZER ---------------- */}
      <Section title="Organizer">
        <AnimatedInput name="organizerName" value={event.organizerName} onChange={handleChange} icon={<UserIcon className={RED_ICON} />} />
        <AnimatedInput name="organizerEmail" value={event.organizerEmail} onChange={handleChange} icon={<EnvelopeIcon className={RED_ICON} />} />
        <AnimatedInput name="organizerPhone" value={event.organizerPhone} onChange={handleChange} icon={<PhoneIcon className={RED_ICON} />} />
        <AnimatedInput name="supportEmail" value={event.supportEmail} onChange={handleChange} icon={<EnvelopeIcon className={RED_ICON} />} />
      </Section>

      {/* ---------------- SOCIAL LINKS ---------------- */}
      <Section title="Social Links">
        <AnimatedInput name="whatsapp" value={event.whatsapp} onChange={handleChange} icon={<GlobeAltIcon className={RED_ICON} />} />
        <AnimatedInput name="facebook" value={event.facebook} onChange={handleChange} icon={<GlobeAltIcon className={RED_ICON} />} />
        <AnimatedInput name="instagram" value={event.instagram} onChange={handleChange} icon={<GlobeAltIcon className={RED_ICON} />} />
        <AnimatedInput name="youtube" value={event.youtube} onChange={handleChange} icon={<GlobeAltIcon className={RED_ICON} />} />
      </Section>

      {/* ---------------- CATEGORIES ---------------- */}
      <Section title="Categories">
        {event.categories.map((cat: any, i: number) => (
          <div key={i} className="border rounded-xl p-4 space-y-2 bg-gray-50">
            <AnimatedInput name={`title-${i}`} value={cat.title} onChange={(e) => handleCategoryChange(i, "title", e.target.value)} icon={<TagIcon className={RED_ICON} />} />
            <AnimatedInput name={`distance-${i}`} value={cat.distance} onChange={(e) => handleCategoryChange(i, "distance", e.target.value)} icon={<MapPinIcon className={RED_ICON} />} />
            <AnimatedInput name={`price-${i}`} value={cat.price} onChange={(e) => handleCategoryChange(i, "price", e.target.value)} icon={<CurrencyRupeeIcon className={RED_ICON} />} />
            <AnimatedInput name={`minAge-${i}`} value={cat.minAge} onChange={(e) => handleCategoryChange(i, "minAge", e.target.value)} icon={<UserIcon className={RED_ICON} />} />
            <AnimatedInput name={`maxAge-${i}`} value={cat.maxAge} onChange={(e) => handleCategoryChange(i, "maxAge", e.target.value)} icon={<UserIcon className={RED_ICON} />} />
            <AnimatedInput name={`maxSeats-${i}`} value={cat.maxSeats} onChange={(e) => handleCategoryChange(i, "maxSeats", e.target.value)} icon={<UsersIcon className={RED_ICON} />} />

            <button onClick={() => removeCategory(i)} className="text-red-600 text-sm">
              Remove Category
            </button>
          </div>
        ))}

        <button onClick={addCategory} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Category
        </button>
      </Section>

      {/* ---------------- STATE RULES ---------------- */}
      <Section title="State Rules">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={event.rules.stateRules.allowAllIndia}
            onChange={(e) =>
              setEvent({
                ...event,
                rules: {
                  ...event.rules,
                  stateRules: {
                    ...event.rules.stateRules,
                    allowAllIndia: e.target.checked,
                  },
                },
              })
            }
          />
          Allow All India
        </label>

        {!event.rules.stateRules.allowAllIndia && (
          <select
            multiple
            value={event.rules.stateRules.allowedStates}
            onChange={(e) => {
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              setEvent({
                ...event,
                rules: {
                  ...event.rules,
                  stateRules: {
                    ...event.rules.stateRules,
                    allowedStates: selected,
                  },
                },
              });
            }}
            className="border rounded-lg p-2 h-40"
          >
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        )}
      </Section>

      <button
        onClick={handleUpdate}
        className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold"
      >
        Update Event
      </button>
    </div>
  );
}

const Section = ({ title, children }: any) => (
  <section className="bg-white rounded-3xl p-8 shadow space-y-6">
    <h2 className="text-lg font-semibold">{title}</h2>
    {children}
  </section>
);
