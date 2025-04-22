export const dynamic = 'force-dynamic';
import { adminDb } from "@/firebase/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const docRef = adminDb.collection("test").doc("connection");
    await docRef.set({ timestamp: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Database error" },
      { status: 500 }
    );
  }
}
