// app/dashboard/[userType]/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import ProjectFeed from "../../../components/ProjectFeed";
import { db } from "../../../lib/firebase-config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

type Project = {
  id: string;
  name: string;
  createdAt: any;
  imageUrl?: string;
  sparks?: number;
};

export default function UserTypePage() {
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
    <div className="bg-gradient-to-r from-green-100 to-white min-h-screen flex justify-center items-center">
      <div className="w-full max-w-5xl bg-white p-8 rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          Welcome to Your Dashboard
        </h1>
        <ProjectFeed projects={projects} />
      </div>
    </div>
  );
}




