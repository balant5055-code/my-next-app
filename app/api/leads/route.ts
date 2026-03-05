import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, name, email, message, source } = body;

    /* 1️⃣ Save to Firebase */
    await adminDb.collection("leads").add({
      ...body,
      createdAt: new Date(),
    });

    /* 2️⃣ Send lead notification to YOU */

    await resend.emails.send({
      from: "Raceline <onboarding@resend.dev>",
      to: [process.env.LEADS_EMAIL!],
      subject: "🚀 New Raceline Lead",
      html: `
  <div style="font-family:Arial, sans-serif;background:#f9fafb;padding:20px">

    <div style="
      max-width:600px;
      margin:auto;
      background:white;
      border-radius:10px;
      border:1px solid #e5e7eb;
      padding:24px;
    ">

      <h2 style="margin:0 0 16px;color:#111827">
        🚀 New Raceline Lead
      </h2>

      <p style="color:#6b7280;font-size:14px;margin-bottom:20px">
        A new inquiry was submitted from your website.
      </p>

      <table style="width:100%;font-size:14px">

        ${
          source
            ? `<tr>
                <td style="padding:8px 0;color:#6b7280">Source</td>
                <td style="padding:8px 0;font-weight:600">${source}</td>
              </tr>`
            : ""
        }

        ${
          phone
            ? `<tr>
                <td style="padding:8px 0;color:#6b7280">Phone</td>
                <td style="padding:8px 0;font-weight:600">${phone}</td>
              </tr>`
            : ""
        }

        ${
          name
            ? `<tr>
                <td style="padding:8px 0;color:#6b7280">Name</td>
                <td style="padding:8px 0;font-weight:600">${name}</td>
              </tr>`
            : ""
        }

        ${
          email
            ? `<tr>
                <td style="padding:8px 0;color:#6b7280">Email</td>
                <td style="padding:8px 0;font-weight:600">${email}</td>
              </tr>`
            : ""
        }

      </table>

      ${
        message
          ? `<div style="
                margin-top:20px;
                padding:14px;
                background:#f9fafb;
                border-radius:6px;
                border:1px solid #e5e7eb;
              ">
              <p style="margin:0;font-size:14px;color:#374151">
                ${message}
              </p>
            </div>`
          : ""
      }

      <div style="margin-top:24px">

        ${
          phone
            ? `<a href="tel:${phone}" 
                style="
                  display:inline-block;
                  padding:10px 16px;
                  background:#ef4444;
                  color:white;
                  text-decoration:none;
                  border-radius:6px;
                  font-size:14px;
                  margin-right:10px;
                ">
                📞 Call
              </a>`
            : ""
        }

        ${
          phone
            ? `<a href="https://wa.me/${phone}" 
                style="
                  display:inline-block;
                  padding:10px 16px;
                  background:#22c55e;
                  color:white;
                  text-decoration:none;
                  border-radius:6px;
                  font-size:14px;
                ">
                💬 WhatsApp
              </a>`
            : ""
        }

      </div>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">

      <p style="font-size:12px;color:#9ca3af">
        Raceline India • Event Registration & Timing Platform
      </p>

    </div>

  </div>
`,
    });

    /* 3️⃣ Send AUTO REPLY to the user (only if email exists) */

    if (email) {
      await resend.emails.send({
        from: "Raceline <onboarding@resend.dev>",
        to: [email],
        subject: "Thanks for contacting Raceline",
        html: `
          <div style="font-family:Arial;padding:20px;background:#f9fafb">

            <div style="max-width:600px;margin:auto;background:white;padding:24px;border-radius:8px;border:1px solid #e5e7eb">

              <h2 style="margin-bottom:16px">Hi ${name || "there"} 👋</h2>

              <p style="color:#374151;font-size:14px">
                Thank you for contacting <b>Raceline India</b>.
              </p>

              <p style="color:#374151;font-size:14px">
                Our team received your message and will get back to you shortly.
              </p>

              <div style="margin-top:20px;padding:12px;background:#f9fafb;border-radius:6px">
                <p style="margin:0;font-size:13px;color:#6b7280">
                  Your message:
                </p>
                <p style="margin:4px 0 0 0;font-size:14px">
                  ${message || ""}
                </p>
              </div>

              <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">

              <p style="font-size:12px;color:#9ca3af">
                Raceline India<br/>
                Event Registration & Timing Platform
              </p>

            </div>

          </div>
        `,
      });
    }

    const telegramMessage = `
            🚀 New Raceline Lead

            Source: ${source}

            ${phone ? `📞 Phone: ${phone}` : ""}
            ${name ? `👤 Name: ${name}` : ""}
            ${email ? `📧 Email: ${email}` : ""}
            ${message ? `💬 Message: ${message}` : ""}
            `;

    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: telegramMessage,
        }),
      },
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Lead processing failed" },
      { status: 500 },
    );
  }
}
