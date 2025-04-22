"use client";
import React, { useState } from "react";
import { db, storage, auth } from "../../lib/firebase-config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

export default function UploadProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please enter both title and description.");
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = images.map(async (image) => {
        const imageRef = ref(storage, `project-images/${uuidv4()}-${image.name}`);
        await uploadBytes(imageRef, image);
        return await getDownloadURL(imageRef);
      });

      const imageUrls = await Promise.all(uploadPromises);

      const user = auth.currentUser;

      await addDoc(collection(db, "projects"), {
        name: title,
        description,
        imageUrls,
        createdAt: serverTimestamp(),
        uploaderName: user?.displayName || "Anonymous",
        uploaderId: user?.uid || null,
      });

      alert("Project uploaded successfully!");
      router.push("/dashboard/engineer");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check the console for more details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Upload New Project</h1>

        <input
          type="text"
          placeholder="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md text-gray-900"
        />

        <textarea
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md text-gray-900"
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="w-full mb-4 text-gray-900"
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          {images.map((image, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(image)}
              alt={`Preview ${idx + 1}`}
              className="w-full h-40 object-cover rounded-md"
            />
          ))}
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-3 text-white font-semibold bg-green-600 hover:bg-green-700 rounded-md transition duration-300"
        >
          {uploading ? "Uploading..." : "Upload Project"}
        </button>
      </div>
    </div>
  );
}
