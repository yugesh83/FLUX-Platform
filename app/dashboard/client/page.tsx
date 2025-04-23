"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  createdAt: any;
  imageUrl?: string;
  description: string;
  uploaderName: string;
};

export default function ClientDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [requirement, setRequirement] = useState("");

  // State to manage requests
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Project, "id">),
      }));
      setProjects(data);
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Requirement submission
  const handleRequirementSubmit = async () => {
    if (!requirement.trim()) return;
    await addDoc(collection(db, "requirements"), {
      requirement,
      createdAt: new Date(),
    });
    setRequirement("");
    alert("Project requirement submitted!");
  };

  // Fetch requests for a specific project
  const fetchRequests = async (projectId: string) => {
    const requestsRef = collection(db, `clientProjects/${projectId}/requests`);
    const querySnapshot = await getDocs(requestsRef);
    const fetchedRequests = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRequests(fetchedRequests);
  };

  // Handle accept/reject request
  const handleAcceptRequest = async (projectId: string, requestId: string) => {
    try {
      const requestRef = doc(db, `clientProjects/${projectId}/requests`, requestId);
      await setDoc(requestRef, { status: "accepted" }, { merge: true });
      alert("Request accepted!");
      fetchRequests(projectId);
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (projectId: string, requestId: string) => {
    try {
      const requestRef = doc(db, `clientProjects/${projectId}/requests`, requestId);
      await setDoc(requestRef, { status: "rejected" }, { merge: true });
      alert("Request rejected!");
      fetchRequests(projectId);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#f0fdf4] text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center">Client Dashboard</h1>

      {/* Quote Requirement Box */}
      <div className="max-w-2xl mx-auto bg-white rounded-md shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Quote a Project Requirement</h2>
        <textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="Describe what you're looking to build..."
          className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none mb-2"
          rows={3}
        />
        <button
          onClick={handleRequirementSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Submit Requirement
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search projects..."
        className="block w-full max-w-md mx-auto mb-8 p-3 border border-gray-300 rounded-md text-gray-900"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Link key={project.id} href={`/project/${project.id}`}>
            <div className="bg-white rounded-md shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer p-4">
              <img
                src={project.imageUrl || "/placeholder.png"}
                alt={project.name}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-800">{project.name}</h2>
              <p className="text-gray-600 text-sm mb-2">By: {project.uploaderName}</p>
              <p className="text-gray-700 text-sm">{project.description}</p>

              {/* Request to Work Button */}
              <button
                onClick={() => fetchRequests(project.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mt-4"
              >
                View Requests
              </button>

              {/* Displaying requests for the project */}
              {requests.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Requests:</h3>
                  {requests.map((request) => (
                    <div key={request.id} className="bg-gray-100 p-3 rounded-lg mb-4">
                      <p><strong>Engineer:</strong> {request.engineerId}</p>
                      <p><strong>Status:</strong> {request.status}</p>
                      <div className="flex justify-between mt-2">
                        <button
                          onClick={() => handleAcceptRequest(project.id, request.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(project.id, request.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

