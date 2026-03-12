export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createEvent, EventAttributes } from "ics";

export async function POST(req: Request) {
  try {
    let body;

    // -----------------------------
    // Parse request safely
    // -----------------------------
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { title, description, location, startDate, durationMinutes } = body;

    // -----------------------------
    // Validate required fields
    // -----------------------------
    if (!title || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // -----------------------------
    // Protect against large payload
    // -----------------------------
    if (
      title.length > 120 ||
      (description && description.length > 500) ||
      (location && location.length > 200)
    ) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    // -----------------------------
    // Validate start date
    // -----------------------------
    const start = new Date(startDate);

    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "Invalid start date" },
        { status: 400 },
      );
    }

    // -----------------------------
    // Limit duration
    // -----------------------------
    const duration = Math.min(Math.max(Number(durationMinutes) || 60, 1), 1440);

    // -----------------------------
    // Convert to ICS tuple
    // -----------------------------
    const startTuple: [number, number, number, number, number] = [
      start.getFullYear(),
      start.getMonth() + 1,
      start.getDate(),
      start.getHours(),
      start.getMinutes(),
    ];

    // -----------------------------
    // Create ICS event
    // -----------------------------
    const event: EventAttributes = {
      title,
      description: description || "",
      location: location || "",
      start: startTuple,
      duration: { minutes: duration },
      startInputType: "local",
      startOutputType: "local",
    };

    const { error, value } = createEvent(event);

    if (error) {
      console.error("ICS ERROR:", error);

      return NextResponse.json(
        { error: "Failed to generate calendar event" },
        { status: 500 },
      );
    }

    // -----------------------------
    // Return ICS file
    // -----------------------------
    return new NextResponse(value, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": "attachment; filename=raceline-event.ics",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("ICS API ERROR:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
