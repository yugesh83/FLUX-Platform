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
  clientId: string;
  projectId: string;
  lastMessage?: string;
  participants?: string[];
};

type ClientInfo = {
  name: string;
};

type ProjectInfo = {
  title: string;
};

export default function EngineerChatsPage() {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [clientNames, setClientNames] = useState<Record<string, string>>({});
  const [projectTitles, setProjectTitles] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Querying the collabChats collection instead of projectChats
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

      // Fetch related info (client names and project titles)
      const clientNameMap: Record<string, string> = {};
      const projectTitleMap: Record<string, string> = {};

      for (const chat of chatData) {
        if (chat.clientId && !clientNameMap[chat.clientId]) {
          const clientDoc = await getDoc(doc(db, "users", chat.clientId));
          if (clientDoc.exists()) {
            clientNameMap[chat.clientId] = clientDoc.data().name || "Client";
          }
        }

        if (chat.projectId && !projectTitleMap[chat.projectId]) {
          const projectDoc = await getDoc(doc(db, "clientProjects", chat.projectId));
          if (projectDoc.exists()) {
            projectTitleMap[chat.projectId] = projectDoc.data().title || "Project";
          }
        }
      }

      setClientNames(clientNameMap);
      setProjectTitles(projectTitleMap);
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-gray-900 px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">💬 Active Collaboration Chats</h1>

      {chats.length === 0 ? (
        <p className="text-center text-gray-600">You have no active collaboration chats yet.</p>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {chats.map((chat) => (
            <Link key={chat.id} href={`/collab-chats/${chat.id}`}>
              <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
                <h2 className="text-lg font-semibold mb-1">
                  Project: {projectTitles[chat.projectId] || "Untitled"}
                </h2>
                <p className="text-sm text-gray-700 mb-1">
                  Chat with: {clientNames[chat.clientId] || "Client"}
                </p>
                <p className="text-gray-600 text-sm">
                  {chat.lastMessage || "No messages yet."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
