"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";

export default function EngineerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch the user's profile details from Firestore
        const profileRef = doc(db, "engineers", currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }

        // Fetch the user's uploaded projects from Firestore
        const q = query(
          collection(db, "projects"),
          where("uid", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const userProjects = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProjects(userProjects);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen px-6 py-8 bg-[#f9fdf9]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Your Profile</h1>
        <Link
          href="/engineer/dashboard"
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600"
        >
          Go to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-10 space-y-3">
        <h2 className="text-xl font-bold mb-3">Profile Information</h2>
        <p><strong>Name:</strong> {profile?.name || "N/A"}</p>
        <p><strong>Specialty / Degree:</strong> {profile?.specialty || "N/A"}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      {/* User's Own Projects */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Your Uploaded Projects</h2>
        {projects.length === 0 ? (
          <p>No projects uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mt-10">
        <Link
          href="/create/profile"
          className="text-green-500 text-lg font-semibold hover:text-green-600"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
