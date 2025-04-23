"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function ProjectBoard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clientProjects"));
        const fetchedProjects = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error fetching client projects:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProjects();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRequestToWork = async (projectId: string) => {
    if (!user) {
      alert("You must be logged in to send a request.");
      return;
    }

    try {
      await addDoc(collection(db, `clientProjects/${projectId}/requests`), {
        engineerId: user.uid,
        requestedAt: Timestamp.now(),
        status: "pending", // default status
      });

      alert("Request sent successfully! ⚡");
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to send request. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fdf9] px-6 py-8 text-gray-800">
      <h1 className="text-3xl font-bold mb-8">Client Project Board</h1>

      {projects.length === 0 ? (
        <p className="text-gray-600">No client projects posted yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h2>
              <p className="text-gray-700 mb-3">{project.description}</p>
              <p className="text-sm text-gray-500 mb-4"><strong>Posted by:</strong> {project.clientName || "Anonymous"}</p>
              <button
                onClick={() => handleRequestToWork(project.id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Request to Work
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
