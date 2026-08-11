import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect, AdminUser, signAdminToken, loginSchema } from "@primevista/shared";
import { rateLimit } from "@primevista/shared";

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = rateLimit(`login:${ip}`, { limit: 10, windowMs: 5 * 60_000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  await dbConnect();
  const { email, password } = parsed.data;
  const user = await AdminUser.findOne({ email: email.toLowerCase() });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAdminToken({ sub: user._id.toString(), email: user.email, role: user.role, name: user.name });

  return NextResponse.json({
    token,
    user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
  });
}
