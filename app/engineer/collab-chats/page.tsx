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
  updateDoc,
  arrayUnion,
  orderBy,
  limit,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { useParams } from "next/navigation"; // ✅ Correct import
import Link from "next/link";

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: Timestamp;
};

type Chat = {
  id: string;
  clientId: string;
  projectId: string;
  participants: string[];
};

type User = {
  name: string;
  uid: string;
};

export default function CollabChatPage() {
  const [user, setUser] = useState<any>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [clientInfo, setClientInfo] = useState<User | null>(null);

  // ✅ Safely get chatId from useParams
  const params = useParams();
  const rawChatId = params?.["chatId"];
  const chatIdStr = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId ?? null;

  // ✅ Guard clause
  if (!chatIdStr) {
    if (typeof window !== "undefined") {
      window.location.href = "/engineer/chats";
    }
    return null;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }
      setUser(currentUser);

      // Fetch chat
      const chatRef = doc(db, "collabChats", chatIdStr);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        window.location.href = "/engineer/chats";
        return;
      }

      setChat({
        id: chatDoc.id,
        clientId: chatDoc.data().clientId,
        projectId: chatDoc.data().projectId,
        participants: chatDoc.data().participants || [],
      });

      // Fetch messages
      const messagesQuery = query(
        collection(db, "collabChats", chatIdStr, "messages"),
        orderBy("timestamp"),
        limit(50)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const fetchedMessages = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        senderId: doc.data().senderId,
        content: doc.data().content,
        timestamp: doc.data().timestamp,
      }));
      setMessages(fetchedMessages);

      // Fetch client info
      const clientRef = doc(db, "users", chatDoc.data().clientId);
      const clientSnapshot = await getDoc(clientRef);
      if (clientSnapshot.exists()) {
        setClientInfo({
          name: clientSnapshot.data().name,
          uid: chatDoc.data().clientId,
        });
      }
    });

    return () => unsubscribe();
  }, [chatIdStr]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: "",
        senderId: user.uid,
        content: newMessage,
        timestamp: Timestamp.now(),
      };

      const messageRef = await addDoc(
        collection(db, "collabChats", chatIdStr, "messages"),
        message
      );

      await updateDoc(doc(db, "collabChats", chatIdStr), {
        lastMessage: newMessage,
        participants: arrayUnion(user.uid),
      });

      message.id = messageRef.id;

      setNewMessage("");
      setMessages((prevMessages) => [...prevMessages, message]);
    }
  };

  if (!user || !chat || !clientInfo) return null;

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-gray-900 px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">💬 Collaboration Chat</h1>

      <div className="max-w-3xl mx-auto bg-white p-5 rounded-lg shadow-md">
        <div className="space-y-4">
          {/* Messages */}
          <div className="space-y-2 mb-6 max-h-96 overflow-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user.uid ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg shadow-sm ${
                    message.senderId === user.uid ? "bg-green-500 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-gray-500">
                    {message.timestamp.toDate().toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-300"
              placeholder="Type your message"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white p-3 rounded-md"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/engineer/chats" className="text-blue-500">
          Back to Chats
        </Link>
      </div>
    </div>
  );
}
