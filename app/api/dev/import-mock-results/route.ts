export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { mockParticipants } from "@/data/mockParticipants";

export async function GET() {
  try {

    if (!mockParticipants || mockParticipants.length === 0) {
      return NextResponse.json(
        { error: "No mock participants found" },
        { status: 400 }
      );
    }

    const snapshot = await adminDb.collection("registrations_flat").get();
    const docs = snapshot.docs;

    let updated = 0;
    let skipped = 0;
    const notFound: string[] = [];

    for (const mock of mockParticipants) {

      const mockName = mock.Name.trim().toLowerCase();

      let matchedDoc: any = null;

      for (const doc of docs) {
        const data = doc.data();

        const fullName = `${data.participant?.firstName ?? ""} ${data.participant?.lastName ?? ""}`
          .trim()
          .toLowerCase();

        if (fullName === mockName) {
          matchedDoc = doc;
          break;
        }
      }

      if (!matchedDoc) {
        skipped++;
        notFound.push(mock.Name);
        continue;
      }

      const bibNumber = Number(mock.Bib);

      await matchedDoc.ref.update({
        "participant.bibNumber": bibNumber,
        result: {
          ...mock
        }
      });

      updated++;
    }

    return NextResponse.json({
      success: true,
      totalMockRows: mockParticipants.length,
      updated,
      skipped,
      notFound
    });

  } catch (error: any) {

    console.error("RESULT IMPORT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Import failed"
      },
      { status: 500 }
    );
  }
}