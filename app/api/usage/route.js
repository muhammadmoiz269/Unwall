import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

async function getDb() {
  const client = await clientPromise;
  return client.db("unwall");
}

// DELETE /api/usage — Clears all usage records (for development/testing)
export async function DELETE() {
  try {
    const db = await getDb();
    const result = await db.collection("usage").deleteMany({});
    return NextResponse.json({
      message: `Cleared ${result.deletedCount} usage records`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/usage?fingerprint=xxx — Check current usage
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fingerprint = searchParams.get("fingerprint");

    const db = await getDb();
    const today = new Date().toISOString().split("T")[0];

    const query = fingerprint
      ? { userFingerprint: fingerprint, date: today }
      : { date: today };

    const records = await db.collection("usage").find(query).toArray();
    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
