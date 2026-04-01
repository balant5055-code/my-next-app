"use client";
import { parseDOB } from "@/lib/utils/dob";
import { useEffect, useState, useRef, useMemo } from "react";
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
import Breadcrumb from "@/components/ui/Breadcrumb";
import { BreadcrumbItem } from "@/types/breadcrumb";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Bird, Clock } from "lucide-react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
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
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface Category {
  id: string;
  title: string;
  price: number;

  earlyBirdPrice?: number;

  // ✅ SUPPORT BOTH (safe)
  earlyBirdEnd?: any; // Firestore timestamp
  earlyBirdEndDate?: string; // optional normalized

  minAge: number;
  maxAge: number;
  distance: string;
  maxSeats: number;
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
interface RunnerForm {
  categoryId: string;
  categoryTitle: string;
  categoryDistance: string;
  categoryPrice: number;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  bibName: string;
  tshirtSize: string;
  address: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  emergencyName: string;
  emergencyNumber: string;
  couponCode: string;
  runnerClub: string;
  runnerClubOther: string;
  agree: boolean;
  bibNumber: string;
  medicallyFit: boolean;
}
const emptyRunner: RunnerForm = {
  categoryId: "",
  categoryTitle: "",
  categoryDistance: "",
  categoryPrice: 0,

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
};
export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const [useSameEmergency, setUseSameEmergency] = useState(true);

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [emailOptional, setEmailOptional] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [skipEmergency, setSkipEmergency] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const cat = event?.categories?.find((c) => c.title === selectedCat) ?? null;
  useEffect(() => {
    if (!cat) return;

    setCouponApplied(false);
    setDiscountAmount(0);
    setCouponMessage("");
  }, [selectedCat]);
  const [showTerms, setShowTerms] = useState(false);
  const [showRunnerDropdown, setShowRunnerDropdown] = useState(false);
  const [runnerSearch, setRunnerSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
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

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      { label: "Home", href: "/" },
      { label: "Events", href: "/events" },
      {
        label: event?.name || "Event",
        href: event ? `/events/${event.slug}` : "/events",
      },
      {
        label: "Register",
        href: event ? `/events/${event.slug}/register` : "#",
      },
    ];

    if (selectedCat) {
      items.push({ label: selectedCat });
    }

    return items;
  }, [event, selectedCat]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const navbar = document.getElementById("site-navbar");
    const progress = document.getElementById("form-progress");

    const navbarHeight = navbar?.offsetHeight || 0;
    const progressHeight = progress?.offsetHeight || 0;

    const offset = navbarHeight + progressHeight + 20;

    const y = el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };
  // ✅ FIX: add ref for click outside
  const validateForm = () => {
    for (let i = 0; i < participants.length; i++) {
      const runner = participants[i];
      const newErrors: Record<string, string> = {};

      if (!runner.firstName) newErrors.firstName = "First name is required";
      // DOB required
      if (!runner.dob) {
        newErrors.dob = "Date of birth is required";
      }

      // re-validate DOB for THIS runner
      if (runner.dob && cat && event?.date) {
        const normalize = (d: Date) =>
          new Date(d.getFullYear(), d.getMonth(), d.getDate());

        const birthRaw = parseDOB(runner.dob);

        if (!birthRaw) {
          newErrors.dob = "Invalid date of birth";
        } else {
          const birthDate = normalize(birthRaw);
          const today = normalize(new Date());

          // ❌ future date
          if (birthDate > today) {
            newErrors.dob = "Date of birth cannot be in the future";
          }

          if (cat && event?.date) {
            const eventDate = normalize(event.date);

            const minDOB = new Date(
              eventDate.getFullYear() - cat.minAge,
              eventDate.getMonth(),
              eventDate.getDate(),
            );

            const maxDOB = new Date(
              eventDate.getFullYear() - cat.maxAge,
              eventDate.getMonth(),
              eventDate.getDate(),
            );

            if (birthDate > minDOB) {
              newErrors.dob = `To register for ${cat.title}, your Date of Birth must be on or before ${minDOB.toLocaleDateString("en-GB")}`;
            }

            if (birthDate < maxDOB) {
              newErrors.dob = `Maximum age for ${cat.title} is ${cat.maxAge} years as on the event date.`;
            }
          }
        }
      }
      if (!runner.lastName) newErrors.lastName = "Last name is required";
      if (!runner.gender) newErrors.gender = "Please select gender";
      if (!runner.bloodGroup)
        newErrors.bloodGroup = "Please select blood group";
      if (!runner.bibName) newErrors.bibName = "Bib name is required";
      if (!runner.tshirtSize)
        newErrors.tshirtSize = "Please select T-shirt size";
      if (!runner.address) newErrors.address = "Address is required";

      if (!runner.state) newErrors.state = "State is required";

      if (!runner.pincode) {
        newErrors.pincode = "Pincode is required";
      } else if (!/^[1-9][0-9]{5}$/.test(runner.pincode)) {
        newErrors.pincode = "Enter valid 6 digit pincode";
      }

      if (!runner.phone) {
        newErrors.phone = "WhatsApp number is required";
      } else if (!/^[6-9]\d{9}$/.test(runner.phone)) {
        newErrors.phone = "Enter valid 10 digit mobile number";
      }

      // ✅ EMERGENCY VALIDATION
      if (!skipEmergency) {
        if (!runner.emergencyName) {
          newErrors.emergencyName = "Emergency contact name is required";
        }

        if (!runner.emergencyNumber) {
          newErrors.emergencyNumber = "Emergency contact number is required";
        } else if (!/^[6-9]\d{9}$/.test(runner.emergencyNumber)) {
          newErrors.emergencyNumber = "Enter valid 10 digit mobile number";
        }
      }

      if (!runner.medicallyFit)
        newErrors.medicallyFit = "You must confirm medical fitness";

      if (!runner.agree)
        newErrors.agree = "You must accept terms and conditions";

      // 🔴 IF ERROR FOUND
      if (Object.keys(newErrors).length > 0) {
        // switch to runner with error
        setCurrentRunner(i);

        // set errors for THAT runner
        setErrors(newErrors);

        // scroll to error
        setTimeout(() => {
          scrollToError(newErrors);
        }, 120);

        return false;
      }
    }

    // no errors
    setErrors({});
    return true;
  };
  const isRunnerComplete = (runner: RunnerForm): boolean => {
    return Boolean(
      runner.firstName &&
      runner.lastName &&
      runner.gender &&
      runner.bloodGroup &&
      runner.bibName &&
      runner.tshirtSize &&
      runner.address &&
      runner.state &&
      runner.pincode &&
      runner.phone &&
      runner.medicallyFit &&
      runner.agree,
    );
  };
  const [hydrated, setHydrated] = useState(false);
  const [participants, setParticipants] = useState<RunnerForm[]>([]);
  const [currentRunner, setCurrentRunner] = useState(0);

  const updateRunner = (index: number, data: Partial<RunnerForm>) => {
    setParticipants((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        ...data,
      };

      return updated;
    });
  };

  useEffect(() => {
    if (!event) return;

    setParticipants((prev) =>
      prev.map((runner) => {
        if (runner.categoryId) return runner;

        const defaultCategory = event.categories.find(
          (c) => c.title === selectedCat,
        );

        if (!defaultCategory) return runner;

        return {
          ...runner,
          categoryId: defaultCategory.id,
          categoryTitle: defaultCategory.title,
          categoryDistance: defaultCategory.distance,
          categoryPrice: getFinalPrice(defaultCategory),
        };
      }),
    );
  }, [event, selectedCat]);

  // SAFE fallback
  const form = participants[currentRunner] ?? emptyRunner;
  const fields = [
    form.firstName,
    form.lastName,
    form.dob,
    form.gender,
    form.bloodGroup,
    form.bibName,
    form.tshirtSize,
    form.address,
    form.state,
    form.pincode,
    form.phone,
  ];
  const completedFields = fields.filter(Boolean).length;
  const completionPercent = Math.round((completedFields / fields.length) * 100);
  const setForm = (
    data: Partial<RunnerForm> | ((prev: RunnerForm) => RunnerForm),
  ) => {
    if (typeof data === "function") {
      setParticipants((prev) => {
        const updated = [...prev];
        updated[currentRunner] = data(updated[currentRunner]);
        return updated;
      });
    } else {
      updateRunner(currentRunner, data);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("race_registration_form");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        // only restore if user already added a runner before
        setParticipants(parsed.participants || []);
        setCurrentRunner(0);
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
      const selected = event.categories.find(
        (c) => c.title === categoryFromURL,
      );

      if (!selected) return;

      setSelectedCat(categoryFromURL);

      // ✅ CREATE FIRST RUNNER IF EMPTY
      setParticipants((prev) => {
        return prev.map((runner) => {
          const selected = event.categories.find(
            (c) => c.title === categoryFromURL,
          );

          if (!selected) return runner;

          return {
            ...runner,
            categoryId: selected.id,
            categoryTitle: selected.title,
            categoryDistance: selected.distance,
            categoryPrice: getFinalPrice(selected), // ✅ NOW WORKS
          };
        });
      });
    } else {
      setSelectedCat(null);
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
          categories: (raw.categories ?? []).map((c: any) => ({
            ...c,
            earlyBirdPrice: c.earlyBirdPrice ?? null,
            earlyBirdEndDate: c.earlyBirdEndDate ?? null,
          })),
          rules: raw.rules ?? {},

          date: (() => {
            if (!raw.date) return null;

            // Firestore Timestamp
            if (raw.date._seconds) {
              return new Date(raw.date._seconds * 1000);
            }

            // JS Date
            if (raw.date instanceof Date) {
              return raw.date;
            }

            // ISO string
            if (typeof raw.date === "string") {
              return new Date(raw.date);
            }

            return null;
          })(),
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
    const selected = event?.categories?.find((c) => c.title === title);
    if (!selected) return;

    setSelectedCat(title);

    // ✅ Update category for ALL runners
    setParticipants((prev) => {
      if (prev.length === 0) {
        return [
          {
            ...emptyRunner,
            categoryId: selected.id,
            categoryTitle: selected.title,
            categoryDistance: selected.distance,
            categoryPrice: getFinalPrice(selected),
          },
        ];
      }

      return prev.map((runner) => ({
        ...runner,
        categoryId: selected.id,
        categoryTitle: selected.title,
        categoryDistance: selected.distance,
        categoryPrice: getFinalPrice(selected),
      }));
    });

    const params = new URLSearchParams(searchParams.toString());
    params.set("category", title);

    router.replace(`/events/${slug}/register?${params.toString()}`, {
      scroll: false,
    });

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  };
  useEffect(() => {
    if (!selectedCat || !formRef.current) return;

    const navbar = document.getElementById("site-navbar");
    const navbarHeight = navbar?.offsetHeight || 80;

    const y =
      formRef.current.getBoundingClientRect().top +
      window.scrollY -
      navbarHeight -
      16;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  }, [selectedCat]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    console.log("dsa");
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
    // 🚨 HARD STOP when skip is enabled
    if (
      skipEmergency &&
      (name === "emergencyName" || name === "emergencyNumber")
    ) {
      return;
    }
    if (name === "categoryId") {
      const selectedCategory = event?.categories.find((c) => c.id === value);

      if (!selectedCategory) return;

      updateRunner(currentRunner, {
        categoryId: selectedCategory.id,
        categoryTitle: selectedCategory.title,
        categoryDistance: selectedCategory.distance,
        categoryPrice: getFinalPrice(selectedCategory),
      });

      return;
    }
    let fieldValue = type === "checkbox" ? checked : value;
    // ✅ PRIMARY EMERGENCY CONTROL
    if (
      useSameEmergency &&
      !skipEmergency &&
      !skipEmergency && // extra safety
      participants.length > 0 &&
      (name === "emergencyName" || name === "emergencyNumber")
    ) {
      setParticipants((prev) =>
        prev.map((runner) => ({
          ...runner,
          [name]: fieldValue,
        })),
      );
      return;
    }

    // ✅ ONLY ONE DOB VALIDATION
    if (name === "dob") {
      const birth = parseDOB(fieldValue);
      if (!birth) return;

      const today = new Date();

      setErrors((prev) => {
        const updated = { ...prev };

        // ❌ future date
        if (birth > today) {
          updated.dob = "Date of birth cannot be in the future";
          return updated;
        }

        // ❌ age validation
        if (cat && event?.date) {
          const eventDate = new Date(event.date);

          const minDOB = new Date(
            eventDate.getFullYear() - cat.minAge,
            eventDate.getMonth(),
            eventDate.getDate(),
          );

          const maxDOB = new Date(
            eventDate.getFullYear() - cat.maxAge,
            eventDate.getMonth(),
            eventDate.getDate(),
          );

          if (birth > minDOB) {
            updated.dob = `To register for ${cat.title}, your Date of Birth must be on or before ${minDOB.toLocaleDateString("en-GB")}`;
            return updated;
          }

          if (birth < maxDOB) {
            updated.dob = `Maximum age for ${cat.title} is ${cat.maxAge} years as on the event date.`;
            return updated;
          }
        }

        delete updated.dob;
        return updated;
      });

      return; // 🚨 VERY IMPORTANT
    }
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
    updateRunner(currentRunner, {
      [name]: fieldValue,
    } as Partial<RunnerForm>);

    // shared fields auto copy
    const sharedFields = [
      "address",
      "state",
      "pincode",
      "runnerClub",
      "runnerClubOther",
    ];

    if (sharedFields.includes(name)) {
      setParticipants((prev) =>
        prev.map((runner, i) => {
          if (i === currentRunner) return runner;

          if (!runner[name as keyof RunnerForm]) {
            return {
              ...runner,
              [name]: fieldValue,
            };
          }

          return runner;
        }),
      );
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
          "state",
          "pincode",
          "phone",
          "emergencyName",
          "emergencyNumber",
        ];
        if (!skipEmergency) {
          requiredFields.push("emergencyName", "emergencyNumber");
        }
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
  const addRunner = () => {
    setParticipants((prev) => {
      if (prev.length >= 10) return prev;

      const defaultCategory = event?.categories?.find(
        (c) => c.title === selectedCat,
      );

      const newRunner: RunnerForm = {
        ...emptyRunner,

        categoryId: defaultCategory?.id || "",
        categoryTitle: defaultCategory?.title || "",
        categoryDistance: defaultCategory?.distance || "",
        categoryPrice: getFinalPrice(defaultCategory),

        address: prev[0]?.address ?? "",
        state: prev[0]?.state ?? "",
        pincode: prev[0]?.pincode ?? "",

        emergencyName: prev[0]?.emergencyName ?? "",
        emergencyNumber: prev[0]?.emergencyNumber ?? "",

        runnerClub: prev[0]?.runnerClub ?? "",
        runnerClubOther: prev[0]?.runnerClubOther ?? "",
      };

      const updated = [...prev, newRunner];

      setCurrentRunner(updated.length - 1);

      return updated;
    });
  };
  const removeRunner = (index: number) => {
    if (index === 0) return; // never remove lead runner

    setParticipants((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      return updated.length ? updated : [emptyRunner];
    });

    setCurrentRunner((prev) => {
      if (prev === index) return 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  };
  const copyToAllRunners = () => {
    setParticipants((prev) => {
      const source = prev[currentRunner];

      return prev.map((runner, i) => {
        if (i === currentRunner) return runner;

        return {
          ...runner,
          address: source.address,
          state: source.state,
          pincode: source.pincode,
          emergencyName: source.emergencyName,
          emergencyNumber: source.emergencyNumber,
          runnerClub: source.runnerClub,
          runnerClubOther: source.runnerClubOther,
        };
      });
    });
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

    if (!element) return;

    const paymentBarHeight = 90;

    const y =
      element.getBoundingClientRect().top +
      window.scrollY -
      paymentBarHeight -
      40;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });

    element.focus();
  };
  const applyCoupon = async () => {
    if (!form.couponCode) {
      setCouponMessage("Enter coupon code");
      return;
    }

    if (!event || !cat) {
      setCouponMessage("Select category first");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponMessage("");

      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: form.couponCode,
          eventId: event.id,
          categoryTitle: cat?.title,
          runnerClub: form.runnerClub,
          phone: form.phone,
          price: cat?.price,
        }),
      });

      const data = await res.json();

      if (data.valid) {
        setCouponApplied(true);
        setDiscountAmount(data.discountAmount);
        setFinalPrice(data.finalPrice);

        setCouponMessage(`₹${data.discountAmount} discount applied`);
      } else {
        setCouponApplied(false);
        setDiscountAmount(0);
        setFinalPrice(cat.price);

        setCouponMessage(data.message || "Invalid coupon");
      }
    } catch (err) {
      console.error(err);
      setCouponMessage("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
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
          couponCode: form.couponCode,
          participants: participants.map((p) => ({
            firstName: p.firstName || "",
            lastName: p.lastName || "",

            categoryId: p.categoryId || "",
            categoryTitle: p.categoryTitle || "",
            categoryDistance: p.categoryDistance || "",

            gender: p.gender || "",
            dob: p.dob || "",
            bloodGroup: p.bloodGroup || "",

            bibName: p.bibName || "",
            tshirtSize: p.tshirtSize || "",

            address: p.address || "",
            state: p.state || "",
            pincode: p.pincode || "",

            phone: p.phone || "",
            email: p.email || "",

            emergencyName: p.emergencyName || "",
            emergencyNumber: p.emergencyNumber || "",

            runnerClub: p.runnerClub || "",
            runnerClubOther: p.runnerClubOther || "",

            medicallyFit: p.medicallyFit || false,
            agree: p.agree || false,

            bibNumber: p.bibNumber || "",
          })),
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
                participants,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              localStorage.removeItem("race_registration_form");

              setTimeout(() => {
                window.location.href = `/payment/success?orderId=${verifyData.orderId}`;
              }, 400);
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
    if (!skipEmergency) return;

    setParticipants((prev) =>
      prev.map((runner) => ({
        ...runner,
        emergencyName: "",
        emergencyNumber: "",
      })),
    );

    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.emergencyName;
      delete updated.emergencyNumber;
      return updated;
    });
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
  }, [
    form.firstName,
    form.lastName,
    form.dob,
    form.gender,
    form.bloodGroup,
    form.bibName,
    form.tshirtSize,
    form.address,
    form.state,
    form.pincode,
    form.phone,
    form.emergencyName,
    form.emergencyNumber,
    form.runnerClub,
    errors,
    skipEmergency,
  ]);
  useEffect(() => {
    // ❌ DO NOT scroll if no runner exists
    if (participants.length === 0) return;

    if (currentStep > lastStepRef.current) {
      setTimeout(() => {
        if (currentStep === 1) scrollToSection("address-section");
        if (currentStep === 2) scrollToSection("contact-section");
        if (currentStep === 3) scrollToSection("emergency-section");
        if (currentStep === 4) scrollToSection("runner-section");
      }, 120);
    }

    lastStepRef.current = currentStep;
  }, [currentStep, participants.length]);
  useEffect(() => {
    if (!hydrated) return;

    if (participants.length === 0) return;

    const timer = setTimeout(() => {
      localStorage.setItem(
        "race_registration_form",
        JSON.stringify({ participants }),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [participants, currentRunner, hydrated]);
  const pricing = useMemo(() => {
    const total = participants.reduce((sum, p) => {
      return sum + (p.categoryPrice || 0);
    }, 0);

    const discount = couponApplied ? discountAmount : 0;
    console.log(discount);
    return {
      finalTotal: Math.max(total - discount, 0),
    };
  }, [participants, couponApplied, discountAmount]);

  if (loading) {
    return <RegisterPageSkeleton />;
  }
  if (!hydrated) {
    return null;
  }

  function getFinalPrice(category: any) {
    if (!category) return 0;

    let price = category.price;

    if (category.earlyBirdPrice) {
      const now = new Date();

      let end: Date | null = null;

      // ✅ case 1: Firestore timestamp
      if (category.earlyBirdEnd?._seconds) {
        end = new Date(category.earlyBirdEnd._seconds * 1000);
      }

      // ✅ case 2: normal string date
      else if (category.earlyBirdEndDate) {
        end = new Date(category.earlyBirdEndDate);
      }

      if (end && now <= end) {
        price = category.earlyBirdPrice;
      }
    }

    return price;
  }
  function getEarlyBirdTimeLeft(category: any) {
    if (!category?.earlyBirdEnd?._seconds) return null;

    const now = new Date();
    const end = new Date(category.earlyBirdEnd._seconds * 1000);

    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    return { days, hours };
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
    <main className="relative min-h-screen py-10 overflow-x-hidden">
      {/* spotlight background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(239,68,68,0.08), transparent 60%)",
        }}
      />
      <div className="relative">
        {verifyingPayment && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]">
            <div className="bg-white rounded-xl p-8 shadow-xl text-center space-y-4">
              <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>

              <h2 className="text-lg font-semibold text-gray-900">
                RaceLine India - Verifying Payment
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

        <div className="max-w-5xl mx-auto px-4 pb-48 md:pb-32 space-y-6">
          {/* BREADCRUMB */}
          <Breadcrumb />

          {/* HEADER */}
          <EventHeader event={event} />
          {/* CATEGORY SELECTOR */}
          <div
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            ref={categoryRef}
          >
            {!selectedCat ? (
              <CategorySelector
                categories={event.categories}
                selectedCat={selectedCat}
                handleCategorySelect={handleCategorySelect}
                cat={cat}
                isProcessing={isProcessing}
                eventSlug={event.slug}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              >
                {/* LEFT */}
                <div className="flex items-center gap-3">
                  {/* ICON BADGE */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50">
                    <TicketIcon className="h-5 w-5 text-orange-600" />
                  </div>

                  {/* TEXT */}
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                      Selected Category
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {cat?.title}
                      </p>

                      {cat?.distance && (
                        <span className="text-[11px] px-2 py-[2px] rounded-md bg-green-100 text-green-700 font-semibold">
                          {cat.distance}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* CHANGE BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (!isProcessing) setSelectedCat(null);
                  }}
                  disabled={isProcessing}
                  className={`flex items-center gap-1 text-sm font-semibold transition
    ${
      isProcessing
        ? "text-gray-400 cursor-not-allowed"
        : "text-orange-600 hover:text-orange-700"
    }`}
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Change
                </motion.button>
              </motion.div>
            )}
          </div>
          {selectedCat && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              {/* FORM TITLE */}
              <div className="text-center px-6 pt-6 pb-5 border-b border-gray-100">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Runner{" "}
                  <span className="text-[var(--color-orange-500)]">
                    Registration
                  </span>
                </h1>

                <p className="text-sm text-gray-500 mt-2">
                  Complete the form below to register for the event
                </p>
                <div className="w-16 h-[3px] bg-[var(--color-orange-500)] mx-auto mt-3 rounded-full"></div>
              </div>

              <FormProgress
                currentStep={currentStep}
                completionPercent={completionPercent}
                runnerName={
                  participants.length === 0
                    ? "No Runner Added"
                    : form.firstName || form.lastName
                      ? `${form.firstName || ""} ${form.lastName || ""}`.trim()
                      : `Runner ${currentRunner + 1}`
                }
                scrollToSection={scrollToSection}
              />

              {/* RUNNER SWITCHER */}
              {/* When NO runners exist */}
              <div className="px-6 py-4 border-b border-gray-100">
                {/* Title */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                    Runners
                  </h3>

                  <span className="text-[11px] text-gray-400">
                    {participants.length}/10
                  </span>
                </div>

                {/* Runner Tabs */}
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
                  {participants.map((runner, index) => {
                    const runnerName =
                      runner.firstName || runner.lastName
                        ? `${runner.firstName || ""} ${runner.lastName || ""}`.trim()
                        : index === 0
                          ? "Lead Runner"
                          : `Runner ${index + 1}`;

                    const isComplete = isRunnerComplete(runner);

                    return (
                      <div
                        key={index}
                        className="relative flex items-center group shrink-0"
                      >
                        {/* Runner Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentRunner(index);
                            setErrors({});
                          }}
                          className={`flex items-center gap-2 px-1 pb-2 text-sm transition-all duration-150 whitespace-nowrap
            ${
              currentRunner === index
                ? "text-gray-700 font-semibold"
                : "text-gray-500 hover:text-gray-600"
            }`}
                        >
                          {/* Avatar */}
                          <UserIcon className="h-4 w-4 text-gray-400 shrink-0" />

                          {/* Name */}
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <span>{runnerName}</span>

                            {runner.categoryDistance && (
                              <span className="text-[10px] px-1.5 py-[1px] rounded bg-green-100 text-green-700 font-semibold">
                                {runner.categoryDistance}
                              </span>
                            )}
                          </div>

                          {/* Incomplete indicator */}
                          {!isComplete && (
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full ml-1" />
                          )}
                        </button>

                        {/* Active underline */}
                        {currentRunner === index && (
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-300 rounded-full" />
                        )}

                        {/* Remove Runner */}
                        {participants.length > 1 && index !== 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRunner(index);
                            }}
                            className="
                ml-1
                text-gray-400 hover:text-gray-600
                transition
                cursor-pointer
                opacity-70 md:opacity-0 md:group-hover:opacity-100
              "
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Runner */}
                  {participants.length < 10 && (
                    <button
                      onClick={addRunner}
                      className="
          flex items-center gap-1
          text-sm text-gray-500 hover:text-gray-700
          transition
          shrink-0
          whitespace-nowrap
        "
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Runner
                    </button>
                  )}
                </div>
              </div>

              <div ref={formRef} className="px-6 py-6 space-y-8">
                <RegistrationForm handleSubmit={handleSubmit}>
                  <div id="personal-section">
                    <PersonalDetails
                      form={form}
                      errors={errors}
                      handleChange={handleChange}
                      categories={event.categories}
                      runnerIndex={currentRunner}
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
                      useSameEmergency={useSameEmergency}
                      setUseSameEmergency={setUseSameEmergency}
                      runnerIndex={currentRunner}
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
                      applyCoupon={applyCoupon}
                      couponLoading={couponLoading}
                      couponApplied={couponApplied}
                      couponMessage={couponMessage}
                    />
                  </div>
                </RegistrationForm>
              </div>
            </div>
          )}

          {/* STICKY PAYMENT BAR */}
          {/* PAYMENT BAR */}
          {selectedCat && (
            <div
              id="payment-bar"
              className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-sm z-50"
            >
              <div className="max-w-6xl mx-auto px-4 py-3">
                {/* DESKTOP */}
                <div className="hidden md:flex items-center justify-between">
                  {/* LEFT SIDE */}
                  <div className="flex items-center gap-3">
                    <TicketIcon className="h-5 w-5 text-gray-400" />

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {cat?.title || "Select Category"}
                        </span>

                        {cat?.distance && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium">
                            {cat.distance}
                          </span>
                        )}
                      </div>

                      {participants.length > 1 && (
                        <span className="text-xs text-gray-500">
                          Runner {currentRunner + 1} of {participants.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      {(() => {
                        const category = event?.categories?.[0]; // or selected category logic
                        const timeLeft = getEarlyBirdTimeLeft(category);

                        const isEarly =
                          category?.earlyBirdPrice &&
                          category?.earlyBirdEnd &&
                          timeLeft;

                        return (
                          <div className="flex flex-col items-end">
                            {/* MAIN PRICE */}
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                ₹{pricing.finalTotal}
                              </span>

                              {isEarly && (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                  <Bird className="w-3 h-3" /> Early Bird
                                </span>
                              )}
                            </div>

                            {/* STRIKE PRICE */}
                            {isEarly && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{category.price * participants.length}
                              </span>
                            )}

                            {/* COUNTDOWN */}
                            {isEarly && timeLeft && (
                              <span className="text-xs text-orange-600 font-medium">
                                ⏳ Ends in {timeLeft.days}d {timeLeft.hours}h
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {participants.length > 1 && (
                        <div className="text-xs text-gray-500">
                          {participants.length} runners registered
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      form="registration-form"
                      disabled={!selectedCat || isProcessing}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200
  ${
    isProcessing
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-gradient-to-r from-[var(--color-orange-500)] to-red-500 hover:from-[var(--color-orange-600)] hover:to-red-600 shadow-sm hover:shadow"
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

                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">
                          {cat?.title || "Select Category"}
                        </span>

                        {participants.length > 1 && (
                          <span className="text-[11px] text-gray-500">
                            Runner {currentRunner + 1} / {participants.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {(() => {
                        const category = event?.categories?.[0]; // or selected category logic
                        const timeLeft = getEarlyBirdTimeLeft(category);

                        const isEarly =
                          category?.earlyBirdPrice &&
                          category?.earlyBirdEnd &&
                          timeLeft;

                        return (
                          <div className="flex flex-col items-end">
                            {/* MAIN PRICE */}
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                ₹{pricing.finalTotal}
                              </span>

                              {isEarly && (
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                  🔥 Early Bird
                                </span>
                              )}
                            </div>

                            {/* STRIKE PRICE */}
                            {isEarly && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{category.price * participants.length}
                              </span>
                            )}

                            {/* COUNTDOWN */}
                            {isEarly && timeLeft && (
                              <span className="text-xs text-orange-600 font-medium">
                                ⏳ Ends in {timeLeft.days}d {timeLeft.hours}h
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {participants.length > 1 && (
                        <div className="text-xs text-gray-500">
                          {participants.length} runners registered
                        </div>
                      )}
                    </div>
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
          )}
        </div>
      </div>
    </main>
  );
}
