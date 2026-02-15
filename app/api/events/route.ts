import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const pageSize = Number(searchParams.get("pageSize")) || 5;
    const pageIndex = Number(searchParams.get("pageIndex")) || 0;

    const snapshot = await getDocs(collection(db, "events"));

    let data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by date ascending
    data.sort((a: any, b: any) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return aDate - bDate;
    });

    const total = data.length;

    const start = pageIndex * pageSize;
    const end = start + pageSize;

    const paginatedData = data.slice(start, end);

    return NextResponse.json({
      data: paginatedData,
      total,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
