import { NextRequest, NextResponse } from "next/server";
import { saveUserSettings } from "@/app/lib/util/saveUserSettings";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  // validate body
  if (
    !body ||
    typeof body.language !== "string" ||
    typeof body.difficulty !== "string" ||
    (body.display !== undefined && typeof body.display !== "boolean")
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const ok = await saveUserSettings({
    language: body.language,
    difficulty: body.difficulty,
    display: body.display,
  });

  if (!ok) {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
