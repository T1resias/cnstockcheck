import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { refreshAll } from "@/lib/refresh";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleRefresh();
}

export async function POST() {
  return handleRefresh();
}

async function handleRefresh() {
  try {
    const result = await refreshAll();
    revalidatePath("/");
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 500 }
    );
  }
}
