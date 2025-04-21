"use client";
import React, { useState } from "react";
import { db, storage } from "@/lib/firebase-config";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function UploadPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!name || !description || !images?.length) {
      alert("Please fill all fields and select at least one image.");
      return;
    }

    setIsUploading(true);

    try {
      const imageUrls = await Promise.all(
        Array.from(images).map(async (image) => {
          const imageRef = ref(storage, `project-images/${uuidv4()}-${image.name}`);
          await uploadBytes(imageRef, image);
          return await getDownloadURL(imageRef);
        })
      );

      await addDoc(collection(db, "projects"), {
        name,
        description,
        imageUrls,
        createdAt: Timestamp.now(),
        uploaderName: "Anonymous", // Will be replaced later with user profile
      });

      alert("Project uploaded successfully!");
      router.push("/dashboard/engineer");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Upload New Project</h1>

        <label className="block mb-3 font-semibold text-gray-700">Project Title</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-3 mb-5"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block mb-3 font-semibold text-gray-700">Project Images</label>
        <input
          type="file"
          multiple
          className="w-full mb-5"
          onChange={(e) => setImages(e.target.files)}
        />

        <label className="block mb-3 font-semibold text-gray-700">Project Description</label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 mb-6"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full bg-green-600 text-white py-3 rounded-md font-bold hover:bg-green-700 transition"
        >
          {isUploading ? "Uploading..." : "Submit Project"}
        </button>
      </div>
    </div>
  );
}
