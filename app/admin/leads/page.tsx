import { adminDb } from "@/lib/firebaseAdmin";

export default async function LeadsPage() {
  const snapshot = await adminDb
    .collection("leads")
    .orderBy("createdAt", "desc")
    .get();

  const leads = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Leads</h1>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Source</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead: any) => (
              <tr key={lead.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{lead.name || "-"}</td>

                <td className="p-3 font-medium">{lead.phone || "-"}</td>

                <td className="p-3">{lead.email || "-"}</td>

                <td className="p-3 capitalize">{lead.source}</td>

                <td className="p-3">
                  {lead.priority === "high" && (
                    <span className="text-red-500 font-semibold">🔥 High</span>
                  )}

                  {lead.priority === "medium" && (
                    <span className="text-orange-500 font-semibold">
                      ⭐ Medium
                    </span>
                  )}

                  {!lead.priority && <span className="text-gray-400">Low</span>}
                </td>

                <td className="p-3 text-gray-500">
                  {lead.createdAt?.toDate().toLocaleString()}
                </td>

                <td className="p-3 flex gap-2">
                  {lead.phone && (
                    <>
                      <a
                        href={`tel:${lead.phone}`}
                        className="px-3 py-1 text-xs bg-gray-100 rounded"
                      >
                        Call
                      </a>

                      <a
                        href={`https://wa.me/${lead.phone}`}
                        target="_blank"
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded"
                      >
                        WhatsApp
                      </a>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
