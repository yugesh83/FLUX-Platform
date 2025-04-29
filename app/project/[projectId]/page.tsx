"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import SparkButton from "@/components/SparkButton";

type Project = {
  name: string;
  uploaderName: string;
  specialty: string;
  createdAt: any;
  description: string;
  sparks?: number;
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
  const [newCommentText, setNewCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");

  const fetchComments = async () => {
    const commentRef = collection(db, "projects", projectId, "comments");
    const commentSnap = await getDocs(commentRef);
    const commentData = commentSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Comment, "id">),
    }));
    setComments(commentData);
  };

  const handleSubmitComment = async () => {
    if (!newCommentText.trim() || !authorName.trim()) return;

    const commentRef = collection(db, "projects", projectId, "comments");
    await addDoc(commentRef, {
      text: newCommentText,
      author: authorName,
    });

    setNewCommentText("");
    setAuthorName("");
    fetchComments(); // Refresh comments
  };

  useEffect(() => {
    const fetchProject = async () => {
      const docRef = doc(db, "projects", projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Project;
        setProject(data);
        setSelectedImage(data.imageUrls?.[0] || "/placeholder.png");
      }
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
            <h2 className="text-xl font-semibold text-gray-700">
              {project.uploaderName}
            </h2>
            <p className="text-gray-500">
              {project.specialty || "Specialty not provided"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Posted on:{" "}
              {project.createdAt?.seconds
                ? new Date(project.createdAt.seconds * 1000).toDateString()
                : "Unknown"}
            </p>
            <p className="text-sm text-yellow-600 mt-2 font-semibold">
              {project.sparks ?? 0} ⚡ SPARKS
            </p>

            <div className="flex gap-4 mt-6">
              <SparkButton
                projectId={projectId}
                currentCount={project.sparks ?? 0}
              />
              <button className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition">
                Request to Collaborate
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Image Gallery */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Thumbnail reel */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto">
              {(project.imageUrls?.length
                ? project.imageUrls
                : ["/placeholder.png"]
              ).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border ${
                    selectedImage === img
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedImage(img)}
                  alt={`thumbnail-${i}`}
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
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Project Description
        </h2>
        <p className="text-gray-700">{project.description}</p>
      </div>

      {/* Comments */}
      <div className="max-w-7xl mx-auto bg-white mt-6 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Comments</h3>

        {/* Input box */}
        <div className="mb-6 space-y-2">
          <input
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <textarea
            placeholder="Write a comment..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
          />
          <button
            onClick={handleSubmitComment}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Post Comment
          </button>
        </div>

        {comments.length === 0 ? (
          <p className="text-gray-500">
            No comments yet. Be the first to support this project!
          </p>
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
