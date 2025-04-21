// components/CommentSection.tsx
"use client";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase-config";

interface CommentSectionProps {
  projectId: string;
}

export default function CommentSection({ projectId }: CommentSectionProps) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "projects", projectId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(newComments);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await addDoc(collection(db, "projects", projectId, "comments"), {
      text: comment,
      createdAt: new Date(),
    });

    setComment("");
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded"
          placeholder="Write a comment..."
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Post
        </button>
      </form>

      <div>
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet.</p>
        ) : (
          <ul className="space-y-2">
            {comments.map((c) => (
              <li key={c.id} className="bg-gray-100 p-2 rounded">
                {c.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

