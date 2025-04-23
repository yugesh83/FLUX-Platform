"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@/firebase/config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
} from "firebase/firestore";

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
};

export default function ChatPage() {
  const { chatId } = useParams() as { chatId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1) Listen to real-time updates in messages subcollection
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    // Scroll to bottom on new messages
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const user = auth.currentUser;
    if (!user || !newMessage.trim()) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    await addDoc(messagesRef, {
      senderId: user.uid,
      text: newMessage.trim(),
      createdAt: Timestamp.now(),
    });
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-[#f9fdf9]">
      <header className="p-4 bg-white shadow">
        <h1 className="text-xl font-semibold">Chat</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = auth.currentUser?.uid === msg.senderId;
          return (
            <div
              key={msg.id}
              className={`max-w-[70%] p-3 rounded-lg ${
                isMe ? "bg-green-100 self-end" : "bg-white self-start"
              }`}
            >
              <p className="text-gray-800">{msg.text}</p>
              <span className="text-xs text-gray-500 mt-1 block">
                {msg.createdAt.toDate().toLocaleTimeString()}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white flex items-center space-x-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg p-2"
          placeholder="Type a message…"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
