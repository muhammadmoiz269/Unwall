import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function getDb() {
  const client = await clientPromise;
  return client.db("unwall");
}

// GET /api/articles?fingerprint=xxx
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fingerprint = searchParams.get("fingerprint");
    console.log("[GET /api/articles] fingerprint:", fingerprint);

    if (!fingerprint) {
      return NextResponse.json({ error: "fingerprint required" }, { status: 400 });
    }

    const db = await getDb();
    const articles = await db
      .collection("articles")
      .find({ userFingerprint: fingerprint })
      .sort({ savedAt: -1 })
      .toArray();

    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/articles
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, subtitle, author, date, content, url, userFingerprint } = body;
    console.log("[POST /api/articles] userFingerprint:", userFingerprint);

    if (!title || !url || !userFingerprint) {
      return NextResponse.json({ error: "title, url, and userFingerprint required" }, { status: 400 });
    }

    const db = await getDb();

    // Check if article already saved
    const existing = await db.collection("articles").findOne({
      url,
      userFingerprint,
    });

    if (existing) {
      return NextResponse.json({ message: "Article already saved", article: existing });
    }

    const article = {
      title,
      subtitle: subtitle || "",
      author: author || "Unknown",
      date: date || "",
      content: content || "",
      url,
      userFingerprint,
      savedAt: new Date(),
      readingProgress: 0,
      isRead: false,
    };

    const result = await db.collection("articles").insertOne(article);
    article._id = result.insertedId;

    return NextResponse.json({ message: "Article saved", article }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/articles
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, readingProgress, isRead } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const db = await getDb();
    const update = {};

    if (readingProgress !== undefined) update.readingProgress = readingProgress;
    if (isRead !== undefined) update.isRead = isRead;

    await db.collection("articles").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/articles?id=xxx
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("articles").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
