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
  engineerId: string;
  projectId: string;
  lastMessage?: string;
};

type EngineerInfo = {
  name: string;
};

export default function ClientChatsPage() {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [engineerNames, setEngineerNames] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // ✅ FIXED: This should query from the correct collection "chats"
      const q = query(
        collection(db, "chats"),
        where("clientId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);

      const chatsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Chat, "id">),
      }));
      setChats(chatsData);

      // Fetch engineer names
      const names: Record<string, string> = {};
      for (const chat of chatsData) {
        if (!names[chat.engineerId]) {
          const engineerDoc = await getDoc(doc(db, "engineers", chat.engineerId));
          if (engineerDoc.exists()) {
            const data = engineerDoc.data() as EngineerInfo;
            names[chat.engineerId] = data.name;
          } else {
            names[chat.engineerId] = "Unknown Engineer";
          }
        }
      }
      setEngineerNames(names);
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-gray-900 px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">💬 Your Chats</h1>

      {chats.length === 0 ? (
        <p className="text-center text-gray-600">No active chats yet.</p>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {chats.map((chat) => (
            <Link key={chat.id} href={`/project-chats/${chat.id}`}>
              <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
                <h2 className="text-lg font-semibold mb-1">
                  Chat with {engineerNames[chat.engineerId] || "Engineer"}
                </h2>
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
