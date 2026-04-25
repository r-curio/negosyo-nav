/*
 * RoadmapTipsForStep — surfaces top-3 step-tagged Hub posts inside a roadmap step.
 */
import { useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ThumbsUp, MessageCircle, Plus } from "lucide-react";

interface Props {
  stepNumber: number;
  lguTag: string;
}

export function RoadmapTipsForStep({ stepNumber, lguTag }: Props) {
  const [, navigate] = useLocation();
  const { data, isLoading } = trpc.community.list.useQuery({ stepNumber, lguTag });

  const top3 = useMemo(() => {
    return [...(data ?? [])]
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 3);
  }, [data]);

  if (isLoading) return null;

  if (top3.length === 0) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-border bg-white/50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-earth-brown">Walang tips pa rito.</p>
            <p className="text-[10px] text-muted-foreground">Maging unang mag-share ng experience mo sa step na ito.</p>
          </div>
          <button
            onClick={() => navigate(`/hub?compose=1&step=${stepNumber}`)}
            className="inline-flex items-center gap-1 text-xs text-teal hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Mag-share
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <MessageCircle className="w-3.5 h-3.5 text-mango" />
        <h4 className="text-xs font-semibold text-earth-brown">Tips mula sa Negosyante Hub</h4>
      </div>
      {top3.map(post => (
        <button
          key={post.id}
          onClick={() => navigate(`/hub/${post.id}`)}
          className="w-full text-left bg-white rounded-xl border border-border p-3 hover:border-teal/40 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-earth-brown line-clamp-2">{post.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">— {post.authorName}</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
              <ThumbsUp className="w-3 h-3" />
              <span className="font-[var(--font-mono)]">{post.upvotes}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
