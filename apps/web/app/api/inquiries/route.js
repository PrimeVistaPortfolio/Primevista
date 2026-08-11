import { NextResponse } from "next/server";
import {
  dbConnect,
  Inquiry,
  inquirySchema,
  rateLimit,
  notifyAdminOfInquiry,
  sendInquiryConfirmation,
} from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = rateLimit(`inquiry:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!allowed) {
    return jsonError("Too many submissions. Please try again later.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400, parsed.error.flatten());
  }

  // Honeypot field tripped — silently pretend success so bots don't learn.
  if (parsed.data.website) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  const { website, ...data } = parsed.data;

  await dbConnect();
  const inquiry = await Inquiry.create({
    ...data,
    ip,
    userAgent: request.headers.get("user-agent") || "",
  });

  notifyAdminOfInquiry(inquiry).catch((err) => console.error("[inquiries] admin notify failed", err));
  sendInquiryConfirmation(inquiry).catch((err) => console.error("[inquiries] confirmation failed", err));

  return NextResponse.json({ success: true, id: inquiry._id.toString() }, { status: 201 });
}

export const GET = requireAdmin(async (request) => {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("q");

  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  const inquiries = await Inquiry.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ inquiries });
});
