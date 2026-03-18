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

    if (!eventId) {
      return NextResponse.json({ success: false });
    }

    /* LIMIT FIRESTORE READ */

    const q = query(
      collection(db, "registrations_flat"),
      where("eventId", "==", eventId),
      limit(1000) // SAFE LIMIT
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
        const num = parseInt(String(place).split("/")[0], 10);
        if (!isNaN(num)) rankNumber = num;
      }

      const first = data?.participant?.firstName ?? "";
      const last = data?.participant?.lastName ?? "";

      return {

        id: doc.id,

        bib: data?.participant?.bibNumber ?? "",

        name: `${first} ${last}`.trim(),

        chip: data?.result?.["Chip time"] ?? "-",

        gun: data?.result?.["Gun Time"] ?? "-",

        pace: data?.result?.["Overall Pace"] ?? "-",

        speed: data?.result?.["Overall Speed"] ?? "-",

        gender: (data?.participant?.gender ?? "").toLowerCase(),

        category: (data?.result?.Category ?? "").toLowerCase(),

        distance: data?.result?.Distance ?? "",

        rankNumber

      };

    });

    /* FILTER DISTANCE */

    if (distance) {
      runners = runners.filter(r =>
        String(r.distance).includes(distance)
      );
    }

    /* FILTER GENDER */

    if (gender && gender !== "overall") {
      runners = runners.filter(r =>
        r.gender === gender.toLowerCase()
      );
    }

    /* FILTER CATEGORY */

    if (category && category !== "overall") {
      runners = runners.filter(r =>
        r.category === category.toLowerCase()
      );
    }

    /* SORT BY RANK */

    runners.sort((a, b) => a.rankNumber - b.rankNumber);

    /* TOP 3 */

    const podium = runners.slice(0, 3);

    return NextResponse.json({
      success: true,
      runners: podium
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json({
      success: false
    });

  }

}