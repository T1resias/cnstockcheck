import { NextResponse } from "next/server";
import { getRecentDates } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const dates = await getRecentDates(60);
  return NextResponse.json(dates);
}
