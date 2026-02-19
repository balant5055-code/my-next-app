"use client";

import { useEffect, useState, useRef } from "react"; // ✅ FIX: added useRef
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MapPinIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import AnimatedInput from "@/components/ui/AnimatedInput";
import AnimatedSelect from "@/components/ui/AnimatedSelect";
import AnimatedRadioGroup from "@/components/ui/AnimatedRadioGroup";
import DateOfBirthInput from "@/components/ui/DateOfBirthInput";
import PopupModal from "@/components/ui/PopupModal";
import { secureFetch } from "@/lib/secureFetch";

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
} from "@heroicons/react/24/outline";
interface Category {
  id: string;
  title: string;
  price: number;
  minAge: number;
  maxAge: number;
  distance: string;
  maxSeats: number;
  bookedSeats?: number;
}

interface EventData {
  id: string;
  name: string;
  slug: string;
  date: Date | null;
  venue: string;
  city: string;
  bannerURL: string;
  categories: Category[];
  rules?: {
    stateRules?: {
      allowAllIndia: boolean;
      allowedStates: string[];
    };
  };
}

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [emailOptional, setEmailOptional] = useState(false);
  const [emergencyOptional, setEmergencyOptional] = useState(false);
  const [skipEmergencyName, setSkipEmergencyName] = useState(false);
  const [skipEmergencyNumber, setSkipEmergencyNumber] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showRunnerDropdown, setShowRunnerDropdown] = useState(false);
  const [runnerSearch, setRunnerSearch] = useState("");
  const [formError, setFormError] = useState("");
  const searchParams = useSearchParams();
  const [popup, setPopup] = useState<{
    open: boolean;
    message: string;
    type: "error" | "success";
  }>({
    open: false,
    message: "",
    type: "error",
  });

  const categoryFromURL = searchParams.get("category");
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ FIX: add ref for click outside
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 🔹 Required Fields
    if (!form.firstName) newErrors.firstName = "First name is required";
    if (!form.lastName) newErrors.lastName = "Last name is required";
    if (!form.gender) newErrors.gender = "Please select gender";
    if (!form.bloodGroup) newErrors.bloodGroup = "Please select blood group";
    if (!form.bibName) newErrors.bibName = "Bib name is required";
    if (!form.tshirtSize) newErrors.tshirtSize = "Please select T-shirt size";
    if (!form.address) newErrors.address = "Address is required";
    //if (!form.state) newErrors.state = "State is required";
    if (!form.pincode) newErrors.pincode = "Pincode is required";
    if (!form.phone) newErrors.phone = "WhatsApp number is required";
    if (!form.agree) newErrors.agree = "You must accept terms";

    // 🔥 STATE VALIDATION (FINAL CORRECT VERSION)

    if (!form.state) {
      newErrors.state = "State is required";
    } else if (
      event?.rules?.stateRules &&
      event.rules.stateRules.allowAllIndia === false &&
      event.rules.stateRules.allowedStates?.length > 0 &&
      !event.rules.stateRules.allowedStates.includes(form.state)
    ) {
      newErrors.state = `Registration is allowed only for: ${event.rules.stateRules.allowedStates.join(", ")}`;
    }

    // 🔥 DOB VALIDATION (FINAL SAFE VERSION)

    // 🔥 DOB VALIDATION (FINAL CORRECT VERSION)

    if (!form.dob) {
      newErrors.dob = "Please select Date of Birth.";
    } else if (cat && event?.date) {
      const normalizeDate = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const birthDate = normalizeDate(new Date(form.dob));

      if (isNaN(birthDate.getTime())) {
        newErrors.dob = "Invalid date selected.";
      } else {
        const eventDate = normalizeDate(event.date);

        const minAge = Number(cat.minAge);
        const maxAge = Number(cat.maxAge);

        const minEligibleDOB = normalizeDate(
          new Date(
            eventDate.getFullYear() - minAge,
            eventDate.getMonth(),
            eventDate.getDate(),
          ),
        );

        const maxEligibleDOB = normalizeDate(
          new Date(
            eventDate.getFullYear() - maxAge,
            eventDate.getMonth(),
            eventDate.getDate(),
          ),
        );

        // 🔥 TOO YOUNG
        if (!isNaN(minAge) && birthDate > minEligibleDOB) {
          newErrors.dob = `To register for ${cat.title}, your Date of Birth must be on or before ${minEligibleDOB.toLocaleDateString("en-GB")}.`;
        }

        // 🔥 TOO OLD
        else if (!isNaN(maxAge) && birthDate < maxEligibleDOB) {
          newErrors.dob = `Maximum age for ${cat.title} is ${maxAge} years as on event date.`;
        }
      }
    }

    setErrors(newErrors);

    // 🔥 Scroll to first error automatically
    if (Object.keys(newErrors).length > 0) {
      scrollToError(newErrors);
      return false;
    }

    return true;
  };

  const validateDOB = (dobValue: string) => {
    // Only validate if value exists
    if (!dobValue) return "";

    if (!cat || !event) return "";

    const birthDate = new Date(dobValue);
    if (!event?.date) return;

    const eventDate = event.date;

    const minAge = Number(cat.minAge);
    const maxAge = Number(cat.maxAge);

    if (!isNaN(minAge)) {
      const minEligibleDOB = new Date(
        eventDate.getFullYear() - minAge,
        eventDate.getMonth(),
        eventDate.getDate(),
      );

      if (birthDate > minEligibleDOB) {
        const formattedDate = minEligibleDOB.toLocaleDateString("en-GB");
        return `To register for ${cat.title}, your Date of Birth must be on or before ${formattedDate}.`;
      }
    }

    if (!isNaN(maxAge)) {
      const maxEligibleDOB = new Date(
        eventDate.getFullYear() - maxAge,
        eventDate.getMonth(),
        eventDate.getDate(),
      );

      if (birthDate < maxEligibleDOB) {
        return `Maximum eligible age for ${cat.title} is ${maxAge} years as on event date.`;
      }
    }

    return "";
  };

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    bibName: "",
    tshirtSize: "",
    address: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    emergencyName: "",
    emergencyNumber: "",
    couponCode: "",
    runnerClub: "",
    runnerClubOther: "",
    agree: false,
    bibNumber: null,
  });
  useEffect(() => {
    if (form.dob) {
      // Manually trigger DOB validation when category changes
      const fakeEvent = {
        target: {
          name: "dob",
          value: form.dob,
          type: "date",
          checked: false,
        },
      } as any;

      handleChange(fakeEvent);
    }
  }, [selectedCat]);

  useEffect(() => {
    if (emergencyOptional) {
      setForm((prev) => ({
        ...prev,
        emergencyName: "",
        emergencyNumber: "",
      }));
    }
  }, [emergencyOptional]);
  useEffect(() => {
    if (!event?.categories?.length) return;

    if (
      categoryFromURL &&
      event.categories.some((c) => c.title === categoryFromURL)
    ) {
      setSelectedCat(categoryFromURL);
    } else {
      setSelectedCat(event.categories[0].title);
    }
  }, [event, categoryFromURL]);
  useEffect(() => {
    if (!slug) return;

    const fetchEvent = async () => {
      const q = query(collection(db, "events"), where("slug", "==", slug));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const raw = docSnap.data();

        const formattedEvent: EventData = {
          id: docSnap.id,
          name: raw.name,
          slug: raw.slug,
          venue: raw.venue,
          city: raw.city,
          bannerURL: raw.bannerURL,
          categories: raw.categories ?? [],
          rules: raw.rules,

          date: raw.date?.toDate
            ? raw.date.toDate()
            : raw.date?.seconds
              ? new Date(raw.date.seconds * 1000)
              : null,
        };

        setEvent(formattedEvent);
      }

      setLoading(false);
    };

    fetchEvent();
  }, [slug]);

  // ✅ FIX: CLICK-OUTSIDE HANDLER (NEW)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowRunnerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleCategorySelect = (title: string) => {
    setSelectedCat(title);

    const params = new URLSearchParams(searchParams.toString());
    params.set("category", title);

    router.replace(`/events/${slug}/register?${params.toString()}`, {
      scroll: false,
    });
  };
  const getMinEligibleDOB = (eventDate: string, minAge: number) => {
    const eventDateObj = new Date(eventDate);
    const eligibleDate = new Date(
      eventDateObj.getFullYear() - minAge,
      eventDateObj.getMonth(),
      eventDateObj.getDate(),
    );

    return eligibleDate;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type, checked } = e.target as any;

    const fieldValue = type === "checkbox" ? checked : value;

    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (name === "dob") {
      const rawValue = value;

      setErrors((prev) => {
        const updated = { ...prev };

        if (!rawValue) {
          updated.dob = "Please select Date of Birth.";
          return updated;
        }

        if (!cat || !event?.date) return updated;

        const normalizeDate = (date: Date) =>
          new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const birthDate = normalizeDate(new Date(rawValue));

        if (isNaN(birthDate.getTime())) {
          updated.dob = "Invalid date selected.";
          return updated;
        }

        const eventDate = normalizeDate(event.date);

        const minAge = Number(cat.minAge);
        const maxAge = Number(cat.maxAge);

        const minEligibleDOB = normalizeDate(
          new Date(
            eventDate.getFullYear() - minAge,
            eventDate.getMonth(),
            eventDate.getDate(),
          ),
        );

        const maxEligibleDOB = normalizeDate(
          new Date(
            eventDate.getFullYear() - maxAge,
            eventDate.getMonth(),
            eventDate.getDate(),
          ),
        );

        // 🔥 TOO YOUNG
        if (!isNaN(minAge) && birthDate > minEligibleDOB) {
          updated.dob = `To register for ${cat.title}, your Date of Birth must be on or before ${minEligibleDOB.toLocaleDateString("en-GB")}.`;
          return updated;
        }

        // 🔥 TOO OLD
        if (!isNaN(maxAge) && birthDate < maxEligibleDOB) {
          updated.dob = `Maximum age for ${cat.title} is ${maxAge} years as on event date.`;
          return updated;
        }

        delete updated.dob;
        return updated;
      });
    }

    setErrors((prev) => {
      const updated = { ...prev };

      // Required field validation (EXCEPT state)
      const requiredFields = [
        "firstName",
        "lastName",
        "gender",
        "bloodGroup",
        "bibName",
        "tshirtSize",
        "address",
        "pincode",
        "phone",
      ];

      if (requiredFields.includes(name)) {
        if (!fieldValue) {
          updated[name] = "This field is required";
        } else {
          delete updated[name];
        }
      }

      console.log(event);

      // 🔥 STATE VALIDATION (ONLY HERE)
      if (name === "state") {
        if (!fieldValue) {
          updated.state = "State is required";
        } else if (
          event?.rules?.stateRules &&
          event.rules.stateRules.allowAllIndia === false &&
          event.rules.stateRules.allowedStates?.length > 0 &&
          !event.rules.stateRules.allowedStates.includes(fieldValue)
        ) {
          updated.state = `Registration is allowed only for: ${event.rules.stateRules.allowedStates.join(", ")}`;
        } else {
          delete updated.state;
        }
      }
      return updated;
    });

    setFormError("");
  };

  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;

    return <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>;
  };

  const cat = event?.categories.find((c) => c.title === selectedCat) || null;
  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const scrollToError = (errorsObj: Record<string, string>) => {
    const firstErrorKey = Object.keys(errorsObj)[0];

    if (!firstErrorKey) return;

    const element = document.querySelector(
      `[name="${firstErrorKey}"]`,
    ) as HTMLElement | null;

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      element.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormError("");

    // 1️⃣ Validate basic required fields
    const isValid = validateForm();
    if (!isValid) {
      setFormError("Please fix the highlighted errors.");
      return;
    }

    // 2️⃣ Ensure event exists
    if (!event) {
      setFormError("Event not loaded properly.");
      return;
    }

    // 3️⃣ Ensure category exists
    if (!cat) {
      setFormError("Please select a category.");
      return;
    }

    // ✅ If everything valid → start processing
    setIsProcessing(true);

    try {
      // 5️⃣ Load Razorpay SDK
      const sdkLoaded = await loadRazorpay();

      if (!sdkLoaded || !(window as any).Razorpay) {
        setFormError("Razorpay SDK failed to load.");
        setIsProcessing(false);
        return;
      }

      // 6️⃣ Create order
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          categoryId: cat.id,
          participant: form,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setIsProcessing(false);

        setPopup({
          open: true,
          message:
            errData.error || "Unable to process registration at the moment.",
          type: "error",
        });

        return;
      }

      const order = await res.json();

      // 7️⃣ Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.order.amount,
        currency: "INR",
        name: event.name,
        description: `${cat.title} Registration`,
        order_id: order.order.id,

        handler: async function (response: any) {
          try {
            const verifyRes = await secureFetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,

                eventId: event.id,
                categoryId: cat.id,
                formData: form,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              window.location.href = `/payment/success?regId=${verifyData.registrationId}`;
            } else {
              setFormError(verifyData.message || "Verification failed.");
              setIsProcessing(false);
            }
          } catch (error) {
            console.error(error);
            setFormError("Verification error.");
            setIsProcessing(false);
          }
        },

        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },

        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          contact: form.phone,
        },

        theme: {
          color: "#16a34a",
        },
      };

      const rzp = new (window as any).Razorpay(options);

      setTimeout(() => {
        rzp.open();
      }, 100);
    } catch (error) {
      console.error(error);
      setFormError("Payment initialization failed.");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl font-semibold">
        Loading...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <button
          onClick={() => router.push("/events")}
          className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <main className="bg-[#F3F6FB] min-h-screen py-10">
      <PopupModal
        open={popup.open}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />
      {showTerms && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          onClick={() => setShowTerms(false)}
        >
          <div
            className="bg-white max-w-2xl w-full mx-4 p-6 rounded-2xl shadow-xl
                 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Race Line India – Event Terms and Conditions
              </h2>
              <button
                onClick={() => setShowTerms(false)}
                className="text-gray-500 hover:text-red-600 text-xl font-bold"
              >
                ✖
              </button>
            </div>

            {/* CONTENT */}
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                Welcome to <strong>Race Line India</strong>. By registering for
                any event through our platform, you acknowledge that you have
                read, understood, and agreed to the following Terms and
                Conditions.
              </p>

              <h3 className="font-semibold text-gray-900">
                1. Participant Responsibility
              </h3>
              <p>
                Participants confirm that they are physically fit and medically
                capable of taking part in the event. Participation is at the
                participant’s own risk, and they are responsible for their own
                safety, health, and conduct throughout the event.
              </p>

              <h3 className="font-semibold text-gray-900">
                2. Registration & Information Accuracy
              </h3>
              <p>
                All registration details must be accurate and complete.
                Providing incorrect or misleading information may result in
                disqualification without refund.
              </p>

              <h3 className="font-semibold text-gray-900">
                3. Payments & Refunds
              </h3>
              <p>
                Registration is confirmed only after successful payment.
                Payments are securely processed via third-party payment
                gateways. Race Line India does not store or handle payment
                details. Registration fees are non-refundable and
                non-transferable unless stated otherwise by the event organizer.
                Additional payment gateway charges may apply.
              </p>

              <h3 className="font-semibold text-gray-900">
                4. Platform Role & Organizer Responsibility
              </h3>
              <p>
                Race Line India acts solely as a registration and event-listing
                platform. Event organizers are fully responsible for event
                planning, safety arrangements, permissions, and execution. Race
                Line India is not liable for any event-related incidents.
              </p>

              <h3 className="font-semibold text-gray-900">
                5. Event Changes or Cancellation
              </h3>
              <p>
                Event details such as date, venue, or schedule may change due to
                weather conditions, government regulations, or unforeseen
                circumstances. Race Line India is not responsible for any
                personal costs incurred due to such changes or cancellations.
              </p>

              <h3 className="font-semibold text-gray-900">
                6. Liability Waiver
              </h3>
              <p>
                Participants agree that Race Line India, event organizers,
                sponsors, partners, and volunteers shall not be held liable for
                any injury, loss, damage, illness, or death arising before,
                during, or after the event.
              </p>

              <h3 className="font-semibold text-gray-900">
                7. Media & Promotion
              </h3>
              <p>
                Participants grant permission for photographs and videos
                captured during the event to be used for promotional and
                marketing purposes without compensation.
              </p>

              <h3 className="font-semibold text-gray-900">8. Data Privacy</h3>
              <p>
                Personal information collected is used only for event-related
                communication and administration. Race Line India does not sell
                or misuse participant data.
              </p>

              <h3 className="font-semibold text-gray-900">9. Governing Law</h3>
              <p>
                These Terms and Conditions are governed by the laws of India,
                and any disputes shall be subject to the jurisdiction of Indian
                courts.
              </p>

              <p className="pt-2 font-medium text-gray-900">
                By proceeding with registration, you agree to all the above
                terms and conditions.
              </p>

              <p className="text-sm text-gray-600">
                For support, contact us at{" "}
                <a
                  href="mailto:support@racelineindia.in"
                  className="text-[var(--color-orange-500)] underline"
                >
                  support@racelineindia.in
                </a>
              </p>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTerms(false)}
                className="bg-[var(--color-orange-500)] text-white px-5 py-2
                     rounded-lg hover:opacity-90 transition"
              >
                I Understand & Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 space-y-8 py-20">
        {/* HEADER */}
        <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* LEFT ACCENT */}
          <div className="absolute inset-y-0 left-0 w-1.5 bg-[var(--color-orange-500)]" />

          <div className="p-6 md:p-8">
            {/* TITLE */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              Register for{" "}
              <span className="text-[var(--color-orange-500)]">
                {event.name}
              </span>
            </h1>

            {/* META INFO */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                <MapPinIcon className="w-4 h-4 text-[var(--color-orange-500)]" />
                {event.venue}
              </span>
              <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                <MapPinIcon className="w-4 h-4 text-[var(--color-orange-500)]" />
                {event.city}
              </span>
              <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                <CalendarDaysIcon className="w-4 h-4 text-[var(--color-orange-500)]" />
                {event.date
                  ? event.date.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "TBA"}
              </span>
            </div>
          </div>
        </div>

        {/* CATEGORY SELECTOR */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">
            Choose Your Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {event.categories.map((c) => {
              const isSelected = selectedCat === c.title;

              return (
                <div
                  key={c.title}
                  onClick={() => handleCategorySelect(c.title)} // ✅ FIX HERE
                  className={`relative cursor-pointer rounded-2xl border overflow-hidden transition-all duration-300
          ${
            isSelected
              ? "border-green-600 shadow-2xl scale-[1.03]"
              : "border-gray-200 hover:shadow-lg hover:scale-[1.01]"
          }`}
                >
                  {/* LEFT ACCENT STRIP */}
                  <div
                    className={`absolute left-0 top-0 h-full w-2 transition-all duration-300
            ${
              isSelected
                ? "bg-green-600"
                : "bg-[var(--color-orange-500)] opacity-40"
            }`}
                  />

                  {/* CONTENT */}
                  <div className="p-6 flex flex-col gap-4">
                    {/* TITLE + PRICE */}
                    <div className="flex justify-between items-start gap-4">
                      {/* TITLE */}
                      <div className="relative">
                        <h3
                          className={`text-xl font-extrabold tracking-wide transition-all duration-300
                  ${isSelected ? "text-green-700" : "text-gray-800"}`}
                        >
                          {c.title}
                        </h3>

                        {/* UNDERLINE */}
                        <span
                          className={`absolute left-0 -bottom-1 h-[3px] rounded-full transition-all duration-300
                  ${isSelected ? "w-full bg-green-600" : "w-10 bg-gray-300"}`}
                        />

                        {/* SOFT GREEN GLOW */}
                        {isSelected && (
                          <span className="absolute inset-0 blur-xl bg-green-500 opacity-10 -z-10 rounded-lg" />
                        )}
                      </div>

                      {/* PRICE BADGE */}
                      <div
                        className={`px-4 py-1.5 rounded-full text-sm font-extrabold transition-all duration-300
                ${
                  isSelected
                    ? "bg-green-600 text-white scale-110 shadow-lg"
                    : "bg-[var(--color-orange-500)] text-white"
                }`}
                      >
                        ₹ {c.price}
                      </div>
                    </div>

                    {/* META INFO */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        {c.distance} • Age {c.minAge}-{c.maxAge}
                      </span>

                      {isSelected && (
                        <span className="font-semibold text-green-600 flex items-center gap-1">
                          ✓ Selected
                        </span>
                      )}
                    </div>

                    {/* EXTRA INFO */}
                    <div className="text-xs text-gray-500">
                      Max Seats: {c.maxSeats}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ✅ SELECTED CATEGORY SUMMARY (GREEN) */}
          {cat && (
            <div className="mt-8 relative overflow-hidden rounded-2xl border border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl animate-[fadeIn_0.4s_ease-out]">
              {/* BACK GLOW */}
              <div className="absolute inset-0 bg-green-500 opacity-5" />

              <div className="relative p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-green-700 mb-1 font-semibold">
                    ✓ Selected Category
                  </p>
                  <h3 className="text-xl font-bold text-gray-800">
                    {cat.title} — {cat.distance}
                  </h3>
                </div>

                {/* PRICE FOCUS */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Payable</span>
                    <span className="text-3xl font-extrabold text-green-700 drop-shadow">
                      ₹ {cat.price}
                    </span>
                  </div>

                  {/* GATEWAY NOTE */}
                  <p className="text-xs text-gray-500 italic">
                    * Additional payment gateway charges applicable as per
                    standard
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FORM */}
        <form
          noValidate
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg space-y-6"
        >
          {/* ================= PERSONAL DATA ================= */}
          <div className="space-y-8">
            {/* SECTION HEADER */}

            <div className="flex items-center gap-4 rounded-xl bg-gray-50 px-5 py-4">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full
                  bg-[var(--color-orange-500)]/10 text-[var(--color-orange-500)]
                  font-bold"
              >
                4
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  PERSONAL DETAILS
                </h2>
                <p className="text-sm text-gray-500">
                  Tell us about the runner
                </p>
              </div>
            </div>

            {/* ROW 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="firstName"
                  placeholder="Enter first name"
                  required
                  onChange={handleChange}
                  icon={<UserIcon className="h-5 w-5" />}
                />
                <FieldError error={errors.firstName} />
              </div>

              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="lastName"
                  placeholder="Enter last name"
                  required
                  onChange={handleChange}
                  icon={<UserIcon className="h-5 w-5" />}
                />
                <FieldError error={errors.lastName} />
              </div>
            </div>

            {/* ROW 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth <span className="text-red-500">*</span>
                </label>

                <DateOfBirthInput
                  name="dob"
                  value={form.dob}
                  required
                  onChange={handleChange}
                />

                <FieldError error={errors.dob} />
              </div>
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Biological Gender <span className="text-red-500">*</span>
                </label>

                <AnimatedRadioGroup
                  name="gender"
                  required
                  value={form.gender}
                  options={["Male", "Female", "Other"]}
                  onChange={handleChange}
                />
                <FieldError error={errors.gender} />
              </div>
            </div>

            {/* ROW 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Blood Group <span className="text-red-500">*</span>
                </label>

                <AnimatedSelect
                  name="bloodGroup"
                  required
                  onChange={handleChange}
                  icon={<HeartIcon className="h-5 w-5" />}
                >
                  <option value="">Select Blood Group</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>O+</option>
                  <option>O-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </AnimatedSelect>
                <FieldError error={errors.bloodGroup} />
              </div>

              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Name to appear on Race Bib{" "}
                  <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="bibName"
                  placeholder="Enter name to print on bib"
                  required
                  onChange={handleChange}
                  icon={<IdentificationIcon className="h-5 w-5" />}
                />
              </div>
            </div>

            {/* T-SHIRT */}
            <div className="space-y-1 px-5">
              <label className="block text-sm font-medium text-gray-700">
                T-Shirt Size <span className="text-red-500">*</span>
              </label>

              <AnimatedSelect
                name="tshirtSize"
                required
                onChange={handleChange}
                icon={<TicketIcon className="h-5 w-5" />}
              >
                <option value="">Please Select</option>
                <option>XS</option>
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
                <option>XXL</option>
                <option>3XL</option>

                <optgroup label="Kids">
                  <option>2-4 Yrs — 24 inches</option>
                  <option>4-5 Yrs — 26 inches</option>
                  <option>5-7 Yrs — 28 inches</option>
                  <option>7-8 Yrs — 30 inches</option>
                  <option>8-10 Yrs — 32 inches</option>
                </optgroup>
              </AnimatedSelect>
              <FieldError error={errors.tshirtSize} />
            </div>

            {/* ================= ADDRESS ================= */}

            <div className="mt-10 flex items-center gap-4 rounded-xl bg-gray-50 px-5 py-4">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full
                  bg-[var(--color-orange-500)]/10 text-[var(--color-orange-500)]
                  font-bold"
              >
                4
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  ADDRESS DETAILS
                </h2>
                <p className="text-sm text-gray-500">
                  Where should we contact you?
                </p>
              </div>
            </div>

            {/* ADDRESS */}
            <div className="space-y-1 px-5">
              <label className="block text-sm font-medium text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>

              <AnimatedInput
                name="address"
                placeholder="Enter full address"
                required
                onChange={handleChange}
                icon={<MapPinIcon className="h-5 w-5" />}
              />
              <FieldError error={errors.address} />
            </div>

            {/* STATE + PINCODE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* STATE */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </label>

                <AnimatedSelect
                  name="state"
                  required
                  onChange={handleChange}
                  icon={<BuildingOfficeIcon className="h-5 w-5" />}
                >
                  <option value="">Select State</option>
                  <option>Tamil Nadu</option>
                  <option>Karnataka</option>
                  <option>Kerala</option>
                  <option>Andhra Pradesh</option>
                </AnimatedSelect>
                <FieldError error={errors.state} />
              </div>

              {/* PINCODE */}
              <div className="space-y-1 px-5">
                <label className="block text-sm font-medium text-gray-700">
                  Pincode <span className="text-red-500">*</span>
                </label>

                <AnimatedInput
                  name="pincode"
                  placeholder="Enter pincode"
                  required
                  onChange={handleChange}
                  icon={<MapPinIcon className="h-5 w-5" />}
                />
                <FieldError error={errors.pincode} />
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-4 rounded-xl bg-gray-50 px-5 py-4">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full
                  bg-[var(--color-orange-500)]/10 text-[var(--color-orange-500)]
                  font-bold"
            >
              4
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">CONTACT</h2>
              <p className="text-sm text-gray-500">
                Emergency communication details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1 px-5">
              <label className="block text-sm font-medium text-gray-700">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>

              <AnimatedInput
                type="tel"
                name="phone"
                placeholder="Enter WhatsApp number"
                required
                onChange={handleChange}
                icon={<PhoneIcon className="h-5 w-5" />}
              />
              <FieldError error={errors.phone} />
            </div>

            <div className="space-y-1 px-5">
              {/* LABEL + CHECKBOX */}
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Email ID{" "}
                  {!emailOptional && <span className="text-red-500">*</span>}
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailOptional}
                    onChange={(e) => setEmailOptional(e.target.checked)}
                    className="accent-[var(--color-orange-500)]"
                  />
                  Skip Email
                </label>
              </div>

              {/* DISABLED WRAPPER */}
              <div
                className={
                  emailOptional
                    ? "pointer-events-none opacity-60 select-none"
                    : ""
                }
              >
                <AnimatedInput
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  required={!emailOptional}
                  onChange={handleChange}
                  icon={<EnvelopeIcon className="h-5 w-5" />}
                />
                <FieldError error={!emailOptional ? errors.email : undefined} />
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-4 rounded-xl bg-gray-50 px-5 py-4">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full
                  bg-[var(--color-orange-500)]/10 text-[var(--color-orange-500)]
                  font-bold"
            >
              4
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Emergency Contact
              </h2>
              <p className="text-sm text-gray-500">
                Emergency communication details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* EMERGENCY NAME */}
            <div className="space-y-1 px-5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Emergency Contact Name{" "}
                  {!skipEmergencyName && (
                    <span className="text-red-500">*</span>
                  )}
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipEmergencyName}
                    onChange={(e) => setSkipEmergencyName(e.target.checked)}
                    className="accent-[var(--color-orange-500)]"
                  />
                  Skip
                </label>
              </div>

              {/* DISABLED WRAPPER */}
              <div
                className={
                  skipEmergencyName
                    ? "pointer-events-none opacity-60 select-none"
                    : ""
                }
              >
                <AnimatedInput
                  name="emergencyName"
                  placeholder="Enter emergency contact name"
                  required={!skipEmergencyName}
                  onChange={handleChange}
                  icon={<UserIcon className="h-5 w-5" />}
                />
                <FieldError
                  error={!skipEmergencyName ? errors.emergencyName : undefined}
                />
              </div>
            </div>

            {/* EMERGENCY NUMBER */}
            <div className="space-y-1 px-5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Emergency Contact Number{" "}
                  {!skipEmergencyNumber && (
                    <span className="text-red-500">*</span>
                  )}
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipEmergencyNumber}
                    onChange={(e) => setSkipEmergencyNumber(e.target.checked)}
                    className="accent-[var(--color-orange-500)]"
                  />
                  Skip
                </label>
              </div>

              {/* DISABLED WRAPPER */}
              <div
                className={
                  skipEmergencyNumber
                    ? "pointer-events-none opacity-60 select-none"
                    : ""
                }
              >
                <AnimatedInput
                  type="tel"
                  name="emergencyNumber"
                  placeholder="Enter emergency contact number"
                  required={!skipEmergencyNumber}
                  onChange={handleChange}
                  icon={<PhoneIcon className="h-5 w-5" />}
                />
                <FieldError
                  error={
                    !skipEmergencyNumber ? errors.emergencyNumber : undefined
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-4 rounded-xl bg-gray-50 px-5 py-4">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full
                  bg-[var(--color-orange-500)]/10 text-[var(--color-orange-500)]
                  font-bold"
            >
              4
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                COUPON & RUNNER CLUB
              </h2>
              <p className="text-sm text-gray-500">
                Emergency communication details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* COUPON CODE */}
            <div className="space-y-1 px-5">
              <label className="block text-sm font-medium text-gray-700">
                Coupon Code
              </label>

              <AnimatedInput
                name="couponCode"
                placeholder="Enter coupon code"
                onChange={handleChange}
                icon={<TagIcon className="h-5 w-5" />}
              />
            </div>

            {/* RUNNER CLUB (CUSTOM DROPDOWN) */}
            <div className="space-y-1 px-5" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700">
                Runner Club
              </label>

              {/* RELATIVE WRAPPER — IMPORTANT */}
              <div className="relative w-full">
                {/* DROPDOWN TRIGGER */}
                <div
                  className="w-full cursor-pointer  border border-gray-300 bg-white
                 px-4 py-3 text-sm flex items-center justify-between
                 transition hover:border-orange-400"
                  onClick={() => {
                    setShowRunnerDropdown(!showRunnerDropdown);
                    setRunnerSearch("");
                  }}
                >
                  <div className="flex items-center gap-2 text-gray-700">
                    <UsersIcon className="h-5 w-5 text-gray-400" />
                    <span>{form.runnerClub || "Please Select"}</span>
                  </div>

                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                </div>

                {/* DROPDOWN PANEL */}
                {showRunnerDropdown && (
                  <div
                    className="absolute left-0 top-full z-30 mt-2 w-full
                   rounded-xl border bg-white shadow-xl"
                  >
                    {/* SEARCH */}
                    <input
                      type="text"
                      placeholder="Search club..."
                      className="w-full border-b px-3 py-2 text-sm outline-none"
                      value={runnerSearch}
                      onChange={(e) => setRunnerSearch(e.target.value)}
                    />

                    {/* OPTIONS */}
                    <div className="max-h-48 overflow-y-auto">
                      {[
                        "TOYOTA - ICICI BANK, MG ROAD, BANGALORE",
                        "360 RUN CLUB",
                        "500 MILER",
                        "70 MINUTES",
                        "Rotary Runners",
                        "Decathlon Club",
                        "Independent",
                        "Others",
                      ]
                        .filter((club) =>
                          club
                            .toLowerCase()
                            .includes(runnerSearch.toLowerCase()),
                        )
                        .map((club) => (
                          <div
                            key={club}
                            className="px-4 py-2 text-sm cursor-pointer hover:bg-orange-50"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                runnerClub: club,
                              }));
                              setShowRunnerDropdown(false);
                              setRunnerSearch("");
                            }}
                          >
                            {club}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {form.runnerClub === "Others" && (
            <input
              name="runnerClubOther"
              placeholder="Enter your Runner Club name"
              className="input-style mt-2"
              onChange={handleChange}
            />
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="agree"
              onChange={handleChange}
              className="w-4 h-4"
            />

            <label>
              I have read and accept the{" "}
              <span
                onClick={() => setShowTerms(true)}
                className="text-blue-600 underline cursor-pointer"
              >
                Terms and Conditions
              </span>
              <p className="text-sm text-gray-600">
                * Additional payment gateway charges applicable as per standard
              </p>
              <FieldError error={errors.agree} />
            </label>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className={`group flex items-center gap-2 px-6 py-3 w-full md:w-auto
  transition-all text-white
  ${isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
          >
            {isProcessing ? "Processing..." : "Proceed to Payment"}
            {!isProcessing && (
              <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            )}
          </button>

          {formError && (
            <p className="mt-3 text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200">
              {formError}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
