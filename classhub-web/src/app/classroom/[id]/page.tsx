"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Video, Mic, MicOff, VideoOff, MessageCircle, X, Send,
  Monitor, Users, Hand, Maximize2, Minimize2, BookOpen, Zap
} from "lucide-react";

type Message = {
  id: string;
  author: string;
  text: string;
  time: string;
  type: "chat" | "instruction" | "system";
};

type Participant = {
  id: string;
  name: string;
  role: "tutor" | "student";
  hand: boolean;
  avatar: string;
};

// Simulated participants
const PARTICIPANTS: Participant[] = [
  { id: "t1", name: "Vidya Academy", role: "tutor", hand: false, avatar: "VA" },
  { id: "s1", name: "Arjun Sharma", role: "student", hand: false, avatar: "AS" },
  { id: "s2", name: "Priya Nair", role: "student", hand: true, avatar: "PN" },
  { id: "s3", name: "Rohan Mehta", role: "student", hand: false, avatar: "RM" },
  { id: "s4", name: "Sneha Pillai", role: "student", hand: false, avatar: "SP" },
  { id: "s5", name: "Aditya Kumar", role: "student", hand: false, avatar: "AK" },
];

const INITIAL_MESSAGES: Message[] = [
  { id: "1", author: "System", text: "Class session started. Welcome everyone!", time: "10:00", type: "system" },
  { id: "2", author: "Vidya Academy", text: "Good morning class! Today we will cover Chapter 5 — Quadratic Equations.", time: "10:01", type: "instruction" },
  { id: "3", author: "Arjun Sharma", text: "Good morning sir!", time: "10:01", type: "chat" },
  { id: "4", author: "Priya Nair", text: "Ready to learn 🎓", time: "10:02", type: "chat" },
];

function AnimatedSeat({ participant, isTutor }: { participant: Participant; isTutor: boolean }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isTutor) {
      const interval = setInterval(() => setPulse(p => !p), 2000);
      return () => clearInterval(interval);
    }
  }, [isTutor]);

  return (
    <div className={`relative group flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 ${
      isTutor
        ? "border-primary/60 bg-primary/10 col-span-2"
        : "border-border bg-card/50 hover:border-blue-500/40 hover:bg-blue-500/5"
    }`}>
      {/* Avatar */}
      <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
        isTutor ? "bg-gradient-to-br from-primary to-primary/70 w-20 h-20 text-base" : "bg-gradient-to-br from-blue-400 to-blue-600"
      }`}>
        {participant.avatar}
        {/* Speaking animation */}
        {isTutor && pulse && (
          <div className="absolute inset-0 rounded-full border-4 border-primary/40 animate-ping" />
        )}
        {/* Hand raised */}
        {participant.hand && (
          <div className="absolute -top-2 -right-2 text-base animate-bounce">✋</div>
        )}
      </div>
      {/* Video placeholder / screen */}
      <div className={`w-full aspect-video bg-gradient-to-br rounded-xl overflow-hidden flex items-center justify-center ${
        isTutor ? "from-primary/20 to-primary/5 border border-primary/30" : "from-blue-500/10 to-blue-500/5"
      }`}>
        {isTutor ? (
          <div className="text-center">
            <Monitor className="w-6 h-6 text-primary mx-auto mb-1 animate-pulse" />
            <p className="text-xs text-primary font-medium">LIVE</p>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
            {participant.avatar}
          </div>
        )}
      </div>
      <p className={`text-xs font-medium truncate w-full text-center ${isTutor ? "text-primary" : "text-foreground"}`}>
        {participant.name}
      </p>
      {isTutor && <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Tutor</Badge>}
    </div>
  );
}

export default function VirtualClassroomPage() {
  const params = useParams();
  const classId = params.id as string;

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [vidOn, setVidOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [showInstruction, setShowInstruction] = useState(false);
  const [participants, setParticipants] = useState(PARTICIPANTS);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setIsConnected(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate SSE — periodic "messages" from stream
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(t => t + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      author: "You",
      text: input.trim(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      type: "chat",
    }]);
    setInput("");
    // Also POST to API
    fetch(`/api/classroom/${classId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input.trim(), type: "chat" }),
    }).catch(() => {});
  };

  const broadcastInstruction = () => {
    if (!instruction.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      author: "You (Tutor)",
      text: instruction.trim(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      type: "instruction",
    };
    setMessages(prev => [...prev, msg]);
    setShowInstruction(false);
    setInstruction("");
    fetch(`/api/classroom/${classId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: instruction.trim(), type: "instruction" }),
    }).catch(() => {});
  };

  const toggleHand = () => {
    setHandRaised(h => !h);
    setParticipants(prev => prev.map(p => p.id === "s1" ? { ...p, hand: !handRaised } : p));
  };

  const tutor = participants.find(p => p.role === "tutor")!;
  const students = participants.filter(p => p.role === "student");

  return (
    <div className={`flex flex-col bg-[#0a0a0f] text-white ${fullscreen ? "fixed inset-0 z-50" : "min-h-[calc(100vh-8rem)]"}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-yellow-400"}`} />
            <span className="text-sm font-medium">{isConnected ? "Live Session" : "Connecting..."}</span>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
            <Video className="w-3 h-3 mr-1" /> Virtual Classroom
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> {participants.length} in class
          </span>
          <button onClick={() => setFullscreen(f => !f)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Classroom Area */}
        <div className="flex-1 p-5 overflow-y-auto">
          {/* Grid Layout — Tutor top, students below */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Tutor takes full row on top */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <AnimatedSeat participant={tutor} isTutor />
            </div>
            {/* Student seats */}
            {students.map((student) => (
              <AnimatedSeat key={student.id} participant={student} isTutor={false} />
            ))}
          </div>

          {/* Instruction Banner */}
          {messages.filter(m => m.type === "instruction").slice(-1).map((msg) => (
            <div key={msg.id} className="mt-4 p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-primary mb-1">TUTOR INSTRUCTION</p>
                <p className="text-sm text-white/90">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Tutor: Broadcast instruction button */}
          <div className="mt-4">
            {showInstruction ? (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Type an instruction for all students..."
                  rows={2}
                  className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-primary/60"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/80 gap-2" onClick={broadcastInstruction}>
                    <Send className="w-3.5 h-3.5" /> Broadcast
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-xl text-white/60 hover:text-white" onClick={() => setShowInstruction(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowInstruction(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-sm text-white/40 hover:text-white/70 hover:border-primary/40 transition-all flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Broadcast Instruction to Class
              </button>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {chatOpen && (
          <div className="w-80 flex flex-col border-l border-white/10 bg-black/30">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium">Class Chat</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`${msg.type === "system" ? "text-center" : ""}`}>
                  {msg.type === "system" ? (
                    <span className="text-xs text-white/30">{msg.text}</span>
                  ) : msg.type === "instruction" ? (
                    <div className="p-3 rounded-xl bg-primary/15 border border-primary/25">
                      <p className="text-[10px] font-bold text-primary mb-1">📢 {msg.author}</p>
                      <p className="text-xs text-white/90">{msg.text}</p>
                    </div>
                  ) : (
                    <div className={`${msg.author === "You" ? "items-end" : "items-start"} flex flex-col`}>
                      <p className="text-[10px] text-white/40 mb-0.5 px-1">{msg.author} · {msg.time}</p>
                      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs ${
                        msg.author === "You" ? "bg-blue-500 text-white rounded-br-sm" : "bg-white/10 text-white/90 rounded-bl-sm"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Message everyone..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/60"
                />
                <button onClick={sendMessage} className="p-2 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <button onClick={() => setMicOn(m => !m)}
            className={`p-3 rounded-xl transition-all ${micOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-600"}`}>
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button onClick={() => setVidOn(v => !v)}
            className={`p-3 rounded-xl transition-all ${vidOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-600"}`}>
            {vidOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button onClick={toggleHand}
            className={`p-3 rounded-xl transition-all ${handRaised ? "bg-amber-500/80" : "bg-white/10 hover:bg-white/20"}`}>
            <Hand className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!chatOpen && (
            <button onClick={() => setChatOpen(true)} className="p-3 rounded-xl bg-blue-500/80 hover:bg-blue-600 transition-all">
              <MessageCircle className="w-5 h-5" />
            </button>
          )}
          <Button className="rounded-xl bg-red-500 hover:bg-red-600 text-white px-5 gap-2"
            onClick={() => window.history.back()}>
            Leave Class
          </Button>
        </div>
      </div>
    </div>
  );
}
