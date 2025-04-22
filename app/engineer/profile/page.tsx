"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/firebase/config";

export default function EngineerProfilePage() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

  const [userProfile, setUserProfile] = useState({ name: "", specialty: "" });
  const [projects, setProjects] = useState([]);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setUserProfile(profileSnap.data() as any);
        }

        const q = query(collection(db, "projects"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedProjects = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(fetchedProjects as any);
      } else {
        router.push("/signup");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#f0fdf4] py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">Engineer Profile</h1>
          <button
            onClick={() => router.push("/dashboard/engineer")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">Profile Details</h2>
          <p className="text-gray-700"><strong>Name:</strong> {userProfile.name}</p>
          <p className="text-gray-700"><strong>Specialty:</strong> {userProfile.specialty}</p>
          <button
            className="mt-3 text-indigo-600 hover:underline"
            onClick={() => router.push("/users/edit-profile")}
          >
            Edit Profile
          </button>
        </div>

        {/* Collab Requests */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Collaboration Requests</h2>
          <p className="text-gray-500">You don't have any requests yet. Coming soon!</p>
        </div>

        {/* Project Grid */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Uploaded Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any) => (
                <div key={project.id} className="bg-[#f0fdf4] p-4 rounded-xl shadow hover:shadow-md transition">
                  <img
                    src={project.imageUrls?.[0] || "/placeholder.png"}
                    alt="Project"
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                  <p className="text-gray-500 text-sm truncate">{project.description}</p>
                  <button
                    onClick={() => router.push(`/project/${project.id}`)}
                    className="mt-2 text-green-600 hover:underline"
                  >
                    View Project
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
