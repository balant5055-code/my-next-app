"use client";

import { useEffect, useState } from "react";
import { secureFetch } from "@/lib/secureFetch";

const EVENT_ID = "lZBhQM0x0hjQvHglv2Gp";
const PAGE_SIZE = 20;

export default function RegistrationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [paymentFilter, setPaymentFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchRegistrations = async (next = false) => {
    if (loading) return;

    setLoading(true);

    try {
      let url = `/api/admin/registrations?eventId=${EVENT_ID}`;

      if (paymentFilter) {
        url += `&paymentStatus=${paymentFilter}`;
      }

      if (categoryFilter) {
        url += `&categoryId=${categoryFilter}`;
      }

      if (search) {
        url += `&search=${search.toLowerCase()}`;
      }

      if (next && cursor) {
        url += `&lastCreatedAt=${cursor}`;
      }

      const res = await secureFetch(url);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error);

      if (next) {
        setData((prev) => [...prev, ...json.data]);
      } else {
        setData(json.data);
      }

      setCursor(json.nextCursor);
      setHasMore(Boolean(json.nextCursor));
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    setCursor(null);
    setHasMore(true);
    fetchRegistrations(false);
  }, [paymentFilter, categoryFilter, search]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Registrations</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          className="border px-3 py-2"
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="">All Payments</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>

        <input
          type="text"
          placeholder="Search name / phone / email"
          className="border px-3 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Payment</th>
            </tr>
          </thead>

          <tbody>
            {data.map((reg) => (
              <tr key={reg.id} className="border-t">
                <td className="p-2">{reg.fullName}</td>
                <td className="p-2">{reg.phone}</td>
                <td className="p-2">{reg.category}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      reg.paymentStatus === "SUCCESS"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {reg.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {hasMore && (
        <button
          disabled={loading}
          onClick={() => fetchRegistrations(true)}
          className="mt-6 px-4 py-2 bg-orange-600 text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
