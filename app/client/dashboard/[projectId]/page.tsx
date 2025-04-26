"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function ClientJobDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId;
  const router = useRouter();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const fetchProject = async () => {
      const docRef = doc(db, "clientProjects", projectId as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProject(docSnap.data());
      } else {
        setProject(null);
      }
    };

    fetchProject();
  }, [projectId]);


  if (!project) {
    return <div className="p-6">Loading project details...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
      <p className="mb-2 text-gray-700">{project.description}</p>
      <p className="mb-6 text-sm text-gray-500">Posted on: {new Date(project.createdAt?.seconds * 1000).toLocaleDateString()}</p>

      <button
        onClick={() => router.push(`/client/dashboard/${projectId}/applicants`)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        View Applicants
      </button>
    </div>
  );
}