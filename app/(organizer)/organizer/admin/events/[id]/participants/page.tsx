"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { secureFetch } from "@/lib/secureFetch";

import ParticipantsStats from "@/components/organizer/participants/ParticipantsStats";
import ParticipantsToolbar from "@/components/organizer/participants/ParticipantsToolbar";
import ParticipantsDataGrid from "@/components/organizer/participants/ParticipantsDataGrid";
import ParticipantsPagination from "@/components/organizer/participants/ParticipantsPagination";

import { Participant } from "@/components/organizer/participants/ParticipantsColumns";
import PageHeader from "@/components/organizer/PageHeader";
import {
  UsersIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
export default function ParticipantsPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    categories: [],
  });

  async function loadParticipants() {
    try {
      const res = await secureFetch(
        `/api/organizer/participants?eventId=${eventId}&page=${page}&search=${search}&category=${category}`,
      );

      if (!res.ok) return;

      const data = await res.json();

      setStats(data.stats ?? { total: 0, online: 0, offline: 0 });
      setParticipants(data.participants ?? []);
      setPages(data.pages ?? 1);
      setTotal(data.total ?? 0);
    } catch (error) {
      console.error("Participants load error", error);
    }
  }

  useEffect(() => {
    if (!eventId) return;
    loadParticipants();
  }, [eventId, page, search, category]);

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  return (
    <div className="space-y-6 px-3 sm:px-6 py-6 w-full max-w-none">
      <PageHeader
        icon={<ChartBarIcon className="h-5 w-5" />}
        title="Runner Registry"
        subtitle="Search, filter, and manage all registered runners"
        breadcrumbs={[
          { label: "Home", href: "/organizer/admin" },
          { label: "Runner Registry" },
        ]}
      />

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-6 w-6 text-orange-600" />
          <h2 className="text-lg sm:text-xl  text-gray-900">
            Registered{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Runners
            </span>
          </h2>
        </div>

        <ParticipantsStats
          total={stats.total}
          online={stats.online}
          offline={stats.offline}
          categories={stats.categories}
        />
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <ClipboardDocumentListIcon className="h-6 w-6 text-orange-600" />
          <h2 className="text-lg sm:text-xl  text-gray-900">
            Participant{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Directory
            </span>
          </h2>
        </div>

        {/* Scroll container */}
        <div className="bg-white rounded-xl border border-gray-100">
          {/* Sticky toolbar */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
            <ParticipantsToolbar
              search={search}
              setSearch={setSearch}
              category={category}
              setCategory={setCategory}
            />
          </div>

          {/* Scrollable participants list */}
          <div className="max-h-[65vh] overflow-y-auto">
            <ParticipantsDataGrid data={participants} />
          </div>
        </div>

        <ParticipantsPagination
          page={page}
          pages={pages}
          setPage={setPage}
          total={total}
        />
      </section>
    </div>
  );
}
