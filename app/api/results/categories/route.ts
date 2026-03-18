import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ success: false });
    }

    /* EVENT DISTANCES */

    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return NextResponse.json({ success: false });
    }

    const eventData: any = eventSnap.data();

    const distances =
      eventData.categories?.map((c: any) => c.distance) || [];

    /* AGE CATEGORIES */

    const regRef = collection(db, "registrations_flat");
    const q = query(regRef, where("eventId", "==", eventId));

    const regSnap = await getDocs(q);

    const ageSet = new Set<string>();

    regSnap.forEach((doc) => {
      const data: any = doc.data();
      const cat = data?.result?.Category;

      if (cat) ageSet.add(cat);
    });

    const ageCategories = Array.from(ageSet).sort();

    return NextResponse.json({
      success: true,
      distances,
      categories: ageCategories,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}