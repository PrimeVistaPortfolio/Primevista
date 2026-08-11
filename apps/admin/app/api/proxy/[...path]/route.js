import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const WEB_API_URL = process.env.WEB_API_URL || "http://localhost:3000";

async function forward(request, paramsPromise) {
  const token = (await cookies()).get("pv_admin_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: pathSegments } = await paramsPromise;
  const path = pathSegments.join("/");
  const search = new URL(request.url).search;
  const url = `${WEB_API_URL}/api/${path}${search}`;

  const init = {
    method: request.method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    const body = await request.text();
    if (body) init.body = body;
  }

  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request, { params }) {
  return forward(request, params);
}
export async function POST(request, { params }) {
  return forward(request, params);
}
export async function PUT(request, { params }) {
  return forward(request, params);
}
export async function DELETE(request, { params }) {
  return forward(request, params);
}
