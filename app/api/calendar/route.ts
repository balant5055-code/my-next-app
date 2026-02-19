import { NextResponse } from "next/server";
import { createEvent, EventAttributes } from "ics";

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, location, startDate, durationMinutes } = body;

  const start = new Date(startDate);

  // ✅ Proper tuple type
  const startTuple: [number, number, number, number, number] = [
    start.getFullYear(),
    start.getMonth() + 1,
    start.getDate(),
    start.getHours(),
    start.getMinutes(),
  ];

  const event: EventAttributes = {
    title,
    description,
    location,
    start: startTuple,
    duration: { minutes: Number(durationMinutes) },
    startInputType: "local",
    startOutputType: "local",
  };

  const { error, value } = createEvent(event);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return new NextResponse(value, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": "attachment; filename=raceline-event.ics",
    },
  });
}
