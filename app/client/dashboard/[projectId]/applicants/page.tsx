"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";

type Applicant = {
  engineerId: string;
  message?: string;
  approved?: boolean;
  chatId?: string;
};

type EngineerInfo = {
  name: string;
  specialty: string;
};

export default function ApplicantsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const router = useRouter();
  const [applicants, setApplicants] = useState<(Applicant & EngineerInfo)[]>([]);

  useEffect(() => {
    if (!projectId) return;

    const fetchApplicants = async () => {
      const requestsRef = collection(db, "clientProjects", projectId, "requests");
      const requestSnapshot = await getDocs(requestsRef);

      const withEngineerData = await Promise.all(
        requestSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data() as Applicant;

          if (!data.engineerId) {
            return { ...data, name: "Unknown", specialty: "N/A" }; // fallback
          }

          const engineerDoc = await getDoc(doc(db, "engineers", data.engineerId));
          const engineerInfo: EngineerInfo = engineerDoc.exists()
            ? (engineerDoc.data() as EngineerInfo)
            : { name: "Unknown", specialty: "N/A" };

          return { ...data, ...engineerInfo };
        })
      );

      setApplicants(withEngineerData);
    };

    fetchApplicants();
  }, [projectId]);

  const handleApprove = async (engineerId: string) => {
    if (!projectId) return;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("You must be logged in to approve requests.");
      return;
    }

    const requestRef = doc(db, "clientProjects", projectId, "requests", engineerId);

    // Step 1: Create a new chat doc with auto-generated ID
    const chatDocRef = await addDoc(collection(db, "chats"), {
      participants: [engineerId, currentUser.uid],
      projectId,
      engineerId,
      clientId: currentUser.uid,
      createdAt: serverTimestamp(),
    });

    // Step 2: Update request with approved status and chatId
    await setDoc(
      requestRef,
      { approved: true, chatId: chatDocRef.id },
      { merge: true }
    );

    // Step 3: Redirect to chat
    router.push(`/project-chats/${chatDocRef.id}`);
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-gray-900 px-6 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        Applicants for Project
      </h1>

      {applicants.length === 0 ? (
        <p className="text-center text-gray-600">
          No engineers have applied yet.
        </p>
      ) : (
        <div className="space-y-4">
          {applicants.map((app, idx) => (
  <div
    key={`${app.engineerId || "unknown"}-${idx}`}

              className="bg-white p-4 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {app.name}
                    {app.approved ? (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        Approved
                      </span>
                    ) : (
                      <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        Pending Approval
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Specialty: {app.specialty}
                  </p>
                  {app.message && (
                    <p className="text-gray-700 mt-2">"{app.message}"</p>
                  )}
                </div>
                <Link
                  href={`/engineer/profile/${app.engineerId}`}
                  className="text-blue-600 underline text-sm"
                >
                  View Profile
                </Link>
              </div>

              {app.approved ? (
                <p className="text-green-600 font-semibold">Approved ✅</p>
              ) : (
                <button
                  onClick={() => handleApprove(app.engineerId)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                >
                  Approve & Start Chat
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
