"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AnimatedInput from "@/components/ui/AnimatedInput";
import AnimatedSelect from "@/components/ui/AnimatedSelect";
import AnimatedRadioGroup from "@/components/ui/AnimatedRadioGroup";
import {
  UserIcon,
  PhoneIcon,
  IdentificationIcon,
  CalendarIcon,
  TicketIcon,
  HeartIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  UsersIcon,
  ChevronDownIcon,
  TagIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  LinkIcon,
  ChatBubbleLeftRightIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  PlayCircleIcon,
  CameraIcon,
  ArrowsRightLeftIcon,
  UserMinusIcon,
  UserPlusIcon,
  TrashIcon,
  PlusIcon,
  PhotoIcon,
  UserGroupIcon,
  InformationCircleIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
interface Category {
  title: string;
  price: string;
  minAge: string;
  maxAge: string;
  distance: string;
  maxSeats: string;
}

type Tab = "basic" | "organizer" | "categories" | "media";

export default function CreateEventPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("basic");

  /* -------- VALIDATION STATE -------- */
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [event, setEvent] = useState({
    name: "",
    slug: "",
    date: "",
    gateOpen: "",
    raceStart: "",
    venue: "",
    city: "",
    mapLink: "",
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
    description: "",
    registrationStatus: "open",
  });

  const [categories, setCategories] = useState<Category[]>([
    {
      title: "",
      price: "",
      minAge: "",
      maxAge: "",
      distance: "",
      maxSeats: "",
    },
  ]);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleEventChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (
    index: number,
    field: keyof Category,
    value: string,
  ) => {
    const updated = [...categories];
    updated[index][field] = value;
    setCategories(updated);
  };

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        title: "",
        price: "",
        minAge: "",
        maxAge: "",
        distance: "",
        maxSeats: "",
      },
    ]);
  };

  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;

    return <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>;
  };
  /* --------- FORM VALIDATION --------- */
  /*   const uploadBannerAndGetURL = async () => {
  if (!bannerFile) return null;

  const storageRef = ref(
    storage,
    `event-banners/${event.slug}-${Date.now()}`
  );

  await uploadBytes(storageRef, bannerFile);
  const url = await getDownloadURL(storageRef);

  return url;
}; */

  const isBasicTabValid = () => {
    return (
      event.name &&
      event.slug &&
      event.date &&
      event.raceStart &&
      event.venue &&
      event.city &&
      event.mapLink &&
      event.registrationStart &&
      event.registrationEnd
    );
  };

  const isOrganizerTabValid = () => {
    return event.organizerName && event.organizerEmail && event.organizerPhone;
  };

  const isCategoriesTabValid = () => {
    return (
      categories.length > 0 &&
      categories.every(
        (cat) =>
          cat.title && cat.price && cat.minAge && cat.maxAge && cat.distance,
      )
    );
  };

  const isMediaTabValid = () => {
    //return Boolean(bannerPreview); // banner required
    return true;
  };

  const isFormValid = () => {
    return (
      event.name &&
      event.slug &&
      event.date &&
      event.raceStart &&
      event.venue &&
      event.city &&
      event.mapLink &&
      event.organizerName &&
      event.organizerEmail &&
      event.organizerPhone &&
      event.registrationStart &&
      event.registrationEnd &&
      categories.length > 0
    );
  };

  const defaultRules = {
    ageRules: [],

    stateRules: {
      allowAllIndia: true,
      allowedStates: [],
      extraChargeOutsideState: 0,
    },

    pricingRules: {},

    alertMessages: [],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!event.name) newErrors.name = "Event name is required";
    if (!event.slug) newErrors.slug = "URL Slug is mandatory";
    if (!event.date) newErrors.date = "Event date is required";
    if (!event.raceStart) newErrors.raceStart = "Race start time is required";
    if (!event.venue) newErrors.venue = "Venue is required";
    if (!event.city) newErrors.city = "City is required";
    if (!event.mapLink) newErrors.mapLink = "Google Maps link is required";
    if (!event.organizerName)
      newErrors.organizerName = "Organizer name is required";
    if (!event.organizerEmail)
      newErrors.organizerEmail = "Organizer email is required";
    if (!event.organizerPhone)
      newErrors.organizerPhone = "Organizer phone is required";
    if (!event.registrationStart)
      newErrors.registrationStart = "Registration start date required";
    if (!event.registrationEnd)
      newErrors.registrationEnd = "Registration end date required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // ✅ TEMPORARY placeholder banner (free)
      const placeholderBanner =
        "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80";

      const eventData = {
        ...event,
        categories,
        bannerURL: placeholderBanner,
        rules: defaultRules, // 👈 ADD THIS LINE
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.uid || null,
        status: "upcoming",
      };

      const docRef = await addDoc(collection(db, "events"), eventData);
      console.log("Saved with ID:", docRef.id);

      router.push("/admin/events");
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const tabClass = (tab: Tab) => {
    const isError =
      (tab === "basic" && !isBasicTabValid()) ||
      (tab === "organizer" && !isOrganizerTabValid()) ||
      (tab === "categories" && !isCategoriesTabValid()) ||
      (tab === "media" && !isMediaTabValid());

    if (activeTab === tab) {
      return isError
        ? "px-5 py-2 rounded-lg bg-red-600 text-white"
        : "px-5 py-2 rounded-lg bg-blue-600 text-white";
    }

    return isError
      ? "px-5 py-2 rounded-lg bg-red-100 text-red-700 border border-red-300"
      : "px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200";
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Create New Event
      </h1>

      {/* TABS */}
      <div className="mb-8 rounded-2xl bg-gray-100 p-2 shadow-inner">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`${tabClass("basic")} flex items-center justify-center gap-2`}
          >
            <InformationCircleIcon className="h-5 w-5" />
            <span>Basic</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("organizer")}
            className={`${tabClass("organizer")} flex items-center justify-center gap-2`}
          >
            <UserGroupIcon className="h-5 w-5" />
            <span>Organizer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`${tabClass("categories")} flex items-center justify-center gap-2`}
          >
            <Squares2X2Icon className="h-5 w-5" />
            <span>Categories</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`${tabClass("media")} flex items-center justify-center gap-2`}
          >
            <PhotoIcon className="h-5 w-5" />
            <span>Media</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ========== BASIC TAB ========== */}
        {activeTab === "basic" && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-semibold">Basic Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* ROW 1 */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Event Name <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="name"
                  placeholder="Enter event name"
                  required
                  value={event.name}
                  onChange={handleEventChange}
                  icon={<UserIcon className="h-5 w-5" />}
                />

                <FieldError error={errors.name} />
              </div>
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  URL Slug <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="slug"
                  placeholder="event-url-slug"
                  required
                  value={event.slug}
                  onChange={handleEventChange}
                  icon={<LinkIcon className="h-5 w-5" />}
                />

                <FieldError error={errors.slug} />
              </div>

              {/* EVENT DATE */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Event Date <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="date"
                  type="date"
                  required
                  value={event.date}
                  onChange={handleEventChange}
                  icon={<CalendarDaysIcon className="h-5 w-5" />}
                />

                <FieldError error={errors.date} />
              </div>

              {/* GATE OPEN TIME */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Gate Open Time (Optional)
                </label>

                <AnimatedInput
                  name="gateOpen"
                  type="time"
                  value={event.gateOpen}
                  onChange={handleEventChange}
                  icon={<ClockIcon className="h-5 w-5" />}
                />
              </div>

              {/* RACE START TIME */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Race Start Time <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="raceStart"
                  type="time"
                  required
                  value={event.raceStart}
                  onChange={handleEventChange}
                  icon={<ClockIcon className="h-5 w-5" />}
                />

                <FieldError error={errors.raceStart} />
              </div>

              {/* ADDRESS */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="venue"
                  placeholder="Event venue address"
                  required
                  value={event.venue}
                  onChange={handleEventChange}
                  icon={<MapPinIcon className="h-5 w-5" />}
                />

                <FieldError error={errors.venue} />
              </div>

              {/* CITY */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="city"
                  placeholder="City name"
                  required
                  value={event.city}
                  onChange={handleEventChange}
                  icon={<BuildingOfficeIcon className="h-5 w-5" />}
                />

                <FieldError error={errors.city} />
              </div>

              {/* GOOGLE MAPS LINK */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Google Maps Link <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="mapLink"
                  placeholder="https://maps.google.com/..."
                  required
                  value={event.mapLink}
                  onChange={handleEventChange}
                  icon={<LinkIcon className="h-5 w-5" />}
                />

                <FieldError error={errors.mapLink} />
              </div>

              {/* EVENT DESCRIPTION */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Event Description
                </label>

                <textarea
                  name="description"
                  rows={4}
                  value={event.description}
                  onChange={handleEventChange}
                  placeholder="Describe the event..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              {/* REGISTRATION STATUS */}
              <div className="space-y-2 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Registration Status <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-4">
                  {/* OPEN */}
                  <label className="flex items-center gap-2 cursor-pointer rounded-xl border px-4 py-2 hover:border-red-400 transition">
                    <input
                      type="radio"
                      name="registrationStatus"
                      value="open"
                      checked={event.registrationStatus === "open"}
                      onChange={handleEventChange}
                      className="h-4 w-4 accent-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Open
                    </span>
                  </label>

                  {/* CLOSED */}
                  <label className="flex items-center gap-2 cursor-pointer rounded-xl border px-4 py-2 hover:border-gray-400 transition">
                    <input
                      type="radio"
                      name="registrationStatus"
                      value="closed"
                      checked={event.registrationStatus === "closed"}
                      onChange={handleEventChange}
                      className="h-4 w-4 accent-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Closed
                    </span>
                  </label>
                </div>

                <FieldError error={errors.registrationStatus} />
              </div>
            </div>

            <h2 className="text-lg font-semibold mt-6">
              Registration Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* REGISTRATION START DATE */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Registration Start Date{" "}
                  <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="registrationStart"
                  type="date"
                  required
                  value={event.registrationStart}
                  onChange={handleEventChange}
                  icon={<CalendarDaysIcon className="h-5 w-5" />}
                />

                <FieldError error={errors.registrationStart} />
              </div>

              {/* REGISTRATION END DATE */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Registration End Date <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="registrationEnd"
                  type="date"
                  required
                  value={event.registrationEnd}
                  onChange={handleEventChange}
                  icon={<CalendarDaysIcon className="h-5 w-5" />}
                />

                <FieldError error={errors.registrationEnd} />
              </div>

              {/* MAX PARTICIPANTS */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Max Participants
                </label>

                <AnimatedInput
                  name="maxParticipants"
                  type="number"
                  placeholder="Maximum allowed participants"
                  value={event.maxParticipants}
                  onChange={handleEventChange}
                  icon={<UsersIcon className="h-5 w-5" />}
                />
              </div>
            </div>
          </section>
        )}

        {/* ========== ORGANIZER TAB ========== */}
        {activeTab === "organizer" && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-semibold">Organizer Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ORGANIZER NAME */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Organizer Name <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="organizerName"
                  placeholder="Organizer name"
                  required
                  value={event.organizerName}
                  onChange={handleEventChange}
                  icon={<UserIcon className="h-5 w-5" />}
                />

                <FieldError error={errors.organizerName} />
              </div>

              {/* ORGANIZER EMAIL */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Organizer Email <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="organizerEmail"
                  type="email"
                  placeholder="organizer@email.com"
                  required
                  value={event.organizerEmail}
                  onChange={handleEventChange}
                  icon={<EnvelopeIcon className="h-5 w-5" />}
                />

                <FieldError error={errors.organizerEmail} />
              </div>

              {/* ORGANIZER PHONE */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Organizer Phone <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="organizerPhone"
                  placeholder="Phone number"
                  required
                  value={event.organizerPhone}
                  onChange={handleEventChange}
                  icon={<PhoneIcon className="h-5 w-5" />}
                />

                <FieldError error={errors.organizerPhone} />
              </div>

              {/* SUPPORT EMAIL */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Support Email (Optional)
                </label>

                <AnimatedInput
                  name="supportEmail"
                  type="email"
                  placeholder="support@email.com"
                  value={event.supportEmail}
                  onChange={handleEventChange}
                  icon={<EnvelopeIcon className="h-5 w-5" />}
                />
              </div>
            </div>

            <h2 className="text-lg font-semibold mt-6">
              Social Links (Optional)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WHATSAPP LINK */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  WhatsApp Link
                </label>

                <AnimatedInput
                  name="whatsapp"
                  placeholder="https://wa.me/91XXXXXXXXXX"
                  value={event.whatsapp}
                  onChange={handleEventChange}
                  icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
                />
              </div>

              {/* FACEBOOK LINK */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Facebook Link
                </label>

                <AnimatedInput
                  name="facebook"
                  placeholder="https://facebook.com/yourpage"
                  value={event.facebook}
                  onChange={handleEventChange}
                  icon={<GlobeAltIcon className="h-5 w-5" />}
                />
              </div>

              {/* INSTAGRAM LINK */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Instagram Link
                </label>

                <AnimatedInput
                  name="instagram"
                  placeholder="https://instagram.com/yourpage"
                  value={event.instagram}
                  onChange={handleEventChange}
                  icon={<CameraIcon className="h-5 w-5" />}
                />
              </div>

              {/* YOUTUBE LINK */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  YouTube Link
                </label>

                <AnimatedInput
                  name="youtube"
                  placeholder="https://youtube.com/channel/..."
                  value={event.youtube}
                  onChange={handleEventChange}
                  icon={<PlayCircleIcon className="h-5 w-5" />}
                />
              </div>
            </div>
          </section>
        )}

        {/* ========== CATEGORIES TAB ========== */}
        {activeTab === "categories" && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>

            {categories.map((cat, i) => (
              <div key={i} className="bg-[#F7FAFF] rounded-xl p-5 mb-5 border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* CATEGORY TITLE */}
                  <div className="space-y-1 px-5">
                    <label className="block text-sm font-medium text-gray-700">
                      Category Title
                    </label>

                    <AnimatedInput
                      name={`category-title-${i}`}
                      placeholder="Category title"
                      value={cat.title}
                      onChange={(e) =>
                        handleCategoryChange(i, "title", e.target.value)
                      }
                      icon={<TagIcon className="h-5 w-5" />}
                    />
                  </div>

                  {/* CATEGORY PRICE */}
                  <div className="space-y-1 px-5">
                    <label className="block text-sm font-medium text-gray-700">
                      Price (₹)
                    </label>

                    <AnimatedInput
                      name={`category-price-${i}`}
                      type="number"
                      placeholder="Entry fee"
                      value={cat.price}
                      onChange={(e) =>
                        handleCategoryChange(i, "price", e.target.value)
                      }
                      icon={<CurrencyRupeeIcon className="h-5 w-5" />}
                    />
                  </div>

                  {/* CATEGORY DISTANCE */}
                  <div className="space-y-1 px-5">
                    <label className="block text-sm font-medium text-gray-700">
                      Distance
                    </label>

                    <AnimatedInput
                      name={`category-distance-${i}`}
                      placeholder="10K / 5K"
                      value={cat.distance}
                      onChange={(e) =>
                        handleCategoryChange(i, "distance", e.target.value)
                      }
                      icon={<ArrowsRightLeftIcon className="h-5 w-5" />}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* MIN AGE */}
                  <div className="space-y-1 px-5">
                    <label className="block text-sm font-medium text-gray-700">
                      Min Age
                    </label>

                    <AnimatedInput
                      name={`category-min-age-${i}`}
                      type="number"
                      placeholder="Minimum age"
                      value={cat.minAge}
                      onChange={(e) =>
                        handleCategoryChange(i, "minAge", e.target.value)
                      }
                      icon={<UserMinusIcon className="h-5 w-5" />}
                    />
                  </div>

                  {/* MAX AGE */}
                  <div className="space-y-1 px-5">
                    <label className="block text-sm font-medium text-gray-700">
                      Max Age
                    </label>

                    <AnimatedInput
                      name={`category-max-age-${i}`}
                      type="number"
                      placeholder="Maximum age"
                      value={cat.maxAge}
                      onChange={(e) =>
                        handleCategoryChange(i, "maxAge", e.target.value)
                      }
                      icon={<UserPlusIcon className="h-5 w-5" />}
                    />
                  </div>

                  {/* MAX SEATS */}
                  <div className="space-y-1 px-5">
                    <label className="block text-sm font-medium text-gray-700">
                      Max Seats
                    </label>

                    <AnimatedInput
                      name={`category-max-seats-${i}`}
                      type="number"
                      placeholder="Seat limit"
                      value={cat.maxSeats}
                      onChange={(e) =>
                        handleCategoryChange(i, "maxSeats", e.target.value)
                      }
                      icon={<UsersIcon className="h-5 w-5" />}
                    />
                  </div>
                </div>

                {/* REMOVE CATEGORY BUTTON */}
                {categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCategory(i)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2
               text-sm font-semibold text-red-600
               hover:bg-red-100 hover:shadow-sm
               transition"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Remove Category
                  </button>
                )}
              </div>
            ))}

            {/* ADD CATEGORY BUTTON */}
            <button
              type="button"
              onClick={addCategory}
              className="mt-4 inline-flex items-center gap-2 rounded-xl
             bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white
             shadow-md hover:bg-blue-700 hover:shadow-lg
             transition"
            >
              <PlusIcon className="h-5 w-5" />
              Add Another Category
            </button>
          </section>
        )}

        {/* ========== MEDIA TAB ========== */}
        {activeTab === "media" && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-semibold">Banner Image</h2>

            {/* EVENT BANNER UPLOAD */}
            <div className="space-y-2 px-5">
              <label className="block text-sm font-medium text-gray-700">
                Event Banner
              </label>

              <label
                className="flex flex-col items-center justify-center gap-2
                    rounded-2xl border-2 border-dashed border-gray-300
                    bg-gray-50 px-6 py-8 cursor-pointer
                    hover:border-blue-500 hover:bg-blue-50
                    transition text-center"
              >
                <PhotoIcon className="h-8 w-8 text-gray-400" />

                <p className="text-sm font-medium text-gray-700">
                  Click to upload banner
                </p>
                <p className="text-xs text-gray-500">
                  JPG / PNG • Recommended 1200 × 600
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </label>

              {bannerPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </p>
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-56 object-cover rounded-2xl border shadow-sm"
                  />
                </div>
              )}
            </div>

            <h2 className="text-lg font-semibold mt-6">Terms & Policies</h2>

            {/* TERMS & CONDITIONS */}
            <div className="space-y-1 px-5">
              <label className="block text-sm font-medium text-gray-700">
                Terms & Conditions
              </label>

              <textarea
                name="terms"
                rows={3}
                placeholder="Enter terms & conditions"
                value={event.terms}
                onChange={handleEventChange}
                className="w-full  border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               transition"
              />
            </div>

            {/* REFUND POLICY */}
            <div className="space-y-1 px-5">
              <label className="block text-sm font-medium text-gray-700">
                Refund Policy
              </label>

              <textarea
                name="refundPolicy"
                rows={2}
                placeholder="Enter refund policy"
                value={event.refundPolicy}
                onChange={handleEventChange}
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               transition"
              />
            </div>

            {/* MEDICAL / SAFETY NOTE */}
            <div className="space-y-1 px-5">
              <label className="block text-sm font-medium text-gray-700">
                Medical / Safety Note
              </label>

              <textarea
                name="medicalNote"
                rows={2}
                placeholder="Important medical or safety instructions"
                value={event.medicalNote}
                onChange={handleEventChange}
                className="w-full  border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               transition"
              />
            </div>
          </section>
        )}

        <button
          type="submit"
          disabled={
            !isBasicTabValid() ||
            !isOrganizerTabValid() ||
            !isCategoriesTabValid() ||
            !isMediaTabValid()
          }
          className={`px-6 py-3 rounded-xl transition font-semibold
    ${
      isBasicTabValid() &&
      isOrganizerTabValid() &&
      isCategoriesTabValid() &&
      isMediaTabValid()
        ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
        : "bg-gray-300 text-gray-600 cursor-not-allowed"
    }
  `}
        >
          Save Event
        </button>

        {!isFormValid() && (
          <p className="text-sm text-red-500 mt-2">
            Please complete all mandatory fields (*) before saving.
          </p>
        )}
      </form>
    </div>
  );
}
