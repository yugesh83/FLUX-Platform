"use client";
import React, { useState } from "react";
import { db, storage } from "@/lib/firebase-config"; // Import Firebase config
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const UploadForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !image) {
      setError("Please fill out all fields and upload an image.");
      return;
    }

    setLoading(true);

    // Upload image to Firebase Storage
    const storageRef = ref(storage, `projects/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      null,
      (err) => {
        setError("Error uploading image: " + err.message);
        setLoading(false);
      },
      async () => {
        // Get the image URL after upload
        const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

        // Store the project in Firestore
        try {
          await addDoc(collection(db, "projects"), {
            name,
            description,
            createdAt: Timestamp.now(),
            imageUrl,
            sparks: 0, // Initial sparks count
          });
          setLoading(false);
          setName("");
          setDescription("");
          setImage(null); // Clear the file input
          setError(""); // Clear any error message
        } catch (err) {
          setError("Error uploading project: " + err.message);
          setLoading(false);
        }
      }
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">Upload Project</h2>
      {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter project name"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Project Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter project description"
            rows={4}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Project Image
          </label>
          <input
            type="file"
            id="image"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;





