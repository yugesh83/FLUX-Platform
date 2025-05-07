"use client";

import { useEffect, useRef, useState } from "react";
import { auth, db, storage } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const params = useParams();
  const rawChatId = params?.["chatId"];
  const chatIdStr = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId ?? null;

  // redirect if no chatId
  if (!chatIdStr) {
    if (typeof window !== "undefined") window.location.href = "/engineer/chats";
    return null;
  }

  // Scroll helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auth + chat metadata + real-time messages
  useEffect(() => {
    let unsubscribeMessages: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }
      setUser(currentUser);

      try {
        // Fetch chat info
        const chatRef = doc(db, "collabChats", chatIdStr);
        const chatDoc = await getDoc(chatRef);
        if (!chatDoc.exists()) {
          window.location.href = "/engineer/chats";
          return;
        }
        const cdata = chatDoc.data();
        setChat({
          id: chatDoc.id,
          clientId: cdata.clientId,
          projectId: cdata.projectId,
          participants: cdata.participants || [],
        });

        // Fetch client info
        const clientSnap = await getDoc(doc(db, "users", cdata.clientId));
        if (clientSnap.exists()) {
          setClientInfo({
            name: clientSnap.data().name,
            uid: cdata.clientId,
          });
        }

        // Real-time listener
        const msgsQuery = query(
          collection(db, "collabChats", chatIdStr, "messages"),
          orderBy("timestamp")
        );
        unsubscribeMessages = onSnapshot(
          msgsQuery,
          (snap) => {
            const fetched: Message[] = snap.docs
              .filter((d) => !d.metadata.hasPendingWrites)
              .map((d) => ({
                id: d.id,
                senderId: d.data().senderId,
                content: d.data().content,
                timestamp: d.data().timestamp,
                fileUrl: d.data().fileUrl,
                fileName: d.data().fileName,
              }));
            setMessages(fetched);
            setLoading(false);
          },
          (err) => {
            console.error("Snapshot error:", err);
            setError("Failed to load messages.");
            setLoading(false);
          }
        );        
      } catch (e: any) {
        console.error(e);
        setError("An error occurred.");
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [chatIdStr]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages, loading]);

  // Send text or file message
  const sendMessage = async () => {
    if (!newMessage.trim() && !file) return;
    setError(null);

    try {
      let fileUrl: string | undefined, fileName: string | undefined;
      if (file) {
        const storageRef = ref(storage, `chat-files/${chatIdStr}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
        fileName = file.name;
      }

      const msgData: Omit<Message, "id"> = {
        senderId: user.uid,
        content: newMessage.trim() || "(File)",
        timestamp: Timestamp.now(),
        ...(fileUrl && { fileUrl }),
        ...(fileName && { fileName }),
      };

      await addDoc(collection(db, "collabChats", chatIdStr, "messages"), msgData);
      await updateDoc(doc(db, "collabChats", chatIdStr), {
        lastMessage: msgData.content,
        participants: arrayUnion(user.uid),
      });

      setNewMessage("");
      setFile(null);
    } catch (e: any) {
      console.error(e);
      setError("Failed to send message.");
    }
  };

  // Delete own message
  const handleDeleteMessage = async (id: string) => {
    setError(null);
    try {
      await deleteDoc(doc(db, "collabChats", chatIdStr, "messages", id));
    } catch (e: any) {
      console.error(e);
      setError("Failed to delete message.");
    }
  };

  if (!user || !chat || !clientInfo) return null;

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-gray-900 px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">💬 Collaboration Chat</h1>

      {error && (
        <div className="max-w-3xl mx-auto mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white p-5 rounded-lg shadow-md">
        <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500">Loading messages…</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user.uid ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-xs p-3 rounded-lg shadow-sm ${
                    message.senderId === user.uid
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.fileUrl ? (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                    >
                      📄 {message.fileName || "View File"}
                    </a>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className="text-[10px] mt-1 text-gray-300">
                    {message.timestamp.toDate().toLocaleString()}
                  </p>
                  {message.senderId === user.uid && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="absolute top-1 right-1 text-xs text-white hover:text-red-400"
                    >
                      ✖
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 p-3 border border-gray-300 rounded"
            placeholder="Type your message"
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/engineer/chats" className="text-blue-500">
          ← Back to Chats
        </Link>
      </div>
    </div>
  );
}
