"use client";
import React from "react";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10 text-gray-800">
      
      {/* Logo and Tagline */}
      <h1 className="text-5xl font-extrabold mb-2 text-center">Welcome to FLUX</h1>
      
      {/* Decorative Quote with Lines */}
      <div className="flex items-center justify-center w-full max-w-3xl mt-4 mb-8">
        <div className="flex-1 h-px bg-gray-300"></div>
        <p className="px-4 text-green-600 font-medium text-sm text-center">
          "Transforming every idea into impact — one project at a time."
        </p>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col space-y-4 mt-8 w-full max-w-xs">
        <Link href="/signup">
          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200">
            Signup
          </button>
        </Link>
        <Link href="/login">
          <button className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition duration-200">
            Login
          </button>
        </Link>
      </div>

      {/* Purpose Section */}
      <div className="mt-24 border-t pt-8 w-full max-w-2xl text-center text-gray-700">
        <p className="text-xl font-semibold mb-2">What is FLUX?</p>
        <p className="text-base leading-relaxed">
          FLUX is a collaborative hub where aspiring engineers and recruiters connect through ideas.
          It empowers creators to showcase, share, and transform their innovative projects into real-world opportunities.
        </p>
      </div>
    </div>
  );
}

