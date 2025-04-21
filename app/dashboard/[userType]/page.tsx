"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../../lib/firebase-config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  createdAt: any;
  imageUrl?: string;
  description?: string;
  uploaderName?: string;
  sparks?: number;
};

export default function UserTypePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Project, "id">),
      }));
      setProjects(projectsData);
    });

    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-[#f0fdf4] text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center">Engineer Dashboard</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search your projects..."
        className="block w-full max-w-md mx-auto mb-8 p-3 border border-gray-300 rounded-md text-gray-900"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Project Grid */}
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
              <p className="text-gray-600 text-sm mb-2">
                By: {project.uploaderName || "Anonymous"}
              </p>
              <p className="text-gray-700 text-sm">
                {project.description || "No description provided."}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}




