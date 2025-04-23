"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfileCreationPage() {
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !specialty) {
      alert("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (user) {
        // Save engineer profile data to Firestore in "engineers" collection
        await setDoc(doc(db, "engineers", user.uid), {
          name,
          specialty,
          createdAt: new Date(),
        });

        // Redirect to the engineer profile page after saving
        router.push("/engineer/profile");
      } else {
        alert("No user logged in.");
        router.push("/login");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Complete Your Profile</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Name</label>
            <input
              type="text"
              id="name"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md text-gray-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-600">Specialty / Degree</label>
            <input
              type="text"
              id="specialty"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md text-gray-800"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Enter your specialty or degree"
              required
            />
          </div>

          <button 
            type="submit" 
            className={`w-full p-3 bg-green-500 text-white font-semibold rounded-md ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
