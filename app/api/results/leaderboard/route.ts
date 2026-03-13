import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const eventId = searchParams.get("eventId");
    const page = Number(searchParams.get("page") || 1);
    const limitSize = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search") || "";
    const distance = searchParams.get("category") || "";

    if (!eventId) {
      return NextResponse.json({ success: false });
    }

    let q;

    /* category filter */

    if (distance && distance !== "") {
      q = query(
        collection(db, "registrations_flat"),
        where("eventId", "==", eventId),
        where("participant.categoryDistance", "==", distance),
      );
    } else {
      q = query(
        collection(db, "registrations_flat"),
        where("eventId", "==", eventId),
      );
    }

    const snap = await getDocs(q);

    let runners = snap.docs.map((d) => {
      const data: any = d.data();

      return {
        id: d.id,

        bib: data.participant?.bibNumber ?? "",

        name: data.participant?.bibName ?? "",

        rank: Number(data.result?.Place?.split("/")[0] || 0),

        gun: data.result?.["Gun Time"] ?? "-",

        chip: data.result?.["Chip time"] ?? "-",

        pace: data.result?.["Overall Pace"] ?? "-",

        speed: data.result?.["Overall Speed"] ?? "-",
      };
    });

    /* search */

    if (search) {
      const q = search.toLowerCase();

      runners = runners.filter(
        (r) => r.name.toLowerCase().includes(q) || String(r.bib).includes(q),
      );
    }

    /* sort by rank */

    runners.sort((a, b) => a.rank - b.rank);

    /* pagination */

    const total = runners.length;

    const start = (page - 1) * limitSize;

    const end = start + limitSize;

    runners = runners.slice(start, end);

    return NextResponse.json({
      success: true,
      runners,
      total,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ success: false });
  }
}
