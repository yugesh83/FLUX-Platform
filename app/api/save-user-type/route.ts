import { adminDb } from "@/firebase/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, userType } = await request.json();
    
    await adminDb.collection("users").doc(userId).set({
      userType,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving user type:", error);
    return NextResponse.json(
      { error: "Failed to save user data" },
      { status: 500 }
    );
  }
}
