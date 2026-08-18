"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, Search, UserPlus, GraduationCap, BookOpen,
  Check, Clock, Sparkles, MessageCircle
} from "lucide-react";

type Friend = {
  id: string;
  name: string;
  tutor: string;
  subject: string;
  status: "classmate" | "friend" | "pending";
  avatar: string;
};

const MOCK_FRIENDS: Friend[] = [
  { id: "1", name: "Arjun Sharma", tutor: "Vidya Academy", subject: "Mathematics", status: "classmate", avatar: "AS" },
  { id: "2", name: "Priya Nair", tutor: "Kiran Tutors", subject: "Physics", status: "friend", avatar: "PN" },
  { id: "3", name: "Rohan Mehta", tutor: "StudyPoint", subject: "Chemistry", status: "classmate", avatar: "RM" },
  { id: "4", name: "Sneha Pillai", tutor: "Vidya Academy", subject: "Biology", status: "pending", avatar: "SP" },
  { id: "5", name: "Aditya Kumar", tutor: "ExcelTutor", subject: "English", status: "classmate", avatar: "AK" },
  { id: "6", name: "Divya Menon", tutor: "BrightMinds", subject: "Mathematics", status: "friend", avatar: "DM" },
];

const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-500/10 text-blue-500",
  Physics: "bg-purple-500/10 text-purple-500",
  Chemistry: "bg-emerald-500/10 text-emerald-500",
  Biology: "bg-green-500/10 text-green-500",
  English: "bg-amber-500/10 text-amber-500",
};

export default function FriendsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "classmates" | "friends">("all");
  const [friends, setFriends] = useState(MOCK_FRIENDS);
  const [floating, setFloating] = useState<{x:number;y:number;id:string}[]>([]);

  const handleAdd = (id: string) => {
    setFriends((prev) => prev.map((f) => f.id === id ? { ...f, status: "pending" as const } : f));
  };

  const filtered = friends.filter((f) => {
    const matchQ = f.name.toLowerCase().includes(query.toLowerCase()) || f.tutor.toLowerCase().includes(query.toLowerCase());
    const matchF = filter === "all" || (filter === "classmates" && f.status === "classmate") || (filter === "friends" && f.status === "friend");
    return matchQ && matchF;
  });

  return (
    <div className="pb-24">
      {/* Header */}
      <section className="relative w-full bg-blue-500/10 border-b border-blue-500/20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-bounce"
              style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${2 + i * 0.3}s` }} />
          ))}
        </div>
        <div className="container max-w-6xl mx-auto px-4 py-12 relative z-10">
          <Badge variant="outline" className="bg-background text-blue-500 border-blue-500/30 mb-4 gap-1.5">
            <Users className="w-3.5 h-3.5" /> Friend Explorer
          </Badge>
          <h1 className="text-3xl font-bold font-heading mb-2">Find Your <span className="text-blue-500">Study Buddies</span></h1>
          <p className="text-muted-foreground">Discover friends studying with different tutors across the city.</p>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or tutor..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "classmates", "friends"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? "bg-blue-500 text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Classmates", count: friends.filter(f => f.status === "classmate").length, icon: <GraduationCap className="w-4 h-4" />, color: "blue" },
            { label: "Friends", count: friends.filter(f => f.status === "friend").length, icon: <Sparkles className="w-4 h-4" />, color: "emerald" },
            { label: "Pending", count: friends.filter(f => f.status === "pending").length, icon: <Clock className="w-4 h-4" />, color: "amber" },
          ].map((s) => (
            <Card key={s.label} className="bg-card border-border rounded-2xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${s.color}-500/10 text-${s.color}-500`}>{s.icon}</div>
                <div>
                  <p className="text-xl font-bold font-heading">{s.count}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Friends Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((friend, i) => (
            <div key={friend.id} className="group"
              style={{ animationDelay: `${i * 80}ms` }}>
              <Card className="bg-card border-border rounded-2xl hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {friend.avatar}
                      </div>
                      {friend.status === "friend" && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{friend.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <BookOpen className="w-3 h-3" /> {friend.tutor}
                      </p>
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${subjectColors[friend.subject] || "bg-muted text-muted-foreground"}`}>
                        {friend.subject}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {friend.status === "friend" ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs gap-1.5 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30">
                          <MessageCircle className="w-3.5 h-3.5" /> Message
                        </Button>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 px-3">Friends ✓</Badge>
                      </>
                    ) : friend.status === "pending" ? (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 w-full justify-center py-2">Request Sent</Badge>
                    ) : (
                      <Button size="sm" className="flex-1 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs gap-1.5"
                        onClick={() => handleAdd(friend.id)}>
                        <UserPlus className="w-3.5 h-3.5" /> Add Friend
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">No friends found</h3>
            <p className="text-muted-foreground text-sm">Try a different search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
