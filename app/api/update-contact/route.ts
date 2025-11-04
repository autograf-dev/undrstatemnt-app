import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/server/tokens";

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  } as Record<string, string>;
}

export async function OPTIONS() {
  return new NextResponse("", { headers: cors() });
}

type UpdateParams = { id?: string; website?: string };

async function doUpdate(params: UpdateParams) {
  try {
    const token = await getValidAccessToken();
    if (!token) return NextResponse.json({ error: "Access token missing" }, { status: 401, headers: cors() });

    const id = (params.id || "").trim();
    const website = (params.website || "").trim();
    if (!id || !website) return NextResponse.json({ error: "Missing required query params (id, website)" }, { status: 400, headers: cors() });

    const resp = await fetch(`https://services.leadconnectorhq.com/contacts/${encodeURIComponent(id)}` , {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ website }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error("update-contact error:", data);
      return NextResponse.json({ error: data }, { status: resp.status || 500, headers: cors() });
    }
    return NextResponse.json({ success: true, updatedContact: data }, { headers: cors() });
  } catch (e: any) {
    console.error("update-contact failed:", e?.message || e);
    return NextResponse.json({ error: "Failed to update contact", details: e?.message || String(e) }, { status: 500, headers: cors() });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  return doUpdate(params as UpdateParams);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return doUpdate(body as UpdateParams);
}


