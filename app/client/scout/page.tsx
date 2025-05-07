"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import Link from "next/link";

type Engineer = {
  id: string;
  name: string;
  specialty: string;
};

type Project = {
  id: string;
  title: string;
};

export default function ClientScoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1. Auth + load engineers & client projects
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (cur) => {
      if (!cur) {
        router.push("/login");
        return;
      }
      setUser(cur);

      // Fetch engineers
      const engSnap = await getDocs(collection(db, "engineers"));
      setEngineers(
        engSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Engineer, "id">),
        }))
      );

      // Fetch this client's posted projects
      const projQ = query(
        collection(db, "clientProjects"),
        where("clientId", "==", cur.uid)
      );
      const projSnap = await getDocs(projQ);
      setProjects(
        projSnap.docs.map((d) => ({
          id: d.id,
          title: (d.data() as any).title,
        }))
      );
    });

    return () => unsubscribe();
  }, [router]);

  // 2. Invite handler
  const invite = async (engineerId: string) => {
    setError(null);
    setSuccess(null);

    const projectId = selected[engineerId];
    if (!projectId) {
      setError("Select a project before inviting.");
      return;
    }

    try {
      await addDoc(collection(db, "collaborationRequests"), {
        fromClientId: user.uid,
        toEngineerId: engineerId,
        projectId,
        status: "pending",
        createdAt: Timestamp.now(),
      });
      setSuccess("Invitation sent!");
      // Clear dropdown selection
      setSelected((s) => ({ ...s, [engineerId]: "" }));
    } catch (e: any) {
      console.error(e);
      setError("Failed to send invitation.");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-gray-900 px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">🔍 Scout Engineers</h1>

      {/* Error / Success Messages */}
      {error && (
        <div className="max-w-md mx-auto mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="max-w-md mx-auto mb-4 p-2 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Engineers List */}
      <div className="max-w-3xl mx-auto space-y-6">
        {engineers.map((eng) => (
          <div
            key={eng.id}
            className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row items-center gap-4"
          >
            {/* Engineer Info & Actions */}
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-semibold">{eng.name}</h2>
              <p className="text-gray-600">{eng.specialty}</p>
              <div className="flex gap-2 mt-2">
                {/* View Engineer Profile */}
                <Link
                  href={`/engineer/profile/${eng.id}`}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  View Profile
                </Link>
                {/* View Selected Project */}
                {selected[eng.id] && (
                  <Link
                    href={`/client/dashboard/${selected[eng.id]}`}
                    className="bg-gray-600 text-white px-4 py-1 rounded hover:bg-gray-700"
                  >
                    View Project
                  </Link>
                )}
              </div>
            </div>

            {/* Project Dropdown + Invite Button */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selected[eng.id] || ""}
                onChange={(e) =>
                  setSelected((s) => ({ ...s, [eng.id]: e.target.value }))
                }
                className="p-2 border border-gray-300 rounded"
              >
                <option value="">Select Your Project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <button
                onClick={() => invite(eng.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Invite
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
