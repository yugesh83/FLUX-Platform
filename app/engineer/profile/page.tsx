"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

export default function EngineerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const profileRef = doc(db, "engineers", currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          setProfile(profileData);
          setNameInput(profileData.name || "");
          setSpecialtyInput(profileData.specialty || "");
        }

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

        const r = query(
          collection(db, "collaborationRequests"),
          where("toEngineerId", "==", currentUser.uid)
        );
        const requestSnapshot = await getDocs(r);
        const requestsData = requestSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(requestsData);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!nameInput || !specialtyInput || !user) return;
    setIsSaving(true);
    try {
      const profileRef = doc(db, "engineers", user.uid);
      await setDoc(profileRef, {
        name: nameInput,
        specialty: specialtyInput,
        updatedAt: new Date(),
      });
      setProfile({ name: nameInput, specialty: specialtyInput });
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAccept = async (request: any) => {
    const requestRef = doc(db, "collaborationRequests", request.id);
    await updateDoc(requestRef, { status: "accepted" });

    // Check if chat already exists
    const chatsRef = collection(db, "projectChats");
    const existingChats = await getDocs(
      query(
        chatsRef,
        where("projectId", "==", request.projectId),
        where("engineer1Id", "in", [request.fromEngineerId, request.toEngineerId]),
        where("engineer2Id", "in", [request.fromEngineerId, request.toEngineerId])
      )
    );

    if (!existingChats.empty) {
      console.log("Chat already exists, skipping creation.");
    } else {
      const newChatId = uuidv4();
      const chatRef = doc(db, "projectChats", newChatId);
      await setDoc(chatRef, {
        projectId: request.projectId,
        engineer1Id: request.fromEngineerId,
        engineer2Id: request.toEngineerId,
        createdAt: new Date(),
        lastMessage: null,
      });
    }

    const updatedRequests = requests.map((r) =>
      r.id === request.id ? { ...r, status: "accepted" } : r
    );
    setRequests(updatedRequests);
  };

  const handleReject = async (request: any) => {
    const requestRef = doc(db, "collaborationRequests", request.id);
    await updateDoc(requestRef, { status: "rejected" });

    const updatedRequests = requests.map((r) =>
      r.id === request.id ? { ...r, status: "rejected" } : r
    );
    setRequests(updatedRequests);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen px-6 py-8 bg-[#f9fdf9] text-gray-800">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Your Profile</h1>
        <Link
          href="/dashboard/engineer"
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600"
        >
          Go to Dashboard
        </Link>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-10 space-y-3">
        <h2 className="text-xl font-bold mb-3">Profile Information</h2>

        {editing ? (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-600">Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-600">Specialty / Degree</label>
              <input
                type="text"
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700">
              <strong>Name:</strong> {profile?.name || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Specialty / Degree:</strong> {profile?.specialty || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {user.email}
            </p>
            <button
              onClick={() => setEditing(true)}
              className="text-green-500 text-lg font-semibold hover:text-green-600 mt-4"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      {/* Collaboration Requests Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-10">
        <h2 className="text-xl font-bold mb-6">Collaboration Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-600">No collaboration requests yet.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-4 border border-gray-200 rounded-md shadow-sm bg-gray-50"
              >
                <p className="text-gray-700">
                  <strong>{request.fromEngineerName}</strong> wants to collaborate on{" "}
                  <strong>{request.projectTitle}</strong>
                </p>
                <p className="text-sm text-gray-500">Status: {request.status || "pending"}</p>
                {request.status === "pending" && (
                  <div className="mt-2 flex gap-4">
                    <button
                      onClick={() => handleAccept(request)}
                      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Uploaded Projects Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Your Uploaded Projects</h2>
        {projects.length === 0 ? (
          <p className="text-gray-600">No projects uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
