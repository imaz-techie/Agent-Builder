import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  Clock,
  Send,
  Bot,
  ChevronLeft,
  Info,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { conversations } from "@/lib/mock-data";
import { formatRelativeTime, getStatusColor } from "@/lib/utils";

type FilterTab = "all" | "active" | "resolved";

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  time: string;
}

const chatMessages: Record<string, ChatMessage[]> = {
  conv_001: [
    {
      id: "m1",
      sender: "user",
      text: "I need help with my recent order #4521, it hasn't arrived yet.",
      time: "2:30 PM",
    },
    {
      id: "m2",
      sender: "agent",
      text: "I'd be happy to help you with order #4521. Let me look that up for you right away.",
      time: "2:30 PM",
    },
    {
      id: "m3",
      sender: "agent",
      text: "I can see your order was shipped on July 18th via FedEx. The tracking shows it's currently in transit and expected to arrive by tomorrow, July 24th.",
      time: "2:31 PM",
    },
    {
      id: "m4",
      sender: "user",
      text: "Oh okay, that's reassuring. Can I get a tracking number?",
      time: "2:32 PM",
    },
    {
      id: "m5",
      sender: "agent",
      text: "Of course! Your tracking number is FX-789456123. You can track it at fedex.com. Is there anything else I can help you with?",
      time: "2:32 PM",
    },
    {
      id: "m6",
      sender: "user",
      text: "No that's great, thank you!",
      time: "2:33 PM",
    },
  ],
  conv_002: [
    {
      id: "m1",
      sender: "user",
      text: "I'm interested in the Enterprise plan. Can you walk me through pricing?",
      time: "2:12 PM",
    },
    {
      id: "m2",
      sender: "agent",
      text: "Great choice! The Enterprise plan starts at $2,499/month and includes unlimited agents, priority support, and advanced analytics.",
      time: "2:13 PM",
    },
    {
      id: "m3",
      sender: "user",
      text: "What about per-seat pricing?",
      time: "2:14 PM",
    },
    {
      id: "m4",
      sender: "agent",
      text: "Enterprise includes up to 50 team seats. Additional seats are $25/month each. Would you like me to prepare a custom quote?",
      time: "2:14 PM",
    },
  ],
  conv_004: [
    {
      id: "m1",
      sender: "user",
      text: "My subscription was charged twice this month, can you help?",
      time: "1:42 PM",
    },
    {
      id: "m2",
      sender: "agent",
      text: "I'm sorry to hear about the duplicate charge. Let me investigate this immediately.",
      time: "1:43 PM",
    },
    {
      id: "m3",
      sender: "agent",
      text: "I can confirm there were two charges on July 15th. I've initiated a refund for the duplicate charge. You should see it within 3-5 business days.",
      time: "1:44 PM",
    },
  ],
  conv_007: [
    {
      id: "m1",
      sender: "user",
      text: "Write a LinkedIn post about our new AI product launch.",
      time: "12:28 PM",
    },
    {
      id: "m2",
      sender: "agent",
      text: "Here's a draft for your LinkedIn post:\n\n?? Excited to announce the launch of AgentMax AI - the next generation of intelligent automation. Build, deploy, and scale AI agents in minutes, not months.\n\nKey features:\n- No-code agent builder\n- Enterprise-grade security\n- Multi-model support\n- Real-time analytics\n\nReady to transform your workflow? Link in comments!",
      time: "12:29 PM",
    },
  ],
};

const defaultMessages: ChatMessage[] = [
  {
    id: "m1",
    sender: "user",
    text: "Hello, I need some assistance.",
    time: "1:00 PM",
  },
  {
    id: "m2",
    sender: "agent",
    text: "Hi there! I'd be happy to help. What can I assist you with today?",
    time: "1:00 PM",
  },
];

const statusFilterColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  resolved: "bg-info/10 text-info",
};

import { conversations as mockConversations } from "@/lib/mock-data";
import { useConversationsQuery } from "@/hooks/queries/useConversationQueries";
import { useSendMessageMutation } from "@/hooks/mutations/useConversationMutations";

export default function ConversationsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const { data: convList = mockConversations } = useConversationsQuery();
  const sendMessageMutation = useSendMessageMutation();

  const [selectedId, setSelectedId] = useState<string | null>(
    convList[0]?.id ?? null
  );
  const [chatInput, setChatInput] = useState("");

  const filtered = convList.filter(
    (c) =>
      (filter === "all" || c.status === filter) &&
      (c.userName.toLowerCase().includes(search.toLowerCase()) ||
        c.agentName.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedConv = convList.find((c) => c.id === selectedId);
  const messages = selectedId
    ? (chatMessages[selectedId] ?? defaultMessages)
    : defaultMessages;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Conversations</h1>
          <Badge variant="outline" className="text-xs">
            {conversations.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-0 rounded-xl border border-border overflow-hidden bg-card min-h-[600px]">
        <div className="border-r border-border flex flex-col">
          <div className="p-3 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              {(["all", "active", "resolved"] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filter === tab
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-1">
              {filtered.map((conv, i) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                    selectedId === conv.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {conv.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {conv.userName}
                      </span>
                      {conv.status !== "resolved" && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className="text-[9px] py-0 h-4">
                        {conv.agentName}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {conv.messagePreview}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {formatRelativeTime(conv.timestamp)}
                      </span>
                      {conv.rating && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                          {conv.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex flex-col">
          {selectedConv ? (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {selectedConv.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{selectedConv.userName}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {selectedConv.agentName}
                    </Badge>
                    <div
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${statusFilterColors[selectedConv.status]}`}
                    >
                      {selectedConv.status}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="text-center">
                    <span className="text-[10px] text-muted-foreground bg-background px-2">
                      {formatRelativeTime(selectedConv.timestamp)}
                    </span>
                  </div>

                  {messages.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                      >
                        {msg.sender === "agent" && (
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                        <div>
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm ${
                              msg.sender === "user"
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted rounded-bl-sm"
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.text}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 px-1">
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2 max-w-2xl mx-auto">
                  <Input
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="h-10 text-sm"
                  />
                  <Button
                    size="icon"
                    className="h-10 w-10 shrink-0 bg-gradient-primary text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
