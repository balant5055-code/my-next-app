import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit
} from "firebase/firestore";

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url);

    const eventId = searchParams.get("eventId");
    const distance = searchParams.get("distance") || "";
    const gender = searchParams.get("gender") || "";
    const category = searchParams.get("category") || "";
    const page = Number(searchParams.get("page") || 1);
    const limitSize = Number(searchParams.get("limit") || 10);
    const search = (searchParams.get("search") || "").toLowerCase();

    if (!eventId) {
      return NextResponse.json({ success: false });
    }

    /* LIMIT FIRESTORE READ SIZE */

    const q = query(
      collection(db, "registrations_flat"),
      where("eventId", "==", eventId),
      limit(2000) // SAFE PERFORMANCE LIMIT
    );

    const snap = await getDocs(q);

    let runners = snap.docs.map((doc) => {

      const data: any = doc.data() || {};

      const place =
        data?.result?.Place ??
        data?.result?.place ??
        data?.Place ??
        "";

      let rankNumber = 999999;

      if (place) {

        const cleaned = String(place).replace(/\s/g, "");
        const num = parseInt(cleaned.split("/")[0], 10);

        if (!isNaN(num)) rankNumber = num;

      }

      const first = data?.participant?.firstName ?? "";
      const last = data?.participant?.lastName ?? "";

      return {

        id: doc.id,

        bib: data?.participant?.bibNumber ?? "",

        name: `${first} ${last}`.trim(),

        gun: data?.result?.["Gun Time"] ?? "-",

        chip: data?.result?.["Chip time"] ?? "-",

        pace: data?.result?.["Overall Pace"] ?? "-",

        speed: data?.result?.["Overall Speed"] ?? "-",

        distance: data?.result?.Distance ?? "",

        gender: (data?.participant?.gender ?? "").toLowerCase(),

        category: (data?.result?.Category ?? "").toLowerCase(),

        rankNumber,

        rankDisplay: place || "-"

      };

    });

    /* FILTER DISTANCE */

    if (distance) {
      runners = runners.filter((r) =>
        String(r.distance).includes(distance)
      );
    }

    /* FILTER GENDER */

    if (gender && gender !== "overall") {
      runners = runners.filter(
        (r) => r.gender === gender.toLowerCase()
      );
    }

    /* FILTER CATEGORY */

    if (category && category !== "overall") {
      runners = runners.filter(
        (r) => r.category === category.toLowerCase()
      );
    }

    /* SEARCH */

    if (search) {

      runners = runners.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(search) ||
          String(r.bib).includes(search)
      );

    }

    /* SORT */

    runners.sort((a, b) => {

      if (a.rankNumber === 999999) return 1;
      if (b.rankNumber === 999999) return -1;

      return a.rankNumber - b.rankNumber;

    });

    /* REMOVE PODIUM */

    const leaderboard = runners.slice(3);

    const total = leaderboard.length;

    /* PAGINATION */

    const start = (page - 1) * limitSize;
    const end = start + limitSize;

    const paginated = leaderboard.slice(start, end);

    return NextResponse.json({
      success: true,
      runners: paginated,
      total
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json({
      success: false
    });

  }

}