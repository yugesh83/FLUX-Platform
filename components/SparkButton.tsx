"use client";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "@/firebase/config";

type Props = {
  projectId: string;
  currentCount: number;
};

export default function SparkButton({ projectId, currentCount }: Props) {
  const [sparkCount, setSparkCount] = useState(currentCount);

  const handleSpark = async () => {
    const newCount = sparkCount + 1;
    setSparkCount(newCount);

    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      sparks: newCount,
    });
  };

  return (
    <button
      onClick={handleSpark}
      className="bg-green-500 text-black px-4 py-2 rounded-full flex items-center font-semibold hover:bg-green-600 transition"
    >
      SPARK <span className="ml-2 text-orange-600">⚡</span>
    </button>
  );
}
