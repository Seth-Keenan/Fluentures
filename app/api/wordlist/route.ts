import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import type { WordItem } from "@/app/types/wordlist";

const DATA_DIR = path.join(process.cwd(), "data", "wordlists");
const FILE_PATH = path.join(DATA_DIR, "default.json");

type WordListFile = {
  name?: string;
  description?: string;
  items: WordItem[];
};

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE_PATH);
  } catch {
    const empty: WordListFile = { items: [] };
    await fs.writeFile(FILE_PATH, JSON.stringify(empty, null, 2), "utf8");
  }
}

export async function GET() {
  try {
    await ensureFile();
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as WordListFile;
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Read wordlist error:", err);
    return NextResponse.json({ error: "Failed to read wordlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WordListFile;
    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Basic validation
    for (const item of body.items as WordItem[]) {
      if (!item.id || typeof item.id !== "string") {
        return NextResponse.json({ error: "Each item must have an id" }, { status: 400 });
      }
      if (!item.target || !item.english) {
        return NextResponse.json({ error: "target and english are required" }, { status: 400 });
      }
    }

    await ensureFile();
    await fs.writeFile(FILE_PATH, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save wordlist error:", err);
    return NextResponse.json({ error: "Failed to save wordlist" }, { status: 500 });
  }
}
