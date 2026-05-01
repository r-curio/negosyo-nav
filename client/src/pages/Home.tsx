import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Menu,
  ShoppingBag,
  UtensilsCrossed,
  Package,
  Shirt,
  FileText,
  Clock,
  Gift,
  MapPin,
} from "lucide-react";
import { sampleUserMessages } from "@/data/manilaData";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import AppDrawer from "@/components/AppDrawer";

type ChatMessage = { role: "user" | "assistant"; content: string };

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Kumusta! 👋 Ako si Nav — tutulungan kitang i-register ang iyong negosyo, from requirements hanggang permits.\n\nAnong business ang balak mong simulan? Sabihin mo lang, at gagawan kita ng step-by-step guide."
};

const FOLLOWUP_SUGGESTIONS = [
  "Magkano gagastusin?",
  "Anong forms kailangan?",
  "May grant ba ako?",
];

const STARTER_CHIPS = [
  {
    text: "Gusto kong magtayo ng carinderia sa Sampaloc. Ano yung mga kailangan na permits at magkano aabutin?",
    icon: UtensilsCrossed,
    label: "Carinderia sa Sampaloc",
    cls: "bg-orange-50 border-orange-200 text-orange-700",
    iconCls: "text-orange-500",
  },
  {
    text: "Plano kong magbukas ng sari-sari store sa Tondo. Paano ako magsisimula at ano ang first step sa registration?",
    icon: ShoppingBag,
    label: "Sari-sari store sa Tondo",
    cls: "bg-teal-light border-teal/20 text-teal",
    iconCls: "text-teal",
  },
  {
    text: "Mag-o-online selling ako from Ermita. Kailangan ko pa ba ng permit at paano yung process?",
    icon: Package,
    label: "Online selling sa Ermita",
    cls: "bg-forest-light border-forest/20 text-forest",
    iconCls: "text-forest",
  },
  {
    text: "Balak kong mag-ukay-ukay sa Quiapo. Ano yung requirements at saan ako kukuha ng permit?",
    icon: Shirt,
    label: "Ukay-ukay sa Quiapo",
    cls: "bg-mango-light border-mango/20 text-mango",
    iconCls: "text-mango",
  },
] as const;

// Shared gradient string used in multiple places so they always match
const BRAND_GRADIENT = "linear-gradient(140deg, var(--color-brand-teal) 0%, var(--color-forest) 60%, oklch(0.22 0.08 255) 100%)";

function NavAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const dim = size === "md" ? "w-9 h-9" : "w-7 h-7";
  const iconDim = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center shrink-0`}
      style={{ background: BRAND_GRADIENT }}
      aria-hidden="true"
    >
      <Sparkles className={`${iconDim} text-amber-300`} style={{ fill: "currentColor" }} />
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);
  const [pendingRoadmapReady, setPendingRoadmapReady] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const utils = trpc.useUtils();
  const threadQuery = trpc.ai.getThread.useQuery(
    activeThreadId ? { threadId: activeThreadId } : { threadId: "" },
    { enabled: !!activeThreadId, staleTime: 30_000 }
  );

  const chatMutation = trpc.ai.chat.useMutation({
    onMutate: (variables) => {
      if (activeThreadId) {
        const key = { threadId: activeThreadId };
        const prev = utils.ai.getThread.getData(key);
        utils.ai.getThread.setData(key, (curr) => ({
          threadId: activeThreadId,
          title: curr?.title ?? "Bagong chat",
          messages: [...(curr?.messages ?? []), { role: "user", content: variables.content }],
          roadmapReady: curr?.roadmapReady ?? false,
        }));
        return { prev, optimisticThreadId: activeThreadId };
      } else {
        setPendingMessages((m) => [...m, { role: "user", content: variables.content }]);
        return { prev: null, optimisticThreadId: null };
      }
    },
    onSuccess: (data, _vars, ctx) => {
      if (ctx?.optimisticThreadId) {
        const key = { threadId: ctx.optimisticThreadId };
        utils.ai.getThread.setData(key, (curr) => ({
          threadId: ctx.optimisticThreadId!,
          title: data.title,
          messages: [...(curr?.messages ?? []), { role: "assistant", content: data.content }],
          roadmapReady: data.roadmapReady,
        }));
      } else {
        setActiveThreadId(data.threadId);
        setPendingMessages([]);
        setPendingRoadmapReady(false);
        utils.ai.getThread.setData({ threadId: data.threadId }, {
          threadId: data.threadId,
          title: data.title,
          messages: [...pendingMessages, { role: "assistant", content: data.content }],
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
      toast.error(
        err.message === "LLM_UNAVAILABLE"
          ? "Bumalik mamaya — busy ang AI 🙏"
          : "Pasensya na, may technical issue. Subukan mo ulit."
      );
    },
  });

  const storedMessages = activeThreadId ? (threadQuery.data?.messages ?? []) : pendingMessages;
  const messages: ChatMessage[] = storedMessages.length === 0 ? [WELCOME_MESSAGE] : storedMessages;
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
    /*
     * Page background: a gentle two-stop gradient that starts at the same
     * light-teal tint the hero section fades into — so there is no seam
     * between the hero block and the body.
     */
    <div
      className="min-h-screen flex flex-col"
    >
      <AppDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
      />

      {/*
       * Header — transparent over the gradient so it doesn't break the flow.
       * Uses backdrop-blur so it still feels anchored when scrolling in chat.
       */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50">
        <div className="container flex items-center justify-between h-14">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="-ml-2 inline-flex items-center justify-center h-11 w-11 rounded-lg
                       text-foreground hover:bg-muted active:bg-muted/80 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src="/LOGO.svg" alt="NegosyoNav" className="h-8 w-auto" />
        </div>
      </header>

      {/* ── Main scrollable chat area ── */}
      <div className="flex-1 overflow-y-auto pb-32">

        {/*
         * Brand hero — dark gradient block, only visible on a fresh chat.
         * Fades to oklch(0.91 0.05 210) at bottom — exactly the page bg start
         * color — so there is zero visible seam.
         */}
        <AnimatePresence>
          {!hasUserMessages && !roadmapReady && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4 }}
              className="container max-w-2xl lg:max-w-3xl pt-5 px-4"
            >
              <div
                className="rounded-3xl overflow-hidden pt-12 pb-12 px-6 py-6 "
                style={{ background: BRAND_GRADIENT }}
              >
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="text-white/50 text-[11px] font-medium uppercase tracking-widest mb-4 font-[var(--font-mono)]"
                >
                  🇵🇭 Manila City · Business Registration
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.45 }}
                  className="font-[var(--font-display)] text-5xl font-bold text-white leading-none mb-2 tracking-tight"
                >
                  Negosyo<span className="text-white/65">Nav</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-white/70 text-sm leading-relaxed mb-6 max-w-[260px]"
                >
                  I-describe ang iyong negosyo, bibigyan ka ng personalized na lakad para sa registration.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38, duration: 0.4 }}
                  className="flex flex-wrap gap-2"
                >
                  {[
                    { icon: FileText, label: "Auto-fill Forms", action: () => navigate("/forms") },
                    { icon: Clock, label: "Task Planner", action: () => navigate("/planner") },
                    { icon: Gift, label: "Grant Matching", action: () => navigate("/grants") },
                    { icon: MapPin, label: "Opisina Map", action: () => navigate("/places") },
                  ].map(({ icon: Icon, label, action }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={action}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90
                                 bg-white/15 border border-white/20 px-3 py-1.5 rounded-full
                                 hover:bg-white/25 active:bg-white/30 active:scale-95
                                 transition-all"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Chat messages ── */}
        <div className="container max-w-2xl lg:max-w-3xl pt-5 pb-4 space-y-5">
          <AnimatePresence>
            {messages.map((msg, i) => {
              const isWelcome = !hasUserMessages && i === 0 && msg.role === "assistant";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: isWelcome ? 0.5 : 0 }}
                  className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && <NavAvatar size="sm" />}
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isWelcome
                        ? "text-white shadow-lg rounded-bl-md"
                        : msg.role === "user"
                          ? "bg-primary text-white rounded-br-md shadow-sm"
                          : "bg-white text-foreground border border-border/60 rounded-bl-md shadow-sm"
                    }`}
                    style={isWelcome ? { background: BRAND_GRADIENT } : undefined}
                  >
                    {msg.role === "assistant"
                      ? <Streamdown>{msg.content}</Streamdown>
                      : msg.content
                    }
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2 justify-start"
            >
              <NavAvatar size="sm" />
              <div className="bg-white border border-border/60 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((j) => (
                    <motion.div
                      key={j}
                      className="w-2 h-2 rounded-full"
                      style={{ background: BRAND_GRADIENT }}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: j * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/*
           * Starter chips — live in the scroll area (not the fixed input bar)
           * so they never cover the welcome message.
           */}
          <AnimatePresence>
            {!hasUserMessages && (
              <motion.div
                key="starter-chips"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ delay: 0.65, duration: 0.35 }}
                className="grid grid-cols-2 gap-2 pt-1"
              >
                {STARTER_CHIPS.map((chip, idx) => (
                  <motion.button
                    key={chip.text}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + idx * 0.06, duration: 0.3 }}
                    onClick={() => handleSend(chip.text)}
                    disabled={isTyping}
                    className="flex items-center justify-center bg-white rounded-xl px-3 py-3 text-left
                               text-foreground text-xs font-medium leading-tight min-h-[52px]
                               shadow-sm hover:shadow-md active:scale-[0.97] active:shadow-sm
                               transition-all disabled:opacity-50"
                  >
                    <span>{chip.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Roadmap CTA */}
          {roadmapReady && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex justify-center pt-2"
            >
              <Button
                onClick={() => navigate("/roadmap")}
                className="font-[var(--font-display)] text-base px-8 py-6 rounded-2xl shadow-lg text-white"
                style={{ background: BRAND_GRADIENT }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Tingnan ang Lakad Roadmap
              </Button>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ── Fixed input bar ── */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border/60 z-40 lg:bottom-0 lg:left-64">
        <div className="container max-w-2xl lg:max-w-3xl py-3">

          {/* Follow-up chips — only visible after first message */}
          {hasUserMessages && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
              {FOLLOWUP_SUGGESTIONS.map((msg) => (
                <button
                  key={msg}
                  onClick={() => handleSend(msg)}
                  disabled={isTyping}
                  className="shrink-0 inline-flex items-center text-xs font-medium text-primary
                             bg-primary/8 border border-primary/20 px-3 py-1.5 rounded-full
                             active:bg-primary/15 transition-colors disabled:opacity-50"
                >
                  {msg}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" || e.nativeEvent.isComposing || e.shiftKey) return;
                  e.preventDefault();
                  handleSend();
                }}
                placeholder={
                  hasUserMessages
                    ? "Mag-follow up..."
                    : "Anong negosyo mo?"
                }
                aria-label="Chat message input"
                enterKeyHint="send"
                className="block w-full px-4 py-3 h-12 min-h-12 max-h-[120px] rounded-xl bg-muted
                           border border-transparent text-base focus:outline-none
                           focus:border-primary/30 focus:ring-2 focus:ring-primary/15
                           transition-all font-[var(--font-body)] resize-none overflow-y-auto leading-6"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Ipadala"
              className="h-12 w-12 rounded-xl shrink-0 shadow-md transition-all
                         active:scale-95 disabled:opacity-40 flex items-center justify-center text-white"
              style={{ background: BRAND_GRADIENT }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
