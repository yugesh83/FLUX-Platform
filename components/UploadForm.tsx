"use client";

import React, { useState, useRef } from "react";
import { db, storage, auth } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !imageFile) {
      setError("Please fill out all fields and choose an image.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to upload a project.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload image to Firebase Storage
      const storageRef = ref(storage, `projects/${user.uid}/${Date.now()}_${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        "state_changed",
        null,
        (uploadError) => {
          console.error("Storage upload error:", uploadError);
          setError("Error uploading image. Please try again.");
          setLoading(false);
        },
        async () => {
          // 2. Get the download URL
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // 3. Create project document in Firestore
          await addDoc(collection(db, "projects"), {
            title: title.trim(),
            description: description.trim(),
            imageUrl,
            sparks: 0,
            ownerId: user.uid,
            createdAt: serverTimestamp(),
          });

          // 4. Reset form
          setTitle("");
          setDescription("");
          setImageFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          // 5. Redirect to engineer dashboard
          router.push("/dashboard/engineer");
        }
      );
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message || "Failed to upload project.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">Upload Project</h2>

      {error && (
        <p className="text-red-500 text-sm text-center mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Project Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter project title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Project Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter project description"
            rows={4}
            required
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Project Image
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="w-full text-sm text-gray-500"
            required
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Uploading..." : "Upload Project"}
          </button>
        </div>
      </form>
    </div>
  );
}






