import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type Props = {
  selected: any[];
};

export default function ParticipantsBulkActions({ selected }: Props) {
  if (selected.length === 0) return null;

  const phones = selected.map((p) => p.participant?.phone).filter(Boolean);

  const message = encodeURIComponent(
    "Hello! This message is from the race organizer regarding your event registration.",
  );

  const whatsappLink = `https://wa.me/?text=${message}`;

  const emails = selected
    .map((p) => p.participant?.email)
    .filter(Boolean)
    .join(",");

  const emailLink = `mailto:${emails}`;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-red-700">
            {selected.length} runners selected
          </span>

          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
            Bulk Action
          </span>
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={whatsappLink}
            target="_blank"
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            WhatsApp
          </a>

          <a
            href={emailLink}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <EnvelopeIcon className="w-4 h-4" />
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
