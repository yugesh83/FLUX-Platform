"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

type JobPost = {
  id: string;
  title: string;
  description: string;
  requiredSlots?: number;
  createdAt: Timestamp;
};

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<JobPost[]>([]);

  // Form fields for posting a new job
  const [requirementTitle, setRequirementTitle] = useState("");
  const [requirementDescription, setRequirementDescription] = useState("");
  const [requiredSlots, setRequiredSlots] = useState("");

  // 1) Watch auth and load only THIS client's posts
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Query only the posts where clientId === currentUser.uid
      const q = query(
        collection(db, "clientProjects"),
        where("clientId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<JobPost, "id">),
      }));
      setPosts(fetched);
    });

    return () => unsubscribeAuth();
  }, [router]);

  if (!user) return null; // or a loading state

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-gray-900 px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Your Job Postings</h1>

      {/* Job Post Form */}
      <div className="max-w-2xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4">Post a New Project Requirement</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!requirementTitle.trim() || !requirementDescription.trim()) {
              alert("Please fill in all fields.");
              return;
            }
            await addDoc(collection(db, "clientProjects"), {
              title: requirementTitle,
              description: requirementDescription,
              requiredSlots: Number(requiredSlots) || 1,
              clientId: user.uid,
              createdAt: new Date(),
            });
            setRequirementTitle("");
            setRequirementDescription("");
            setRequiredSlots("");
            alert("Project requirement posted!");
            router.refresh(); // Refresh to show the new post
          }}
          className="bg-white p-6 rounded-xl shadow-md space-y-4"
        >
          <input
            type="text"
            placeholder="Project Title"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            value={requirementTitle}
            onChange={(e) => setRequirementTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Project Description"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            value={requirementDescription}
            onChange={(e) => setRequirementDescription(e.target.value)}
            rows={4}
            required
          />
          <input
            type="number"
            placeholder="Number of Engineers Needed"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            value={requiredSlots}
            onChange={(e) => setRequiredSlots(e.target.value)}
            min="1"
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
          >
            Post Requirement
          </button>
        </form>
      </div>

      {/* Display existing job posts */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-600">You haven’t posted any jobs yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-700 mb-4">{post.description}</p>
              {post.requiredSlots != null && (
                <p className="text-sm text-gray-500 mb-4">
                  <strong>Slots Needed:</strong> {post.requiredSlots}
                </p>
              )}
              <p className="text-xs text-gray-400 mb-4">
                Posted on: {post.createdAt.toDate().toDateString()}
              </p>

              {/* View Applicants Button */}
              <Link href={`/client/dashboard/${post.id}/applicants`} className="block">
                <button className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
                  View Applicants
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

