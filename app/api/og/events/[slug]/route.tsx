import { ImageResponse } from "next/og";

export const runtime = "edge";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getEvent(slug: string) {
  try {
    const res = await fetch(`${SITE_URL}/api/events/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    return res.json();
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const event = await getEvent(params.slug);

  if (!event) {
    return new ImageResponse(
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0B1220",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 60,
          fontWeight: 700,
        }}
      >
        Raceline India
      </div>,
      { width: 1200, height: 630 },
    );
  }

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#0B1220",
        color: "white",
        padding: 60,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 70, fontWeight: 800 }}>{event.name}</div>

      <div style={{ fontSize: 40, marginTop: 20 }}>{event.city}</div>

      <div style={{ fontSize: 32, marginTop: 20 }}>Raceline India</div>
    </div>,
    { width: 1200, height: 630 },
  );
}
