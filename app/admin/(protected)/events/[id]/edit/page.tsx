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
  PlayIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LifebuoyIcon,
  UsersIcon,
  FlagIcon,
  DocumentTextIcon,
  HeartIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [event, setEvent] = useState<any>({
    name: "",
    slug: "",
    date: "",
    city: "",
    venue: "",
    mapLink: "",
    gateOpen: "",
    raceStart: "",
    description: "",

    organizerName: "",
    organizerEmail: "",
    organizerPhone: "",
    supportEmail: "",

    registrationStart: "",
    registrationEnd: "",
    maxParticipants: "",

    whatsapp: "",
    facebook: "",
    instagram: "",
    youtube: "",

    terms: "",
    refundPolicy: "",
    medicalNote: "",

    registrationStatus: "open",
    categories: [],
  });

  /* ---------- FETCH ---------- */
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
        ...event,
        ...data,
        registrationStatus:
          data.registrationStatus || data["registrationStatus "] || "open",
      });

      setLoading(false);
    };

    fetchEvent();
    // eslint-disable-next-line
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const ref = doc(db, "events", id as string);
    const clean = { ...event };
    delete clean["registrationStatus "];

    await updateDoc(ref, {
      ...clean,
      updatedAt: new Date().toISOString(),
    });

    router.push("/admin/events");
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="max-w-6xl space-y-12">
      <h1 className="text-3xl font-bold text-gray-900">
        Edit Event
      </h1>

      {/* BASIC */}
      <Section title="Basic Event Details">
        <Grid>
          <Field label="Event Name" icon={TagIcon}>
            <AnimatedInput name="name" value={event.name} onChange={handleChange} />
          </Field>

          <Field label="URL Slug" icon={LinkIcon}>
            <AnimatedInput name="slug" value={event.slug} onChange={handleChange} />
          </Field>

          <Field label="Event Date" icon={CalendarDaysIcon}>
            <AnimatedInput type="date" name="date" value={event.date} onChange={handleChange} />
          </Field>

          <Field label="City" icon={MapPinIcon}>
            <AnimatedInput name="city" value={event.city} onChange={handleChange} />
          </Field>

          <Field label="Venue / Address" icon={BuildingOfficeIcon}>
            <AnimatedInput name="venue" value={event.venue} onChange={handleChange} />
          </Field>

          <Field label="Google Maps Link" icon={MapIcon}>
            <AnimatedInput name="mapLink" value={event.mapLink} onChange={handleChange} />
          </Field>

          <Field label="Gate Open Time" icon={ClockIcon}>
            <AnimatedInput type="time" name="gateOpen" value={event.gateOpen} onChange={handleChange} />
          </Field>

          <Field label="Race Start Time" icon={PlayIcon}>
            <AnimatedInput type="time" name="raceStart" value={event.raceStart} onChange={handleChange} />
          </Field>
        </Grid>

        <Textarea label="Event Description" icon={DocumentTextIcon}>
          <textarea
            name="description"
            value={event.description}
            onChange={handleChange}
            rows={4}
            className="input-style"
          />
        </Textarea>
      </Section>

      {/* ORGANIZER */}
      <Section title="Organizer Details">
        <Grid>
          <Field label="Organizer Name" icon={UserIcon}>
            <AnimatedInput name="organizerName" value={event.organizerName} onChange={handleChange} />
          </Field>

          <Field label="Organizer Email" icon={EnvelopeIcon}>
            <AnimatedInput name="organizerEmail" value={event.organizerEmail} onChange={handleChange} />
          </Field>

          <Field label="Organizer Phone" icon={PhoneIcon}>
            <AnimatedInput name="organizerPhone" value={event.organizerPhone} onChange={handleChange} />
          </Field>

          <Field label="Support Email" icon={LifebuoyIcon}>
            <AnimatedInput name="supportEmail" value={event.supportEmail} onChange={handleChange} />
          </Field>
        </Grid>
      </Section>

      {/* REGISTRATION */}
      <Section title="Registration Settings">
        <Grid>
          <Field label="Registration Start" icon={CalendarDaysIcon}>
            <AnimatedInput type="date" name="registrationStart" value={event.registrationStart} onChange={handleChange} />
          </Field>

          <Field label="Registration End" icon={CalendarDaysIcon}>
            <AnimatedInput type="date" name="registrationEnd" value={event.registrationEnd} onChange={handleChange} />
          </Field>

          <Field label="Max Participants" icon={UsersIcon}>
            <AnimatedInput name="maxParticipants" value={event.maxParticipants} onChange={handleChange} />
          </Field>
        </Grid>
      </Section>

      {/* POLICIES */}
      <Section title="Policies & Safety">
        <Textarea label="Terms & Conditions" icon={DocumentTextIcon}>
          <textarea name="terms" value={event.terms} onChange={handleChange} className="input-style" />
        </Textarea>

        <Textarea label="Refund Policy" icon={DocumentTextIcon}>
          <textarea name="refundPolicy" value={event.refundPolicy} onChange={handleChange} className="input-style" />
        </Textarea>

        <Textarea label="Medical / Safety Note" icon={HeartIcon}>
          <textarea name="medicalNote" value={event.medicalNote} onChange={handleChange} className="input-style" />
        </Textarea>
      </Section>

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          onClick={handleUpdate}
          className="rounded-full bg-red-600 px-10 py-3
                     text-white font-semibold shadow-lg
                     hover:bg-red-700 hover:shadow-xl transition"
        >
          Update Event
        </button>
      </div>
    </div>
  );
}

/* ---------- UI HELPERS ---------- */

const Section = ({ title, children }: any) => (
  <section className="bg-white rounded-3xl p-8 shadow-sm space-y-6">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    {children}
  </section>
);

const Grid = ({ children }: any) => (
  <div className="grid md:grid-cols-2 gap-6">{children}</div>
);

const Field = ({ label, icon: Icon, children }: any) => (
  <div className="space-y-1">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <Icon className="h-4 w-4 text-red-600" />
      {label}
    </label>
    {children}
  </div>
);

const Textarea = ({ label, icon: Icon, children }: any) => (
  <div className="space-y-1">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <Icon className="h-4 w-4 text-red-600" />
      {label}
    </label>
    {children}
  </div>
);
