"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase-config"; // ✅ Firebase Auth and Firestore
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // ✅ Firestore utilities

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("engineer");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Save user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        userType,
        createdAt: new Date()
      });

      router.push(`/dashboard/${userType}`);
    } catch (error) {
      alert("Signup failed. Try a stronger password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center p-4">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          FLUX Sign Up
        </h1>

        {/* User Type Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">I am a:</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="userType"
                value="engineer"
                checked={userType === "engineer"}
                onChange={() => setUserType("engineer")}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-gray-700">Engineer</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="userType"
                value="recruiter"
                checked={userType === "recruiter"}
                onChange={() => setUserType("recruiter")}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-gray-700">Recruiter</span>
            </label>
          </div>
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
            placeholder="engineer@example.com"
            required
          />
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}

