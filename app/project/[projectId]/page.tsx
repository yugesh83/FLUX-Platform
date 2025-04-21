"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import Image from "next/image";

type Project = {
  name: string;
  uploaderName: string;
  specialty: string;
  createdAt: any;
  description: string;
  imageUrls?: string[];
};

type Comment = {
  id: string;
  text: string;
  author: string;
};

export default function ProjectPage() {
    const params = useParams();
    const projectId = params?.projectId as string;    
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    const fetchProject = async () => {
      const docRef = doc(db, "projects", projectId as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Project;
        setProject(data);
        setSelectedImage(data.imageUrls?.[0] || "/placeholder.png");
      }
    };

    const fetchComments = async () => {
      const commentRef = collection(db, "projects", projectId as string, "comments");
      const commentSnap = await getDocs(commentRef);
      const commentData = commentSnap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Comment, "id">),
      }));
      setComments(commentData);
    };

    fetchProject();
    fetchComments();
  }, [projectId]);

  if (!project) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f0fdf4] p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-700">{project.uploaderName}</h2>
            <p className="text-gray-500">{project.specialty || "Specialty not provided"}</p>
            <p className="text-sm text-gray-400 mt-1">
              Posted on: {new Date(project.createdAt?.seconds * 1000).toDateString()}
            </p>

            <div className="flex gap-4 mt-6">
              <button className="bg-green-500 text-black px-4 py-2 rounded-full flex items-center font-semibold hover:bg-green-600 transition">
                SPARK <span className="ml-2 text-orange-600">⚡</span>
              </button>
              <button className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition">
                Request to Collaborate
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Image Gallery */}
        <div className="lg:col-span-2">
          <div className="flex gap-4">
            {/* Thumbnail reel */}
            <div className="flex flex-col gap-2">
              {(project.imageUrls?.length ? project.imageUrls : ["/placeholder.png"]).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border ${
                    selectedImage === img ? "border-green-500" : "border-gray-300"
                  }`}
                  onClick={() => setSelectedImage(img)}
                  alt="thumbnail"
                />
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1">
              <img
                src={selectedImage}
                alt="Project main"
                className="w-full max-h-[500px] object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-7xl mx-auto bg-white mt-10 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Project Description</h2>
        <p className="text-gray-700">{project.description}</p>
      </div>

      {/* Comments */}
      <div className="max-w-7xl mx-auto bg-white mt-6 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Comments</h3>
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first to support this project!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-3 border-b border-gray-200">
                <p className="text-gray-800 font-medium">{comment.author}</p>
                <p className="text-gray-600">{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
