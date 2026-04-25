/*
 * Negosyante Hub — Community Board
 * UI Refresh: better post cards, improved vote section, cleaner modal.
 * All logic, state, and functions preserved.
 */
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Streamdown } from "streamdown";
import {
  ArrowLeft,
  Users,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  MessageSquarePlus,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  Star,
  X,
  Send,
  Shield,
} from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "Lahat", icon: Users },
  { value: "tip", label: "Tips", icon: Lightbulb },
  { value: "warning", label: "Babala", icon: AlertTriangle },
  { value: "question", label: "Tanong", icon: HelpCircle },
  { value: "experience", label: "Kwento", icon: Star },
] as const;

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  tip:        { bg: "bg-secondary", text: "text-primary", border: "border-primary/20" },
  warning:    { bg: "bg-destructive/10",  text: "text-destructive", border: "border-destructive/20" },
  question:   { bg: "bg-primary/10",      text: "text-primary",     border: "border-primary/20" },
  experience: { bg: "bg-mango-light",     text: "text-foreground",  border: "border-mango/20" },
};

const CATEGORY_ICONS: Record<string, typeof Lightbulb> = {
  tip: Lightbulb,
  warning: AlertTriangle,
  question: HelpCircle,
  experience: Star,
};

const CATEGORY_ACCENT: Record<string, string> = {
  tip: "bg-primary",
  warning: "bg-destructive",
  question: "bg-primary",
  experience: "bg-mango",
};


export default function Hub() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"tip" | "warning" | "question" | "experience">("tip");
  const [newStepNumber, setNewStepNumber] = useState<number | "">("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("compose") === "1") {
      setShowCreateForm(true);
      const s = Number(params.get("step"));
      if (Number.isInteger(s) && s >= 1 && s <= 20) setNewStepNumber(s);
    }
  }, []);

  const { data: dbPosts, refetch } = trpc.community.list.useQuery({ lguTag: "manila_city" });
  const createPost = trpc.community.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreateForm(false);
      setNewTitle("");
      setNewContent("");
      setNewStepNumber("");
    },
  });
  const { data: myVotesData, refetch: refetchMyVotes } = trpc.community.myVotes.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const voteMutation = trpc.community.vote.useMutation({
    onSuccess: () => {
      refetch();
      refetchMyVotes();
    },
  });
  const myVoteByPost = useMemo(() => {
    const m = new Map<string, "up" | "down">();
    for (const v of myVotesData ?? []) m.set(v.postId, v.voteType);
    return m;
  }, [myVotesData]);

  const allPosts = useMemo(() => dbPosts ?? [], [dbPosts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "all") return allPosts;
    return allPosts.filter((p) => p.category === selectedCategory);
  }, [allPosts, selectedCategory]);

  const handleVote = (postId: string, voteType: "up" | "down") => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    voteMutation.mutate({ postId, voteType });
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    if (!newTitle.trim() || !newContent.trim()) return;
    createPost.mutate({ title: newTitle, content: newContent, category: newCategory, lguTag: "manila_city", stepNumber: typeof newStepNumber === "number" ? newStepNumber : undefined });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Ngayon";
    if (days === 1) return "Kahapon";
    if (days < 7) return `${days} araw na ang nakakaraan`;
    return d.toLocaleDateString("fil-PH", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Bumalik"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="font-bold text-base text-foreground leading-tight font-[var(--font-display)]">
                Negosyante Hub
              </h1>
              <p className="text-xs text-muted-foreground">
                Manila City • {allPosts.length} post{allPosts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
              setShowCreateForm(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 h-10 rounded-full font-[var(--font-display)]"
          >
            <MessageSquarePlus className="w-4 h-4 mr-1.5" />
            Mag-post
          </Button>
        </div>
      </header>

      {/* Category Filter */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {CATEGORIES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSelectedCategory(value)}
                className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-full transition-all min-h-[44px] ${
                  selectedCategory === value
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white text-muted-foreground border border-border hover:border-primary/30 hover:text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="container max-w-2xl py-4 space-y-3 pb-24">
        <AnimatePresence>
          {filteredPosts.map((post, i) => {
            const style = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.tip;
            const CategoryIcon = CATEGORY_ICONS[post.category] || Lightbulb;
            const accentBar = CATEGORY_ACCENT[post.category] || "bg-primary";
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm"
              >
                {/* Category accent strip */}
                <div className={`h-1 w-full ${accentBar}`} />

                {/* Post header */}
                <button
                  onClick={() => navigate(`/hub/${post.id}`)}
                  className="w-full text-left px-4 pt-4 pb-2"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {post.authorName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight font-[var(--font-display)]">
                          {post.authorName}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
                      <CategoryIcon className="w-3.5 h-3.5" />
                      {post.category === "tip" && "Tip"}
                      {post.category === "warning" && "Babala"}
                      {post.category === "question" && "Tanong"}
                      {post.category === "experience" && "Kwento"}
                    </span>
                  </div>

                  {/* Fixer warning banner */}
                  {post.category === "warning" && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-xl">
                      <Shield className="w-4 h-4 text-destructive shrink-0" />
                      <span className="text-xs font-bold text-destructive uppercase tracking-wide">
                        Fixer Warning
                      </span>
                    </div>
                  )}

                  <h3 className="font-bold text-base text-foreground leading-snug mb-2 font-[var(--font-display)]">
                    {post.title}
                  </h3>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    <Streamdown>{post.content}</Streamdown>
                  </div>
                </button>

                {/* Vote section */}
                <div className="px-4 py-2 border-t border-border/50 flex items-center gap-4">
                  {(() => {
                    const myVote = myVoteByPost.get(post.id);
                    return (
                      <>
                        <button
                          onClick={() => handleVote(post.id, "up")}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            myVote === "up" ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          <ThumbsUp
                            className="w-4 h-4"
                            fill={myVote === "up" ? "currentColor" : "none"}
                          />
                          <span className="font-[var(--font-mono)]">{post.upvotes}</span>
                        </button>
                        <button
                          onClick={() => handleVote(post.id, "down")}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            myVote === "down" ? "text-destructive font-semibold" : "text-muted-foreground hover:text-destructive"
                          }`}
                        >
                          <ThumbsDown
                            className="w-4 h-4"
                            fill={myVote === "down" ? "currentColor" : "none"}
                          />
                          <span className="font-[var(--font-mono)]">{post.downvotes}</span>
                        </button>
                      </>
                    );
                  })()}
                  <button
                    onClick={() => navigate(`/hub/${post.id}`)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-earth-brown transition-colors ml-auto"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="font-[var(--font-mono)]">{post.commentCount ?? 0}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary/50" />
            </div>
            <p className="text-base font-bold text-foreground font-[var(--font-display)]">
              Wala pang posts dito.
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Maging una kang mag-share ng experience mo!
            </p>
            <Button
              onClick={() => {
                if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
                setShowCreateForm(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white rounded-full font-[var(--font-display)]"
            >
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              Mag-post Ngayon
            </Button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg text-foreground font-[var(--font-display)]">
                  Mag-share sa Hub
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 rounded-xl hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Category selector */}
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Uri ng Post</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {(["tip", "warning", "question", "experience"] as const).map((cat) => {
                  const style = CATEGORY_STYLES[cat];
                  const Icon = CATEGORY_ICONS[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-full border transition-all min-h-[44px] ${
                        newCategory === cat
                          ? `${style.bg} ${style.text} ${style.border}`
                          : "bg-white text-muted-foreground border-border hover:border-border"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat === "tip" && "Tip"}
                      {cat === "warning" && "Babala"}
                      {cat === "question" && "Tanong"}
                      {cat === "experience" && "Kwento"}
                    </button>
                  );
                })}
              </div>

              <select
                value={newStepNumber}
                onChange={(e) => setNewStepNumber(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 mb-3 font-[var(--font-body)]"
              >
                <option value="">Walang step tag (general)</option>
                <option value={1}>Step 1 — DTI Business Name</option>
                <option value={2}>Step 2 — Barangay Clearance</option>
                <option value={3}>Step 3 — Cedula</option>
                <option value={4}>Step 4 — Mayor's Permit</option>
                <option value={5}>Step 5 — BIR Registration</option>
              </select>

              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Title</p>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ano ang title ng post mo?"
                className="w-full px-4 h-14 rounded-xl bg-muted border border-border text-base focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4"
              />

              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Mensahe</p>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="I-share ang iyong experience, tip, o tanong..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-base focus:outline-none focus:ring-2 focus:ring-primary/40 mb-5 resize-none"
              />
              <Button
                onClick={handleCreatePost}
                disabled={!newTitle.trim() || !newContent.trim() || createPost.isPending}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-xl font-[var(--font-display)]"
              >
                <Send className="w-5 h-5 mr-2" />
                {createPost.isPending ? "Nagpo-post..." : "I-post sa Hub"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
