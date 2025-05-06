"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db, storage } from "@/firebase/config";
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
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useParams } from "next/navigation";
import Link from "next/link";

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: Timestamp;
  fileUrl?: string;
  fileName?: string;
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
  const [file, setFile] = useState<File | null>(null);
  const [clientInfo, setClientInfo] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const params = useParams();
  const rawChatId = params?.["chatId"];
  const chatIdStr = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId ?? null;

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

      const messagesQuery = query(
        collection(db, "collabChats", chatIdStr, "messages"),
        orderBy("timestamp"),
        limit(100)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const fetchedMessages = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        senderId: doc.data().senderId,
        content: doc.data().content,
        timestamp: doc.data().timestamp,
        fileUrl: doc.data().fileUrl,
        fileName: doc.data().fileName,
      }));
      setMessages(fetchedMessages);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() && !file) return;

    let fileUrl = "";
    let fileName = "";

    if (file) {
      const fileRef = ref(storage, `chat-files/${chatIdStr}/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      fileUrl = await getDownloadURL(fileRef);
      fileName = file.name;
    }

    const messageData: Omit<Message, "id"> = {
      senderId: user.uid,
      content: newMessage.trim() || (file ? "(File)" : ""),
      timestamp: Timestamp.now(),
      ...(fileUrl && { fileUrl }),
      ...(fileName && { fileName }),
    };

    const messageRef = await addDoc(collection(db, "collabChats", chatIdStr, "messages"), messageData);

    await updateDoc(doc(db, "collabChats", chatIdStr), {
      lastMessage: messageData.content,
      participants: arrayUnion(user.uid),
    });

    setMessages((prev) => [...prev, { id: messageRef.id, ...messageData } as Message]);
    setNewMessage("");
    setFile(null);
  };

  const handleDeleteMessage = async (id: string) => {
    await deleteDoc(doc(db, "collabChats", chatIdStr, "messages", id));
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  if (!user || !chat || !clientInfo) return null;

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-gray-900 px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">💬 Collaboration Chat</h1>

      <div className="max-w-3xl mx-auto bg-white p-5 rounded-lg shadow-md">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user.uid ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-xs p-3 rounded-lg shadow-sm ${
                  message.senderId === user.uid ? "bg-green-500 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.fileUrl && (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-300 underline mt-1 inline-block"
                  >
                    📄 {message.fileName || "View File"}
                  </a>
                )}
                <p className="text-[10px] mt-1 text-gray-300">
                  {message.timestamp.toDate().toLocaleString()}
                </p>
                {message.senderId === user.uid && (
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="absolute top-1 right-2 text-xs text-red-300 hover:text-red-500"
                  >
                    ❌
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message + File input */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full p-3 rounded-md border border-gray-300"
            placeholder="Type your message"
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border border-gray-300 rounded-md p-2 text-sm"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white p-3 rounded-md"
          >
            Send
          </button>
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
