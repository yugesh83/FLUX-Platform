// app/create/client-profile/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function ClientProfileCreationPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) {
      alert("Name and Company are required.");
      return;
    }

    setIsSubmitting(true);
    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, "clients", user.uid), {
        name,
        company,
        email: user.email,
        createdAt: new Date(),
      });
      router.push("/client/profile");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Complete Your Client Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full mt-2 p-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-700"
            >
              Company
            </label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter your company name"
              required
              className="w-full mt-2 p-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}