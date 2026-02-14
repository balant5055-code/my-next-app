"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircleIcon,
  ClipboardDocumentIcon,
  TicketIcon,
  ReceiptPercentIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();

  const name = searchParams.get("name") || "Participant";
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const eventName = searchParams.get("event");
  const regId = searchParams.get("regId");

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string | null, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 flex items-center justify-center px-4 py-6">

      <div className="w-full max-w-5xl">

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

          {/* RESPONSIVE LAYOUT */}
          <div className="flex flex-col lg:flex-row">

            {/* LEFT SIDE */}
            <div className="lg:w-1/2 bg-gradient-to-br from-green-600 to-emerald-600 text-white p-8 flex flex-col justify-center items-center text-center">

              <div className="bg-white/20 p-4 rounded-full mb-4">
                <CheckCircleIcon className="w-12 h-12" />
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold">
                Registration Confirmed 🎉
              </h1>

              <p className="mt-3 text-sm lg:text-base text-green-100 max-w-sm">
                Hi <span className="font-semibold text-white">{name}</span>,  
                your registration for{" "}
                <span className="font-semibold text-white">
                  {eventName || "the event"}
                </span>{" "}
                has been successfully confirmed.
              </p>

            </div>

            {/* RIGHT SIDE */}
            <div className="lg:w-1/2 p-6 lg:p-8 space-y-4 flex flex-col justify-center">

              {regId && (
                <InfoCard
                  icon={<TicketIcon className="w-5 h-5 text-green-600" />}
                  label="Registration ID"
                  value={regId}
                  copied={copied === "reg"}
                  onCopy={() => copyToClipboard(regId, "reg")}
                />
              )}

              {orderId && (
                <InfoCard
                  icon={<TicketIcon className="w-5 h-5 text-green-600" />}
                  label="Order ID"
                  value={orderId}
                  copied={copied === "order"}
                  onCopy={() => copyToClipboard(orderId, "order")}
                />
              )}

              {paymentId && (
                <InfoCard
                  icon={<TicketIcon className="w-5 h-5 text-green-600" />}
                  label="Payment ID"
                  value={paymentId}
                  copied={copied === "payment"}
                  onCopy={() => copyToClipboard(paymentId, "payment")}
                />
              )}

              <div className="flex items-center justify-center lg:justify-start gap-2 text-green-700 font-medium pt-2">
                <CheckCircleIcon className="w-5 h-5" />
                Payment Successful
              </div>

              <div className="pt-4 space-y-3">

                {regId && (
                  <a
                    href={`/api/download-receipt?id=${regId}`}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition"
                  >
                    <ReceiptPercentIcon className="w-5 h-5" />
                    Download Receipt
                  </a>
                )}

                <Link
                  href="/events"
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Explore Events
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


/* Info Card */

function InfoCard({
  icon,
  label,
  value,
  onCopy,
  copied,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition">

      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="font-semibold text-gray-800 break-all">{value}</p>
        </div>
      </div>

      <button
        onClick={onCopy}
        className="text-gray-400 hover:text-green-600 transition flex items-center"
      >
        <ClipboardDocumentIcon className="w-5 h-5" />
        {copied && (
          <span className="ml-2 text-xs text-green-600 font-medium">
            Copied
          </span>
        )}
      </button>

    </div>
  );
}
