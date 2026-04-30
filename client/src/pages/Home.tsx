import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MapPin,
  FileText,
  Coins,
  Award,
  Sparkles,
  MessageCircle,
  Menu,
} from "lucide-react";
import { sampleUserMessages } from "@/data/manilaData";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import AppDrawer from "@/components/AppDrawer";

type ChatMessage = { role: "user" | "assistant"; content: string };

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Kumusta! Ako si NegosyoNav, ang iyong gabay sa pag-register ng negosyo. 🏪\n\nSabihin mo lang sa akin:\n• Anong klaseng negosyo ang gusto mong simulan?\n• Saan mo ito itatayo? (city/municipality)\n\nHalimbawa: \"Gusto ko mag-open ng sari-sari store sa Tondo, Manila\"",
};

const FOLLOWUP_SUGGESTIONS = [
  "Magkano gagastusin?",
  "Anong forms kailangan?",
  "May grant ba ako?",
];

export default function Home() {
  const [, navigate] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Default null = fresh chat. Picking a thread from drawer sets this.
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  // Optimistic local messages for the in-flight new chat (until server returns threadId).
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);
  const [pendingRoadmapReady, setPendingRoadmapReady] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const utils = trpc.useUtils();
  const threadQuery = trpc.ai.getThread.useQuery(
    activeThreadId ? { threadId: activeThreadId } : { threadId: "" },
    {
      enabled: !!activeThreadId,
      staleTime: 30_000,
    }
  );

  const chatMutation = trpc.ai.chat.useMutation({
    onMutate: (variables) => {
      if (activeThreadId) {
        const key = { threadId: activeThreadId };
        const prev = utils.ai.getThread.getData(key);
        utils.ai.getThread.setData(key, (curr) => {
          const prior = curr?.messages ?? [];
          return {
            threadId: activeThreadId,
            title: curr?.title ?? "Bagong chat",
            messages: [...prior, { role: "user", content: variables.content }],
            roadmapReady: curr?.roadmapReady ?? false,
          };
        });
        return { prev, optimisticThreadId: activeThreadId };
      } else {
        setPendingMessages((m) => [...m, { role: "user", content: variables.content }]);
        return { prev: null, optimisticThreadId: null };
      }
    },
    onSuccess: (data, _vars, ctx) => {
      if (ctx?.optimisticThreadId) {
        const key = { threadId: ctx.optimisticThreadId };
        utils.ai.getThread.setData(key, (curr) => {
          const prior = curr?.messages ?? [];
          return {
            threadId: ctx.optimisticThreadId!,
            title: data.title,
            messages: [...prior, { role: "assistant", content: data.content }],
            roadmapReady: data.roadmapReady,
          };
        });
      } else {
        // Was a fresh chat — server created the thread, now switch to it.
        setActiveThreadId(data.threadId);
        setPendingMessages([]);
        setPendingRoadmapReady(false);
        utils.ai.getThread.setData({ threadId: data.threadId }, {
          threadId: data.threadId,
          title: data.title,
          messages: [
            ...pendingMessages,
            { role: "assistant", content: data.content },
          ],
          roadmapReady: data.roadmapReady,
        });
      }
      utils.ai.listThreads.invalidate();
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.optimisticThreadId && ctx.prev) {
        utils.ai.getThread.setData({ threadId: ctx.optimisticThreadId }, ctx.prev);
      } else if (!ctx?.optimisticThreadId) {
        setPendingMessages((m) => m.slice(0, -1));
      }
      if (err.message === "LLM_UNAVAILABLE") {
        toast.error("Bumalik mamaya — busy ang AI 🙏");
      } else {
        toast.error("Pasensya na, may technical issue. Subukan mo ulit.");
      }
    },
  });

  const storedMessages = activeThreadId
    ? (threadQuery.data?.messages ?? [])
    : pendingMessages;
  const messages: ChatMessage[] =
    storedMessages.length === 0 ? [WELCOME_MESSAGE] : storedMessages;
  const isTyping = chatMutation.isPending;
  const roadmapReady = activeThreadId
    ? (threadQuery.data?.roadmapReady ?? false)
    : pendingRoadmapReady;
  const hasUserMessages = storedMessages.length > 0;

  const handleSelectThread = (threadId: string | null) => {
    setActiveThreadId(threadId);
    setPendingMessages([]);
    setPendingRoadmapReady(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 40), 120)}px`;
  }, [inputValue]);

  const handleSend = (text?: string) => {
    const msg = (text ?? inputValue).trim();
    if (!msg || isTyping) return;
    setInputValue("");
    chatMutation.mutate(
      activeThreadId ? { content: msg, threadId: activeThreadId } : { content: msg }
    );
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-cream">
      <AppDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="-ml-2 inline-flex items-center justify-center h-11 w-11 rounded-lg text-earth-brown hover:bg-mango-light active:bg-mango-light transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <img src="/LOGO.svg" alt="NegosyoNav" className="h-8 w-auto" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!hasUserMessages && !roadmapReady && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden"
        >
          <div className="relative">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663595373104/ZbKGxbkduWCL2xYHgfFPXg/hero-manila-street-jvEYVVKWcrpWYPWKF3uKev.webp"
              alt="Manila street scene with sari-sari stores and carinderia"
              className="w-full h-52 sm:h-64 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-warm-cream via-warm-cream/70 to-transparent" />
          </div>
          <div className="container relative -mt-24 pb-8">
            <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl text-earth-brown leading-tight">
              Kumusta! Simulan natin
              <br />
              <span className="text-teal">ang iyong Lakad Roadmap.</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Sabihin mo lang ang iyong negosyo sa Taglish — bibigyan kita ng
              step-by-step guide para sa Manila registration.
            </p>

            {/* Feature pills — horizontal, subtle */}
            <div className="flex flex-wrap gap-2 mt-5">
              {[
                { icon: FileText, label: "Auto-fill Forms" },
                { icon: Coins, label: "Cost Estimate" },
                { icon: MapPin, label: "Opisina Map" },
                { icon: Award, label: "Grant Check" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-white/80 border border-border/60 px-3 py-1.5 rounded-full"
                >
                  <Icon className="w-3 h-3 text-teal" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="container max-w-2xl lg:max-w-3xl py-4 space-y-6">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-teal text-white rounded-br-md"
                      : "bg-white text-foreground border border-border rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-teal"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* View Roadmap CTA */}
          {roadmapReady && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex justify-center pt-4"
            >
              <Button
                onClick={() => navigate("/roadmap")}
                className="font-[var(--font-display)] text-base px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-white"
                style={{ background: "linear-gradient(135deg, var(--color-brand-teal), var(--color-forest))" }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Tingnan ang Lakad Roadmap
              </Button>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Sticky Chat Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border z-40 lg:bottom-0 lg:left-64">
        <div className="container max-w-2xl lg:max-w-3xl py-3">
          {/* Quick suggestions — vertical stack on first visit, horizontal on follow-up */}
          {hasUserMessages ? (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {FOLLOWUP_SUGGESTIONS.map((msg) => (
                <button
                  key={msg}
                  onClick={() => handleSend(msg)}
                  disabled={isTyping}
                  className="shrink-0 inline-flex items-center text-xs font-medium text-primary bg-primary/8 border border-primary/20 px-3 py-1.5 rounded-full active:bg-primary/15 transition-colors disabled:opacity-50"
                >
                  {msg}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-1">
              {sampleUserMessages.map((msg) => (
                <button
                  key={msg}
                  onClick={() => handleSend(msg)}
                  disabled={isTyping}
                  className="w-full text-left inline-flex items-center text-sm font-medium text-earth-brown bg-white border border-border px-4 py-3 rounded-xl active:bg-muted transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  <span className="text-teal mr-2 text-base leading-none">›</span>
                  {msg}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="flex items-end gap-1.5">
            <div className="flex-1 relative">
              <MessageCircle className="absolute left-2.5 top-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <textarea
                ref={inputRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  if (e.nativeEvent.isComposing) return;
                  if (e.shiftKey) return;
                  e.preventDefault();
                  handleSend();
                }}
                placeholder={hasUserMessages ? "Mag-follow up..." : "Halimbawa: 'Sari-sari store sa Tondo, 5 years na'"}
                aria-label="Chat message input"
                enterKeyHint="send"
                className="block w-full pl-8 pr-3 py-3 h-12 min-h-12 max-h-[120px] rounded-xl bg-muted border border-transparent text-base focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all font-[var(--font-body)] resize-none overflow-y-auto leading-6"
              />
            </div>
            <Button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Ipadala"
              className="bg-primary hover:bg-primary/90 active:scale-95 text-white rounded-xl h-12 w-12 p-0 shrink-0 shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
