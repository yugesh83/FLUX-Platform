"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";

export default function EngineerProfilePage() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user?.uid;

  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const fetchProfile = async () => {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || "");
        setSpecialty(data.specialty || "");
        setBio(data.bio || "");
        setIsFirstVisit(false);
      } else {
        setIsFirstVisit(true);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [uid]);

  const handleSave = async () => {
    if (!uid || !name || !specialty) return alert("Name and Specialty are required.");

    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { name, specialty, bio }, { merge: true });

    setIsFirstVisit(false);
    alert("Profile saved successfully!");
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f0fdf4] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Engineer Profile</h1>
          <button
            onClick={() => router.push("/engineer/dashboard")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-semibold block mb-1">Name*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Specialty / Degree*</label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., B.Tech in Mechanical Engineering"
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Short Bio (optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
              placeholder="Tell us a little about yourself"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded hover:bg-indigo-700"
        >
          {isFirstVisit ? "Save Profile" : "Update Profile"}
        </button>

        {!isFirstVisit && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2 text-gray-700">Your Projects</h2>
            <p className="text-gray-500">Coming soon: All your uploaded projects will appear here.</p>

            <h2 className="text-xl font-bold mt-6 mb-2 text-gray-700">Collaboration Requests</h2>
            <p className="text-gray-500">Coming soon: Any requests to collaborate on projects will be shown here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
