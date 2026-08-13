import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Clock,
  Send,
  Bot,
  Info,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSessionsQuery, useSessionMessagesQuery } from "@/hooks/queries/useConversationQueries";
import { useSendMessageMutation } from "@/hooks/mutations/useConversationMutations";
import { formatRelativeTime } from "@/lib/utils";

export default function ConversationsPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);

  const { data: sessions = [], isLoading, isError } = useSessionsQuery();
  const { data: messages = [], isLoading: isLoadingMessages } = useSessionMessagesQuery(selectedId || "");
  const sendMessageMutation = useSendMessageMutation();

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSession = sessions.find((s) => s.id === selectedId) || null;

  function handleSend() {
    const content = chatInput.trim();
    if (!content || !selectedId || sending) return;
    setSending(true);
    sendMessageMutation.mutate(
      { sessionId: selectedId, content },
      {
        onSuccess: () => {
          setChatInput("");
          setSending(false);
        },
        onError: () => setSending(false),
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Conversations</h1>
          <Badge variant="outline" className="text-xs">
            {sessions.length}
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
          </div>

          <ScrollArea className="flex-1">
            <div className="p-1">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-3" />
                  <p className="text-xs text-muted-foreground">Loading conversations...</p>
                </div>
              )}
              {isError && !isLoading && (
                <div className="py-12 text-center text-xs text-muted-foreground px-4">
                  Failed to load conversations. Please check your connection.
                </div>
              )}
              {!isLoading && !isError && filtered.length === 0 && (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No conversations found.
                </div>
              )}
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
                      {conv.title
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "S"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {conv.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className="text-[9px] py-0 h-4">
                        {conv.agentId.slice(0, 8)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      Chat session
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {formatRelativeTime(conv.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex flex-col">
          {selectedSession ? (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {selectedSession.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedSession.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      Agent: {selectedSession.agentId.slice(0, 8)}
                    </Badge>
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
                  {isLoadingMessages && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-3" />
                      <p className="text-xs text-muted-foreground">Loading messages...</p>
                    </div>
                  )}
                  {!isLoadingMessages && messages.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-12">
                      No messages in this conversation yet. Send the first message below.
                    </div>
                  )}
                  {messages.map((msg, i) => {
                    const isUser = msg.role === "USER";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-end gap-2 max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}
                        >
                          {!isUser && (
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Bot className="h-3.5 w-3.5 text-primary" />
                            </div>
                          )}
                          <div>
                            <div
                              className={`px-3 py-2 rounded-2xl text-sm ${
                                isUser
                                  ? "bg-primary text-primary-foreground rounded-br-sm"
                                  : "bg-muted rounded-bl-sm"
                              }`}
                            >
                              <p className="whitespace-pre-line">{msg.content}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 px-1">
                              {formatRelativeTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2 max-w-2xl mx-auto">
                  <Input
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    className="h-10 text-sm"
                  />
                  <Button
                    size="icon"
                    className="h-10 w-10 shrink-0 bg-gradient-primary text-white"
                    onClick={handleSend}
                    disabled={sending || !chatInput.trim()}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
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
