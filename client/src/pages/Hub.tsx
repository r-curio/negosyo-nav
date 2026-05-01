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
import { toast } from "sonner";
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
  Shield,
  User,
  MoreVertical,
  Pencil,
  Trash2,
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
  const { isAuthenticated, user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"tip" | "warning" | "question" | "experience">("tip");
  const [newStepNumber, setNewStepNumber] = useState<number | "">("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("compose") === "1") {
      setShowCreateForm(true);
      const s = Number(params.get("step"));
      if (Number.isInteger(s) && s >= 1 && s <= 20) setNewStepNumber(s);
    }
  }, []);

  useEffect(() => {
    if (!showCreateForm) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [showCreateForm]);

  useEffect(() => {
    if (!openMenuPostId) return;
    const close = () => { setOpenMenuPostId(null); setConfirmDeletePostId(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuPostId]);

  const { data: dbPosts, refetch } = trpc.community.list.useQuery({ lguTag: "manila_city" });
  const createPost = trpc.community.create.useMutation({
    onSuccess: () => {
      refetch();
      closeModal();
      toast.success("Na-post na!");
    },
    onError: (err) => {
      toast.error(err.message || "Hindi na-post. Subukan muli.");
    },
  });
  const updatePost = trpc.community.update.useMutation({
    onSuccess: () => {
      refetch();
      closeModal();
      toast.success("Na-update na ang post!");
    },
    onError: (err) => {
      toast.error(err.message || "Hindi na-update. Subukan muli.");
    },
  });
  const deletePost = trpc.community.delete.useMutation({
    onSuccess: () => {
      refetch();
      setConfirmDeletePostId(null);
      setOpenMenuPostId(null);
      toast.success("Na-delete na ang post.");
    },
    onError: (err) => {
      toast.error(err.message || "Hindi na-delete. Subukan muli.");
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

  const closeModal = () => {
    setShowCreateForm(false);
    setEditingPostId(null);
    setNewTitle("");
    setNewContent("");
    setNewCategory("tip");
    setNewStepNumber("");
  };

  const openEditModal = (post: typeof allPosts[0]) => {
    setEditingPostId(post.id);
    setNewTitle(post.title);
    setNewContent(post.content);
    setNewCategory(post.category);
    setNewStepNumber(post.stepNumber ?? "");
    setOpenMenuPostId(null);
    setShowCreateForm(true);
  };

  const handleSubmitPost = () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    if (editingPostId) {
      updatePost.mutate({ postId: editingPostId, title: newTitle, content: newContent, category: newCategory });
    } else {
      createPost.mutate({ title: newTitle, content: newContent, category: newCategory, lguTag: "manila_city", stepNumber: typeof newStepNumber === "number" ? newStepNumber : undefined });
    }
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
              className="p-2 rounded-xl hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center lg:hidden"
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
            className="text-white h-10 w-10 rounded-full font-[var(--font-display)] hover:opacity-90 active:scale-95 transition-all border-0 flex items-center justify-center p-0"
            style={{ background: "linear-gradient(140deg, var(--color-brand-teal) 0%, var(--color-forest) 60%, oklch(0.22 0.08 255) 100%)" }}
          >
            <MessageSquarePlus className="w-4 h-4" />
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

      {/* Compose prompt card */}
      <div className="container max-w-2xl lg:max-w-3xl pt-4 pb-2">
        <button
          onClick={() => {
            if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
            setShowCreateForm(true);
          }}
          className="w-full bg-white rounded-2xl border border-border shadow-sm px-4 py-3 flex items-center gap-3 hover:bg-muted/40 active:scale-[0.99] transition-all text-left"
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <span className="flex-1 text-sm text-muted-foreground/70 font-[var(--font-body)]">
            Ano ang nasa isip mo, {user?.displayName?.split(" ")[0] ?? "Negosyante"}?
          </span>
        </button>
      </div>

      {/* Posts List */}
      <div className="container max-w-2xl lg:max-w-3xl py-2 space-y-3 pb-24">
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
                <div className="px-4 pt-4 pb-2">
                  {/* Author row */}
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
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
                        <CategoryIcon className="w-3.5 h-3.5" />
                        {post.category === "tip" && "Tip"}
                        {post.category === "warning" && "Babala"}
                        {post.category === "question" && "Tanong"}
                        {post.category === "experience" && "Kwento"}
                      </span>
                      {post.userId === user?.uid && (
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuPostId(openMenuPostId === post.id ? null : post.id); setConfirmDeletePostId(null); }}
                            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuPostId === post.id && (
                            confirmDeletePostId === post.id ? (
                              <div className="absolute right-0 top-9 z-20 bg-white border border-border rounded-xl shadow-lg p-3 w-44">
                                <p className="text-xs font-semibold text-foreground mb-2.5 text-center">Burahin ang post?</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => { setConfirmDeletePostId(null); setOpenMenuPostId(null); }}
                                    className="flex-1 h-8 rounded-lg text-xs font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors"
                                  >Hindi</button>
                                  <button
                                    onClick={() => deletePost.mutate({ postId: post.id })}
                                    disabled={deletePost.isPending}
                                    className="flex-1 h-8 rounded-lg text-xs font-semibold bg-destructive text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
                                  >{deletePost.isPending ? "..." : "Burahin"}</button>
                                </div>
                              </div>
                            ) : (
                              <div className="absolute right-0 top-9 z-20 bg-white border border-border rounded-xl shadow-lg overflow-hidden w-36">
                                <button
                                  onClick={() => openEditModal(post)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                                >
                                  <Pencil className="w-4 h-4 text-muted-foreground" />
                                  I-edit
                                </button>
                                <button
                                  onClick={() => setConfirmDeletePostId(post.id)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Burahin
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clickable body */}
                  <button onClick={() => navigate(`/hub/${post.id}`)} className="w-full text-left">
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
                </div>

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
              className="text-white rounded-full font-[var(--font-display)] hover:opacity-90 active:scale-95 transition-all border-0"
              style={{ background: "linear-gradient(140deg, var(--color-brand-teal) 0%, var(--color-forest) 60%, oklch(0.22 0.08 255) 100%)" }}
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
            className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-2xl max-h-[88dvh] min-h-[72dvh] flex flex-col overscroll-contain shadow-xl"
            >
              {/* Header — close left, title center, spacer right */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/60 shrink-0">
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
                <h2 className="font-bold text-base text-foreground font-[var(--font-display)]">
                  {editingPostId ? "I-edit ang Post" : "Bagong Post"}
                </h2>
                <div className="min-w-[44px]" />
              </div>

              {/* Composer body */}
              <div className="flex-1 overflow-y-auto flex flex-col">
                {/* Author row */}
                <div className="flex items-start gap-3 px-4 pt-4 pb-2">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-bold text-foreground font-[var(--font-display)] leading-none mb-2">
                      {user?.displayName ?? "Negosyante"}
                    </p>
                    {/* Inline category pills */}
                    <div className="flex gap-1.5 flex-wrap">
                      {(["tip", "warning", "question", "experience"] as const).map((cat) => {
                        const isSelected = newCategory === cat;
                        const style = CATEGORY_STYLES[cat];
                        const Icon = CATEGORY_ICONS[cat];
                        const label = { tip: "Tip", warning: "Babala", question: "Tanong", experience: "Kwento" }[cat];
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setNewCategory(cat);
                              if (cat !== "warning") setNewStepNumber("");
                            }}
                            className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                              isSelected
                                ? `${style.bg} ${style.text} ${style.border}`
                                : "bg-muted text-muted-foreground border-transparent hover:border-border"
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Title — borderless, auto-grows with content */}
                <div className="px-4 pb-1">
                  <textarea
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    placeholder="Ano ang paksa ng post mo?"
                    rows={1}
                    className="w-full text-[17px] font-semibold text-foreground placeholder:text-muted-foreground/50 bg-transparent border-none focus:outline-none resize-none leading-snug overflow-hidden"
                  />
                </div>

                {/* Content — borderless textarea, stretches to fill space */}
                <div className="flex-1 flex flex-col px-4 pb-2 min-h-0">
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="I-share ang iyong experience, tip, o tanong para sa kapwa Negosyante..."
                    className="flex-1 w-full text-sm text-foreground placeholder:text-muted-foreground/45 bg-transparent border-none focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Step tag — only for Babala */}
              {newCategory === "warning" && (
                <div className="border-t border-border/50 px-4 py-3 shrink-0">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2">I-tag ang registration step (optional)</p>
                  <select
                    value={newStepNumber}
                    onChange={(e) => setNewStepNumber(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-[var(--font-body)]"
                  >
                    <option value="">Walang step tag (general)</option>
                    <option value={1}>Step 1 — DTI Business Name</option>
                    <option value={2}>Step 2 — Barangay Clearance</option>
                    <option value={3}>Step 3 — Cedula</option>
                    <option value={4}>Step 4 — Mayor's Permit</option>
                    <option value={5}>Step 5 — BIR Registration</option>
                  </select>
                </div>
              )}

              {/* Post action footer */}
              <div className="border-t border-border/50 px-4 py-3 shrink-0 space-y-2">
                {(newTitle.trim().length > 0 && newTitle.trim().length < 5) && (
                  <p className="text-xs text-destructive text-center">Pamagat: kailangan ng hindi bababa sa 5 character</p>
                )}
                {(newContent.trim().length > 0 && newContent.trim().length < 10) && (
                  <p className="text-xs text-destructive text-center">Nilalaman: kailangan ng hindi bababa sa 10 character</p>
                )}
                <Button
                  onClick={handleSubmitPost}
                  disabled={newTitle.trim().length < 5 || newContent.trim().length < 10 || createPost.isPending || updatePost.isPending}
                  className="w-full h-11 rounded-full text-white font-bold text-sm font-[var(--font-display)] border-0 disabled:opacity-40"
                  style={{ background: "linear-gradient(140deg, var(--color-brand-teal) 0%, var(--color-forest) 60%, oklch(0.22 0.08 255) 100%)" }}
                >
                  {(createPost.isPending || updatePost.isPending) ? "Sandali lang..." : editingPostId ? "I-save" : "I-post"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
