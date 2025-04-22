"use client";
import React, { useState, useEffect } from "react";
import ProjectFeed from "components/ProjectFeed";  // Updated import path
import UploadForm from "components/UploadForm";  // Updated import path
import { db } from "@/firebase/config";  // Updated import path
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Link from "next/link";  // Make sure to import Link

type Project = {
  id: string;
  name: string;
  createdAt: any;
  imageUrl?: string;
  sparks?: number;
};

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);

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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold text-center mb-6">Engineer Dashboard</h1>

      {/* Your Profile Button */}
      <div className="text-center mb-6">
        <Link
          href="/engineer/profile"  // Correct link to the profile page
          className="text-lg text-green-500 hover:text-green-600"
        >
          Your Profile
        </Link>
      </div>

      {/* Add the UploadForm here */}
      <div className="max-w-lg mx-auto">
        <UploadForm />
      </div>
      
      {/* Display the projects */}
      <ProjectFeed projects={projects} />
    </div>
  );
}

