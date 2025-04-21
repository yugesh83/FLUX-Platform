"use client"; // Required for interactivity
import { auth } from "@/lib/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect after login
    } catch (error) {
      alert("Login failed. Check email/password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          FLUX Login
        </h1>
        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-600"
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
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-600"
            placeholder="••••••••"
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}