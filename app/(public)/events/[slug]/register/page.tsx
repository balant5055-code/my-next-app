"use client";

import { useEffect, useState, useRef } from "react"; // ✅ FIX: added useRef
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MapPinIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import AnimatedInput from "@/components/ui/AnimatedInput";
import AnimatedSelect from "@/components/ui/AnimatedSelect";
import AnimatedRadioGroup from "@/components/ui/AnimatedRadioGroup";
import DateOfBirthInput from "@/components/ui/DateOfBirthInput";
import PopupModal from "@/components/ui/PopupModal";
import { secureFetch } from "@/lib/secureFetch";
import EventHeader from "@/components/register/EventHeader";
import CategorySelector from "@/components/register/CategorySelector";
import RegistrationForm from "@/components/register/RegistrationForm";
import PersonalDetails from "@/components/register/form/PersonalDetails";
import AddressDetails from "@/components/register/form/AddressDetails";
import ContactDetails from "@/components/register/form/ContactDetails";
import EmergencyContact from "@/components/register/form/EmergencyContact";
import RunnerClubSection from "@/components/register/form/RunnerClubSection";
import FormProgress from "@/components/register/FormProgress";
import RegisterPageSkeleton from "./loading";
import EventTermsContent from "@/components/legal/EventTermsContent";
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
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [skipEmergency, setSkipEmergency] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const cat = event?.categories?.find((c) => c.title === selectedCat) ?? null;
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
  const formRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const categoryFromURL = searchParams.get("category");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const lastStepRef = useRef(0);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);

    if (!el) return;

    const yOffset = -80; // adjust for sticky header
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };
  // ✅ FIX: add ref for click outside
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 🔹 Required Fields
    if (!form.firstName) newErrors.firstName = "First name is required";
    if (!form.lastName) newErrors.lastName = "Last name is required";
    if (!form.gender) newErrors.gender = "Please select gender";
    if (!form.bloodGroup) newErrors.bloodGroup = "Please select blood group";
    if (!form.bibName) newErrors.bibName = "Bib name is required";
    if (form.bibName && form.bibName.length > 12) {
      newErrors.bibName = "Bib name cannot exceed 12 characters";
    }
    if (!form.tshirtSize) newErrors.tshirtSize = "Please select T-shirt size";
    if (!form.address) newErrors.address = "Address is required";
    //if (!form.state) newErrors.state = "State is required";
    if (!form.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^[1-9][0-9]{5}$/.test(form.pincode)) {
      newErrors.pincode = "Enter valid 6 digit pincode";
    }
    if (!form.phone) {
      newErrors.phone = "WhatsApp number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = "Enter valid 10 digit mobile number";
    }
    // EMAIL VALIDATION
    if (!emailOptional && form.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = "Enter a valid email address";
      }
    }
    // 🔥 Emergency Validation
    if (!skipEmergency) {
      if (!form.emergencyName)
        newErrors.emergencyName = "Emergency contact name is required";

      if (!form.emergencyNumber) {
        newErrors.emergencyNumber = "Emergency contact number is required";
      } else if (!/^[6-9]\d{9}$/.test(form.emergencyNumber)) {
        newErrors.emergencyNumber = "Enter valid 10 digit mobile number";
      }
    }
    if (!form.medicallyFit)
      newErrors.medicallyFit = "You must confirm medical fitness";

    if (!form.agree) newErrors.agree = "You must accept terms and conditions";

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
          newErrors.dob = `Maximum age for ${cat.title} is ${maxAge} years as on the event date.`;
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

  const [hydrated, setHydrated] = useState(false);
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
    bibNumber: "",
    medicallyFit: false,
  });

  useEffect(() => {
    if (!form.dob || !cat || !event?.date) return;

    const normalize = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const birthDate = normalize(new Date(form.dob));
    const eventDate = normalize(event.date);

    const minAge = Number(cat.minAge);
    const maxAge = Number(cat.maxAge);

    const minDOB = normalize(
      new Date(
        eventDate.getFullYear() - minAge,
        eventDate.getMonth(),
        eventDate.getDate(),
      ),
    );

    const maxDOB = normalize(
      new Date(
        eventDate.getFullYear() - maxAge,
        eventDate.getMonth(),
        eventDate.getDate(),
      ),
    );

    setErrors((prev) => {
      const updated = { ...prev };

      if (birthDate > minDOB) {
        updated.dob = `To register for ${cat.title}, your Date of Birth must be on or before ${minDOB.toLocaleDateString("en-GB")}`;
        return updated;
      }

      if (birthDate < maxDOB) {
        updated.dob = `Maximum age for ${cat.title} is ${maxAge} years as on event date.`;
        return updated;
      }

      delete updated.dob;
      return updated;
    });
  }, [form.dob, cat, event?.date]);

  useEffect(() => {
    const saved = localStorage.getItem("race_registration_form");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        setForm((prev) => ({
          ...prev,
          ...parsed,
          medicallyFit: parsed.medicallyFit ?? false,
          agree: parsed.agree ?? false,
        }));
      } catch {
        console.error("Failed to restore saved form");
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!event?.categories?.length) return;

    if (
      categoryFromURL &&
      event.categories.some((c) => c.title === categoryFromURL)
    ) {
      setSelectedCat(categoryFromURL);
    } else {
      setSelectedCat(null); // ✅ do NOT auto select
    }
  }, [event, categoryFromURL]);
  useEffect(() => {
    if (!slug) return;

    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${slug}`);

        const data = await res.json();

        if (!res.ok) {
          console.error("API ERROR:", data);
          setEvent(null);
          return;
        }

        const raw = data;

        const formattedEvent: EventData = {
          id: raw.id,
          name: raw.name ?? "",
          slug: raw.slug ?? "",
          venue: raw.venue ?? "",
          city: raw.city ?? "",
          bannerURL: raw.bannerURL ?? "",
          categories: raw.categories ?? [],
          rules: raw.rules ?? {},

          date: raw.date?._seconds ? new Date(raw.date._seconds * 1000) : null,
        };

        setEvent(formattedEvent);
      } catch (err) {
        console.error("Error loading event:", err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  // ✅ FIX: CLICK-OUTSIDE HANDLER (NEW)
  useEffect(() => {
    if (selectedCat !== null) return;

    if (!categoryRef.current) return;

    const navbar = document.getElementById("site-navbar");
    const navbarHeight = navbar?.getBoundingClientRect().height || 0;

    const target =
      categoryRef.current.getBoundingClientRect().top +
      window.scrollY -
      navbarHeight -
      12;

    window.scrollTo({
      top: target,
      behavior: "smooth",
    });
  }, [selectedCat]);

  const handleCategorySelect = (title: string) => {
    setSelectedCat(title);

    const params = new URLSearchParams(searchParams.toString());
    params.set("category", title);

    router.replace(`/events/${slug}/register?${params.toString()}`, {
      scroll: false,
    });
  };
  useEffect(() => {
    if (!selectedCat || !formRef.current) return;

    formRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedCat]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const fieldErrorMessages: Record<string, string> = {
      firstName: "First name is required",
      lastName: "Last name is required",
      gender: "Please select gender",
      bloodGroup: "Please select blood group",
      bibName: "Bib name is required",
      tshirtSize: "Please select T-shirt size",
      address: "Address is required",
      pincode: "Pincode is required",
      phone: "WhatsApp number is required",
      emergencyName: "Emergency contact name is required",
      emergencyNumber: "Emergency contact number is required",
    };
    const { name, value, type, checked } = e.target as any;

    let fieldValue = type === "checkbox" ? checked : value;

    /* ================= NUMERIC INPUT RESTRICTION ================= */

    if (name === "phone" || name === "emergencyNumber" || name === "pincode") {
      // remove non-numeric characters
      fieldValue = value.replace(/\D/g, "");
    }

    /* ================= LENGTH LIMIT ================= */

    if (name === "phone" || name === "emergencyNumber") {
      fieldValue = fieldValue.slice(0, 10);
    }

    if (name === "pincode") {
      fieldValue = fieldValue.slice(0, 6);
    }

    if (name === "bibName") {
      fieldValue = value.toUpperCase();
      fieldValue = value.toUpperCase().slice(0, 12);
    }

    if (name === "couponCode") {
      fieldValue = value.toUpperCase();
    }
    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // 🔥 DOB LIVE VALIDATION
    if (name === "dob" && cat && event?.date) {
      const normalize = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate());

      const birthDate = normalize(new Date(fieldValue));
      const eventDate = normalize(event.date);

      const minAge = Number(cat.minAge);
      const maxAge = Number(cat.maxAge);

      const minDOB = normalize(
        new Date(
          eventDate.getFullYear() - minAge,
          eventDate.getMonth(),
          eventDate.getDate(),
        ),
      );

      const maxDOB = normalize(
        new Date(
          eventDate.getFullYear() - maxAge,
          eventDate.getMonth(),
          eventDate.getDate(),
        ),
      );

      setErrors((prev) => {
        const updated = { ...prev };

        if (birthDate > minDOB) {
          updated.dob = `To register for ${cat.title}, your Date of Birth must be on or before ${minDOB.toLocaleDateString("en-GB")}`;
          return updated;
        }

        if (birthDate < maxDOB) {
          updated.dob = `Maximum age for ${cat.title} is ${maxAge} years as on the event date.`;
          return updated;
        }

        delete updated.dob;
        return updated;
      });
    }
    // ✅ CLEAR CHECKBOX ERRORS
    if (type === "checkbox") {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    if (name !== "dob") {
      setErrors((prev) => {
        const updated = { ...prev };

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
          "emergencyName",
          "emergencyNumber",
        ];

        if (requiredFields.includes(name)) {
          if (!fieldValue || fieldValue.toString().trim() === "") {
            updated[name] =
              fieldErrorMessages[name] || "This field is required";
          } else {
            delete updated[name];
          }
        }

        return updated;
      });
    }

    setFormError("");
  };

  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;

    return <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>;
  };

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
      `[name="${firstErrorKey}"], #${firstErrorKey}`,
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
    // 🚫 Prevent double click
    if (isProcessing) return;

    setIsProcessing(true);
    setFormError("");

    // 1️⃣ Validate basic required fields
    const isValid = validateForm();
    if (!isValid) {
      setFormError("Please fix the highlighted errors.");
      setIsProcessing(false); // ✅ FIX
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
          participant: {
            ...form,
            selectedCategory: cat.title,
            distance: cat.distance,
          },
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
          // 🔒 Lock UI
          setVerifyingPayment(true);
          try {
            const verifyRes = await fetch("/api/verify-payment", {
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
                formData: {
                  ...form,
                  selectedCategory: cat.title,
                  distance: cat.distance,
                },
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // 🔥 Clear saved registration form
              localStorage.removeItem("race_registration_form");
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
  useEffect(() => {
    if (skipEmergency) {
      setForm((prev) => ({
        ...prev,
        emergencyName: "",
        emergencyNumber: "",
      }));

      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.emergencyName;
        delete updated.emergencyNumber;
        return updated;
      });
    }
  }, [skipEmergency]);
  useEffect(() => {
    let step = 0;

    const personalValid =
      form.firstName &&
      form.lastName &&
      form.dob &&
      form.gender &&
      form.bloodGroup &&
      form.bibName &&
      form.tshirtSize &&
      !errors.firstName &&
      !errors.lastName &&
      !errors.dob &&
      !errors.gender &&
      !errors.bloodGroup &&
      !errors.bibName &&
      !errors.tshirtSize;

    const addressValid =
      form.address &&
      form.state &&
      form.pincode &&
      !errors.address &&
      !errors.state &&
      !errors.pincode;

    const contactValid = form.phone && !errors.phone;

    const emergencyValid =
      (form.emergencyName && form.emergencyNumber) || skipEmergency;

    if (personalValid) step = 1;

    if (personalValid && addressValid) step = 2;

    if (personalValid && addressValid && contactValid) step = 3;

    if (personalValid && addressValid && contactValid && emergencyValid)
      step = 4;

    if (
      personalValid &&
      addressValid &&
      contactValid &&
      emergencyValid &&
      form.runnerClub
    )
      step = 5;

    setCurrentStep(step);
  }, [form, errors, skipEmergency]);

  useEffect(() => {
    if (currentStep > lastStepRef.current) {
      if (currentStep === 1) scrollToSection("address-section");
      if (currentStep === 2) scrollToSection("contact-section");
      if (currentStep === 3) scrollToSection("emergency-section");
      if (currentStep === 4) scrollToSection("runner-section");
    }

    lastStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    if (!hydrated) return;

    const timer = setTimeout(() => {
      localStorage.setItem("race_registration_form", JSON.stringify(form));
    }, 300);

    return () => clearTimeout(timer);
  }, [form, hydrated]);

  if (loading) {
    return <RegisterPageSkeleton />;
  }
  if (!hydrated) {
    return null;
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
      {verifyingPayment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div className="bg-white rounded-xl p-8 shadow-xl text-center space-y-4">
            <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>

            <h2 className="text-lg font-semibold text-gray-900">
              Verifying Payment
            </h2>

            <p className="text-sm text-gray-500">
              Please wait while we confirm your registration.
            </p>
          </div>
        </div>
      )}
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
            <EventTermsContent />
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

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* HEADER */}
        <EventHeader event={event} />
        {/* CATEGORY SELECTOR */}
        <div ref={categoryRef}>
          {!selectedCat ? (
            <CategorySelector
              categories={event.categories}
              selectedCat={selectedCat}
              handleCategorySelect={handleCategorySelect}
              cat={cat}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TicketIcon className="h-5 w-5 text-gray-500" />

                <div>
                  <p className="text-sm text-gray-500">Selected Category</p>
                  <p className="font-semibold text-gray-900">
                    {cat?.title} • {cat?.distance}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isProcessing) {
                    setSelectedCat(null);
                  }
                }}
                className={`text-sm font-semibold ${
                  isProcessing
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-orange-600 hover:underline"
                }`}
              >
                Change
              </button>
            </div>
          )}
        </div>

        {selectedCat && (
          <>
            <FormProgress currentStep={currentStep} />
            <div ref={formRef} className="scroll-mt-[260px]">
              <RegistrationForm handleSubmit={handleSubmit}>
                <div id="personal-section">
                  <PersonalDetails
                    form={form}
                    errors={errors}
                    handleChange={handleChange}
                  />
                </div>

                <div id="address-section">
                  <AddressDetails
                    form={form}
                    errors={errors}
                    handleChange={handleChange}
                  />
                </div>

                <div id="contact-section">
                  <ContactDetails
                    form={form}
                    errors={errors}
                    handleChange={handleChange}
                    emailOptional={emailOptional}
                    setEmailOptional={setEmailOptional}
                  />
                </div>

                <div id="emergency-section">
                  <EmergencyContact
                    form={form}
                    errors={errors}
                    handleChange={handleChange}
                    skipEmergency={skipEmergency}
                    setSkipEmergency={setSkipEmergency}
                  />
                </div>

                <div id="runner-section">
                  <RunnerClubSection
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    handleChange={handleChange}
                    runnerSearch={runnerSearch}
                    setRunnerSearch={setRunnerSearch}
                    showRunnerDropdown={showRunnerDropdown}
                    setShowRunnerDropdown={setShowRunnerDropdown}
                    dropdownRef={dropdownRef}
                    showTerms={showTerms}
                    setShowTerms={setShowTerms}
                    isProcessing={isProcessing}
                    formError={formError}
                  />
                </div>
              </RegistrationForm>
            </div>

            {/* PAYMENT BAR */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-sm z-50">
              {/* your payment bar code */}
            </div>
          </>
        )}

        {/* STICKY PAYMENT BAR */}
        {/* PAYMENT BAR */}
        {/* PAYMENT BAR */}
        {/* PAYMENT BAR */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-sm z-50">
          <div className="max-w-6xl mx-auto px-4 py-3">
            {/* DESKTOP */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TicketIcon className="h-5 w-5 text-gray-400" />

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {cat?.title || "Select Category"}
                  </span>

                  {cat?.distance && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium">
                      {cat.distance}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-lg font-bold text-gray-900">
                  ₹{cat?.price ?? 0}
                </span>

                <button
                  type="submit"
                  form="registration-form"
                  disabled={!selectedCat || isProcessing}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold text-white transition
          ${
            isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
                >
                  {isProcessing ? "Processing..." : "Proceed to Payment"}

                  {!isProcessing && <ArrowRightIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* MOBILE */}
            <div className="flex md:hidden flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TicketIcon className="h-4 w-4 text-gray-400" />

                  <span className="text-sm font-semibold text-gray-900">
                    {cat?.title || "Select Category"}
                  </span>
                </div>

                <span className="text-base font-bold text-gray-900">
                  ₹{cat?.price ?? 0}
                </span>
              </div>

              <button
                type="submit"
                form="registration-form"
                disabled={isProcessing}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold text-white transition
        ${
          isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
              >
                {isProcessing ? "Processing..." : "Proceed to Payment"}

                {!isProcessing && <ArrowRightIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
