/*
 * PostDetail — Single Hub post + comment thread.
 * Route: /hub/:postId
 */
import { useState, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Streamdown } from "streamdown";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Send,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  Star,
  Shield,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, typeof Lightbulb> = {
  tip: Lightbulb,
  warning: AlertTriangle,
  question: HelpCircle,
  experience: Star,
};

const CATEGORY_LABELS: Record<string, string> = {
  tip: "Tip",
  warning: "Babala",
  question: "Tanong",
  experience: "Kwento",
};

export default function PostDetail() {
  const [, navigate] = useLocation();
  const params = useParams<{ postId: string }>();
  const postId = params.postId;
  const { isAuthenticated } = useAuth();
  const [body, setBody] = useState("");

  const { data: posts, refetch: refetchPosts } = trpc.community.list.useQuery({ lguTag: "manila_city" });
  const post = useMemo(() => posts?.find(p => p.id === postId), [posts, postId]);

  const { data: comments, refetch: refetchComments } =
    trpc.community.comments.useQuery({ postId }, { enabled: !!postId });

  const { data: myVotesData, refetch: refetchMyVotes } = trpc.community.myVotes.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const myVote = useMemo(
    () => myVotesData?.find(v => v.postId === postId)?.voteType,
    [myVotesData, postId]
  );

  const voteMutation = trpc.community.vote.useMutation({
    onSuccess: () => {
      refetchPosts();
      refetchMyVotes();
    },
  });
  const addComment = trpc.community.addComment.useMutation({
    onSuccess: () => {
      setBody("");
      refetchComments();
      refetchPosts();
    },
  });

  const handleVote = (voteType: "up" | "down") => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    voteMutation.mutate({ postId, voteType });
  };

  const handleSubmit = () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    const trimmed = body.trim();
    if (trimmed.length === 0) return;
    addComment.mutate({ postId, body: trimmed });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("fil-PH", { month: "short", day: "numeric" });
  };

  if (!posts) {
    return <div className="min-h-screen bg-warm-cream p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!post) {
    return (
      <div className="min-h-screen bg-warm-cream p-8 text-center">
        <p className="text-sm text-muted-foreground mb-3">Hindi nahanap ang post na ito.</p>
        <Button onClick={() => navigate("/hub")}>Bumalik sa Hub</Button>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[post.category] || Lightbulb;

  return (
    <div className="min-h-screen bg-warm-cream pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center gap-3 h-14">
          <button onClick={() => navigate("/hub")} className="text-muted-foreground hover:text-foreground lg:hidden">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-[var(--font-display)] text-base text-earth-brown">Post</h1>
        </div>
      </header>

      <div className="container max-w-2xl lg:max-w-3xl py-4 space-y-3">
        {/* Post card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center">
                <span className="text-xs font-bold text-teal">{post.authorName.charAt(0)}</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">{post.authorName}</div>
                <div className="text-[10px] text-muted-foreground">{formatDate(post.createdAt)}</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              <Icon className="w-3 h-3" />
              {CATEGORY_LABELS[post.category]}
            </span>
          </div>

          {post.category === "warning" && (
            <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-red-50 border border-red-200 rounded-lg">
              <Shield className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[10px] font-semibold text-red-700">FIXER WARNING</span>
            </div>
          )}

          <h2 className="text-base font-bold text-earth-brown leading-snug mb-2">{post.title}</h2>
          <div className="text-sm text-muted-foreground leading-relaxed mb-3">
            <Streamdown>{post.content}</Streamdown>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-border/50">
            <button
              onClick={() => handleVote("up")}
              className={`flex items-center gap-1 text-sm transition-colors ${
                myVote === "up" ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <ThumbsUp className="w-4 h-4" fill={myVote === "up" ? "currentColor" : "none"} />
              <span className="font-[var(--font-mono)]">{post.upvotes}</span>
            </button>
            <button
              onClick={() => handleVote("down")}
              className={`flex items-center gap-1 text-sm transition-colors ${
                myVote === "down" ? "text-destructive font-semibold" : "text-muted-foreground hover:text-destructive"
              }`}
            >
              <ThumbsDown className="w-4 h-4" fill={myVote === "down" ? "currentColor" : "none"} />
              <span className="font-[var(--font-mono)]">{post.downvotes}</span>
            </button>
          </div>
        </div>

        {/* Comments */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold text-earth-brown px-1">Mga Sagot ({post.commentCount ?? 0})</h3>
          <AnimatePresence>
            {(comments ?? []).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="bg-white rounded-xl border border-border p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-mango/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-mango">{c.authorName.charAt(0)}</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{c.authorName}</span>
                  <span className="text-[10px] text-muted-foreground">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-8">{c.body}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {comments && comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Wala pang sagot. Maging una!</p>
          )}
        </section>

        {/* Composer */}
        <div className="bg-white rounded-xl border border-border p-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={isAuthenticated ? "I-share ang sagot mo…" : "Mag-login para mag-comment"}
            rows={3}
            maxLength={500}
            disabled={!isAuthenticated}
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 resize-none font-[var(--font-body)] disabled:opacity-50"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground font-[var(--font-mono)]">{body.length}/500</span>
            <Button
              onClick={handleSubmit}
              disabled={body.trim().length === 0 || addComment.isPending || !isAuthenticated}
              className="bg-teal hover:bg-teal/90 text-white text-xs px-3 py-1.5 h-auto rounded-full"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              {addComment.isPending ? "Ipinopost…" : "I-post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
