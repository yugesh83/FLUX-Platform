"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Chat = {
  id: string;
  engineer1Id: string;
  engineer2Id: string;
  projectId: string;
  lastMessage?: string;
};

type EngineerInfo = {
  name: string;
};

type ProjectInfo = {
  title: string;
};

export default function CollabChatsPage() {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [engineerNames, setEngineerNames] = useState<Record<string, string>>({});
  const [projectTitles, setProjectTitles] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const q = query(
        collection(db, "collabChats"),
        where("participants", "array-contains", currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const chatData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Chat, "id">),
      }));
      setChats(chatData);

      const engineerNameMap: Record<string, string> = {};
      const projectTitleMap: Record<string, string> = {};

      for (const chat of chatData) {
        const otherEngineerId =
          chat.engineer1Id === currentUser.uid ? chat.engineer2Id : chat.engineer1Id;

        if (otherEngineerId && !engineerNameMap[otherEngineerId]) {
          const engineerDoc = await getDoc(doc(db, "users", otherEngineerId));
          if (engineerDoc.exists()) {
            engineerNameMap[otherEngineerId] = engineerDoc.data().name || "Engineer";
          }
        }

        if (chat.projectId && !projectTitleMap[chat.projectId]) {
          const projectDoc = await getDoc(doc(db, "projects", chat.projectId));
          if (projectDoc.exists()) {
            projectTitleMap[chat.projectId] = projectDoc.data().title || "Project";
          }
        }
      }

      setEngineerNames(engineerNameMap);
      setProjectTitles(projectTitleMap);
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-gray-900 px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">🤝 Engineer Collaboration Chats</h1>

      {chats.length === 0 ? (
        <p className="text-center text-gray-600">No active collaboration chats found.</p>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {chats.map((chat) => {
            const otherEngineerId =
              chat.engineer1Id === user.uid ? chat.engineer2Id : chat.engineer1Id;

            return (
              <Link key={chat.id} href={`/project-chats/${chat.id}`}>
                <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
                  <h2 className="text-lg font-semibold mb-1">
                    Project: {projectTitles[chat.projectId] || "Untitled"}
                  </h2>
                  <p className="text-sm text-gray-700 mb-1">
                    Collaborating with: {engineerNames[otherEngineerId] || "Engineer"}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {chat.lastMessage || "No messages yet."}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
