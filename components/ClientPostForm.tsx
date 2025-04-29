"use client";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function ClientPostForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slots, setSlots] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "clientProjects"), {
        title,
        description,
        requiredSlots: Number(slots) || 1,
        clientId: user.uid,
        createdAt: new Date(),
      });
      setTitle("");
      setDescription("");
      setSlots("");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error posting requirement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Post a New Requirement</h2>
      <input
        type="text"
        placeholder="Project Title"
        className="w-full border px-4 py-2 rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Project Description"
        className="w-full border px-4 py-2 rounded"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Engineers Needed"
        className="w-full border px-4 py-2 rounded"
        min="1"
        value={slots}
        onChange={(e) => setSlots(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className={`w-full px-4 py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Posting…" : "Post Requirement"}
      </button>
    </form>
  );
}
