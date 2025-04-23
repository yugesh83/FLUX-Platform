"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"engineer" | "client">("engineer");
  const [isSignedUp, setIsSignedUp] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Save basic user data + role to "users"
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role,
        createdAt: new Date(),
      });

      // Pre-create empty profile in engineers or clients
      const coll = role === "engineer" ? "engineers" : "clients";
      await setDoc(doc(db, coll, user.uid), { uid: user.uid });

      setIsSignedUp(true);

      setTimeout(async () => {
        if (role === "engineer") {
          router.push("/profile/create/page");
        } else {
          router.push("/client/profile/create");
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Signup failed – check console for details.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Create an Account</h2>

        {isSignedUp && (
          <div className="text-center text-green-500 mb-4">
            <p>Thank you for joining FLUX! 🎉</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>

          <fieldset className="mb-4">
            <legend className="block text-sm font-medium text-gray-700 mb-2">I am a:</legend>
            <div className="flex space-x-6">
              <label className="flex items-center text-gray-800">
                <input
                  type="radio"
                  name="role"
                  value="engineer"
                  checked={role === "engineer"}
                  onChange={() => setRole("engineer")}
                  className="form-radio text-green-500"
                />
                <span className="ml-2">Engineer</span>
              </label>
              <label className="flex items-center text-gray-800">
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={role === "client"}
                  onChange={() => setRole("client")}
                  className="form-radio text-green-500"
                />
                <span className="ml-2">Client</span>
              </label>
            </div>
          </fieldset>

          <button
            type="submit"
            className="w-full p-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
