"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function ClientProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const profileRef = doc(db, "clients", currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }

        const q = query(
          collection(db, "jobPostings"),
          where("uid", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const clientPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(clientPosts);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen px-6 py-8 bg-[#f9fdf9] text-gray-800">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Your Profile</h1>
        <Link
          href="/dashboard/client"
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600"
        >
          Go to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-10 space-y-3">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Profile Information</h2>
        <p className="text-gray-800"><strong>Name:</strong> {profile?.name || "N/A"}</p>
        <p className="text-gray-800"><strong>Company:</strong> {profile?.company || "N/A"}</p>
        <p className="text-gray-800"><strong>Email:</strong> {user.email}</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Job Postings</h2>
        {posts.length === 0 ? (
          <p className="text-gray-700">No job postings yet.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id} className="border p-4 rounded-lg shadow-sm bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                <p className="text-gray-700">{post.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mt-10 text-center">
        <Link
          href="/create/client-profile"
          className="text-green-500 text-lg font-semibold hover:text-green-600"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
