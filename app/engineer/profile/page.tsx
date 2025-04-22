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
    <div className="min-h-screen bg-[#f0fdf4] py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header - Improved spacing */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Engineer Profile</h1>
          <button
            onClick={() => router.push("/dashboard/engineer")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition w-full sm:w-auto text-center"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Profile Section - Better organization */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Profile Details</h2>
              <div className="mt-2 space-y-1">
                <p className="text-gray-700"><span className="font-medium">Name:</span> {userProfile.name}</p>
                <p className="text-gray-700"><span className="font-medium">Specialty:</span> {userProfile.specialty}</p>
              </div>
            </div>
            <button
              className="text-indigo-600 hover:underline whitespace-nowrap"
              onClick={() => router.push("/users/edit-profile")}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Collab Requests - Consistent styling */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">Collaboration Requests</h2>
          <p className="text-gray-500 text-sm sm:text-base">You don't have any requests yet. Coming soon!</p>
        </div>

        {/* Project Grid - Fixed sizing and spacing */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Your Uploaded Projects</h2>
            {projects.length > 0 && (
              <button 
                onClick={() => router.push("/projects/new")}
                className="text-sm text-green-600 hover:underline"
              >
                + Add Project
              </button>
            )}
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No projects uploaded yet.</p>
              <button
                onClick={() => router.push("/projects/new")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project: any) => (
                <div 
                  key={project.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                >
                  <img
                    src={project.imageUrls?.[0] || "/placeholder.png"}
                    alt="Project"
                    className="w-full h-32 sm:h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-md font-semibold text-gray-800 mb-1 line-clamp-1">{project.name}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{project.description}</p>
                    <button
                      onClick={() => router.push(`/project/${project.id}`)}
                      className="text-sm text-green-600 hover:underline w-full text-left"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}