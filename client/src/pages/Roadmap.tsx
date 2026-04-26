/*
 * NegosyoNav Lakad Roadmap Page — v4
 * Refactor: action-first hierarchy. Combined sticky progress, active-step CTA,
 * Quick Actions, locked-state UX, reorganized sections.
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Clock, FileText, ChevronDown, ChevronUp, ExternalLink,
  CheckCircle2, Coins, Award, Lightbulb, Building2, ShieldCheck,
  BadgeCheck, Flag, X, Send, SquareCheck, Square, Star,
  CalendarDays, Navigation, Lock, Globe, Phone, ArrowRight, PlayCircle, Sparkles,
  LayoutGrid,
} from "lucide-react";
import { manilaData, type RegistrationStep } from "@/data/manilaData";
import { StepOfficeCard } from "@/components/StepOfficeCard";
import { RoadmapTipsForStep } from "@/components/RoadmapTipsForStep";
import ChatFab from "@/components/ChatFab";
import { toast } from "sonner";

const TOTAL_DAYS_ESTIMATE = "7–11 araw";

const STEP_SHORT_TITLES: Record<number, string> = {
  1: "DTI",
  2: "Barangay",
  3: "Cedula",
  4: "Mayor's Permit",
  5: "BIR",
};

function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString()}`;
}

function formatStepCost(step: RegistrationStep): string {
  return step.cost.min === step.cost.max
    ? formatCurrency(step.cost.min)
    : `${formatCurrency(step.cost.min)}–${formatCurrency(step.cost.max)}`;
}

/* ─── Combined Sticky Progress Header ─── */
function ProgressCombined({
  completedSteps,
  totalSteps,
  remainingCost,
  firstIncompleteNumber,
}: {
  completedSteps: Set<number>;
  totalSteps: number;
  remainingCost: { min: number; max: number };
  firstIncompleteNumber: number | undefined;
}) {
  const completedCount = completedSteps.size;
  const allDone = completedCount === totalSteps;
  return (
    <div className="sticky top-14 z-40 bg-warm-cream/95 backdrop-blur-md border-b border-border/50">
      <div className="container max-w-2xl lg:max-w-3xl py-3">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-3.5">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-[var(--font-mono)] text-lg font-bold text-earth-brown">
                  {completedCount}/{totalSteps}
                </span>
                <span className="text-[11px] text-muted-foreground font-[var(--font-mono)] uppercase tracking-wide">
                  hakbang
                </span>
              </div>
              <p className="font-[var(--font-mono)] text-[11px] text-earth-brown/80 mt-0.5 truncate">
                {formatCurrency(remainingCost.min)}–{formatCurrency(remainingCost.max)} • {TOTAL_DAYS_ESTIMATE}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-mango-light flex items-center justify-center shrink-0">
              {allDone ? (
                <Sparkles className="w-5 h-5 text-mango" />
              ) : (
                <Coins className="w-5 h-5 text-mango" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {manilaData.registration_steps.map((step) => {
              const done = completedSteps.has(step.step_number);
              const isActive = firstIncompleteNumber === step.step_number;
              return (
                <div key={step.step_number} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`h-2 w-full rounded-full transition-all duration-500 ${
                      done ? "bg-success" : isActive ? "bg-teal" : "bg-muted"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-[var(--font-mono)] ${
                      done
                        ? "text-success"
                        : isActive
                          ? "text-teal font-bold"
                          : "text-muted-foreground/50"
                    }`}
                  >
                    {step.step_number}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Quick Actions row near active step ─── */
function QuickActions({ navigate }: { navigate: (path: string) => void }) {
  const items = [
    {
      path: "/forms",
      icon: FileText,
      label: "Auto-fill Forms",
      sub: "DTI, Barangay, BIR",
      bg: "bg-teal-light",
      color: "text-teal",
      border: "border-teal/30",
    },
    {
      path: "/planner",
      icon: Clock,
      label: "Task Planner",
      sub: "Anong kaya gawin ngayon",
      bg: "bg-mango-light",
      color: "text-mango",
      border: "border-mango/30",
    },
  ];
  return (
    <div className="container max-w-2xl lg:max-w-3xl mt-4">
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Tulong para sa Step na ito
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {items.map(({ path, icon: Icon, label, sub, bg, color, border }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`bg-white rounded-xl border ${border} p-3 shadow-sm active:scale-[0.98] transition-transform text-left min-h-[44px]`}
          >
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <h4 className="font-[var(--font-display)] text-xs font-bold text-earth-brown leading-tight">
              {label}
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Section divider with label ─── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="container max-w-2xl lg:max-w-3xl mt-8 mb-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/60" />
        <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-muted-foreground/70">
          {label}
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>
    </div>
  );
}

/* ─── Step Card ─── */
function StepCard({
  step, index, isCompleted, isActive, isLocked, checkedReqs,
  onToggleReq, onMarkComplete, onLockedTap, profile, defaultExpanded,
}: {
  step: RegistrationStep;
  index: number;
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
  checkedReqs: Set<string>;
  onToggleReq: (key: string) => void;
  onMarkComplete: () => void;
  onLockedTap: () => void;
  profile: { bizBarangay?: string | null } | null;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(!!defaultExpanded);

  const allReqsDone = step.requirements.every((_, i) => checkedReqs.has(`${step.step_number}-${i}`));
  const reqsDoneCount = step.requirements.filter((_, i) => checkedReqs.has(`${step.step_number}-${i}`)).length;

  const stepColors = [
    { bg: "bg-teal/10", border: "border-teal/30", accent: "text-teal", dot: "bg-teal" },
    { bg: "bg-mango/10", border: "border-mango/30", accent: "text-mango", dot: "bg-mango" },
    { bg: "bg-teal/10", border: "border-teal/30", accent: "text-teal", dot: "bg-teal" },
    { bg: "bg-jeepney-red/10", border: "border-jeepney-red/30", accent: "text-jeepney-red", dot: "bg-jeepney-red" },
    { bg: "bg-teal/10", border: "border-teal/30", accent: "text-teal", dot: "bg-teal" },
  ];
  const color = stepColors[index % stepColors.length];

  // Dependency line for locked step
  const deps = useMemo(() => {
    if (!isLocked) return null;
    const priors: string[] = [];
    for (let n = 1; n < step.step_number; n++) {
      priors.push(STEP_SHORT_TITLES[n] ?? `Step ${n}`);
    }
    return priors;
  }, [isLocked, step.step_number]);

  const readinessLabel = isCompleted
    ? "Kumpleto na"
    : allReqsDone
      ? "Kumpleto na"
      : `${step.requirements.length} dokumento kailangan`;

  const ctaLabel = reqsDoneCount === 0
    ? `Simulan ang Step ${step.step_number}`
    : "Ipagpatuloy";

  function handleCardClick() {
    if (isLocked && !isCompleted) {
      onLockedTap();
      return;
    }
    setExpanded((v) => !v);
  }

  function handlePrimaryCta(e: React.MouseEvent) {
    e.stopPropagation();
    if (!expanded) setExpanded(true);
    // Scroll to requirements section after expansion
    requestAnimationFrame(() => {
      const el = document.getElementById(`step-${step.step_number}-reqs`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="relative"
    >
      {/* Timeline connector */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5">
        <div className={`w-full h-full transition-colors duration-500 ${isCompleted ? "bg-success" : "bg-border"}`} />
      </div>

      {/* Timeline dot */}
      <div className="absolute left-2.5 top-5 z-10">
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-success flex items-center justify-center shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
          </motion.div>
        ) : isActive ? (
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <div className={`w-6 h-6 rounded-full ${color.dot} flex items-center justify-center shadow-sm`}>
              <span className="text-[10px] font-bold text-white font-[var(--font-mono)]">{step.step_number}</span>
            </div>
          </motion.div>
        ) : isLocked ? (
          <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20 bg-muted/60 flex items-center justify-center">
            <Lock className="w-3 h-3 text-muted-foreground/50" aria-label="locked" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/40 bg-white flex items-center justify-center">
            <span className="text-[9px] font-bold font-[var(--font-mono)] text-muted-foreground/60">{step.step_number}</span>
          </div>
        )}
      </div>

      {/* Card */}
      <div className={`ml-12 mb-5 ${isLocked && !isCompleted ? "opacity-60" : ""}`}>
        <div
          className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
            isCompleted
              ? "bg-white/80 border-success/30 shadow-sm"
              : isActive
                ? `bg-white ${color.border} shadow-md ring-1 ring-teal/20`
                : "bg-white border-border shadow-sm"
          }`}
        >
          {/* Status banner */}
          {isActive && !isCompleted && (
            <div className={`${color.bg} px-4 py-1.5 flex items-center gap-2`}>
              <motion.div
                className={`w-1.5 h-1.5 rounded-full ${color.dot}`}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${color.accent}`}>
                Kasalukuyang Hakbang
              </span>
            </div>
          )}
          {isCompleted && (
            <div className="bg-success/10 px-4 py-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-success">Tapos Na!</span>
            </div>
          )}
          {isLocked && !isCompleted && (
            <div className="bg-muted px-4 py-1.5 flex items-center gap-2">
              <Lock className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Naka-lock</span>
            </div>
          )}

          {/* Card Header */}
          <button
            onClick={handleCardClick}
            className="w-full text-left p-4"
          >
            {/* Pills row: Step badge + price + readiness */}
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <span className={`text-[10px] font-[var(--font-mono)] font-bold uppercase tracking-wide ${color.accent} ${color.bg} px-2 py-0.5 rounded-full`}>
                Step {step.step_number}
              </span>
              <span className="inline-flex items-center gap-1 bg-mango-light px-2 py-0.5 rounded-full">
                <Coins className="w-3 h-3 text-mango" />
                <span className="font-[var(--font-mono)] text-[11px] font-bold text-earth-brown">
                  {formatStepCost(step)}
                </span>
              </span>
              {!isCompleted ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-[var(--font-mono)] font-semibold min-h-[24px] ${
                        allReqsDone
                          ? "bg-success/15 text-success"
                          : "bg-muted text-earth-brown/80"
                      }`}
                    >
                      {allReqsDone
                        ? <CheckCircle2 className="w-3 h-3 text-success" />
                        : <FileText className="w-3 h-3" />
                      }
                      {readinessLabel}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-64 p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide text-earth-brown/70 mb-2">
                      Mga Requirement
                    </p>
                    <ul className="space-y-1.5">
                      {step.requirements.map((req, i) => {
                        const isChecked = checkedReqs.has(`${step.step_number}-${i}`);
                        return (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            {isChecked
                              ? <SquareCheck className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                              : <Square className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            }
                            <span className={isChecked ? "text-muted-foreground line-through" : "text-earth-brown"}>
                              {req}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </PopoverContent>
                </Popover>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-[11px] font-[var(--font-mono)] font-semibold text-success">
                  <CheckCircle2 className="w-3 h-3" />
                  Kumpleto
                </span>
              )}
            </div>

            {/* Title + agency */}
            <h3 className={`font-[var(--font-display)] text-sm font-bold leading-snug ${isCompleted ? "text-muted-foreground" : "text-earth-brown"}`}>
              {step.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{step.agency}</p>

            {/* Dependency line */}
            {isLocked && deps && deps.length > 0 && (
              <p className="text-[10px] text-earth-brown/70 mt-2 flex items-start gap-1">
                <Lock className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground" />
                <span>Kailangan: {deps.join(", ")}</span>
              </p>
            )}
          </button>

          {/* Active step primary CTA */}
          {isActive && !isCompleted && (
            <div className="px-4 pb-3">
              <Button
                onClick={handlePrimaryCta}
                className="w-full h-12 bg-teal hover:bg-teal/90 text-white font-[var(--font-display)] rounded-xl shadow-sm"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                {ctaLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
                className="w-full mt-2 text-[11px] text-teal underline-offset-4 hover:underline font-medium min-h-[36px]"
              >
                {expanded ? "I-collapse ang detalye" : "Tingnan ang detalye"}
              </button>
            </div>
          )}

          {/* Non-active expand toggle */}
          {!isActive && !isLocked && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-full flex items-center justify-center gap-1 pb-3 -mt-1"
            >
              {expanded ? (
                <><ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">I-collapse</span></>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">Tingnan ang detalye</span></>
              )}
            </button>
          )}

          {/* Expanded Content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border/50 divide-y divide-border/40">
                  {/* Surface metadata moved here: time + online */}
                  <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-[var(--font-mono)]">
                      <Clock className="w-3 h-3" />
                      {step.processing_time_days === 1 ? "1 araw" : `≤${step.processing_time_days} araw`}
                    </span>
                    {step.online_url && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-teal bg-teal-light px-2 py-0.5 rounded-full font-medium">
                        <Globe className="w-3 h-3" />
                        Online
                      </span>
                    )}
                  </div>

                  {/* Where to apply */}
                  <div className="px-4 py-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-teal" />
                      <span className="text-xs font-bold text-earth-brown">Saan Mag-aapply</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-5">{step.where_to_apply}</p>
                    {step.online_url && (
                      <a
                        href={step.online_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-teal hover:underline mt-1.5 pl-5 font-medium"
                      >
                        I-apply Online <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Office card + map (Step 5 nests RDO finder via StepOfficeCard) */}
                  <div className="px-4 py-4">
                    <StepOfficeCard step={step} profile={profile} />
                    <RoadmapTipsForStep stepNumber={step.step_number} lguTag="manila_city" />
                  </div>

                  {/* Requirements */}
                  <div id={`step-${step.step_number}-reqs`} className="px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-mango" />
                        <span className="text-xs font-bold text-earth-brown">Mga Requirement</span>
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={allReqsDone ? "done" : "pending"}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className={`text-[10px] font-bold font-[var(--font-mono)] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            allReqsDone ? "bg-success/15 text-success" : "bg-muted text-earth-brown/80"
                          }`}
                        >
                          {allReqsDone && <Sparkles className="w-3 h-3" />}
                          {reqsDoneCount}/{step.requirements.length}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
                      <motion.div
                        className="h-full bg-gradient-to-r from-teal to-success rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(reqsDoneCount / step.requirements.length) * 100}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <div className="space-y-1">
                      {step.requirements.map((req, i) => {
                        const key = `${step.step_number}-${i}`;
                        const isChecked = checkedReqs.has(key);
                        return (
                          <button
                            key={key}
                            onClick={(e) => { e.stopPropagation(); onToggleReq(key); }}
                            className="flex items-start gap-2.5 text-xs text-left w-full py-2 hover:bg-muted/60 active:bg-muted rounded-lg px-2 transition-colors min-h-[44px]"
                          >
                            {isChecked
                              ? <SquareCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                              : <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            }
                            <span className={isChecked ? "text-muted-foreground line-through" : "text-earth-brown"}>
                              {req}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="px-4 py-4">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Coins className="w-3.5 h-3.5 text-mango" />
                      <span className="text-xs font-bold text-earth-brown">Breakdown ng Bayad</span>
                    </div>
                    <div className="space-y-2">
                      {step.cost.breakdown.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{item.item}</span>
                          <span className="font-[var(--font-mono)] text-earth-brown font-semibold">
                            {item.amount !== undefined
                              ? (item.amount === 0 ? item.note || "Libre" : formatCurrency(item.amount))
                              : item.amount_range}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Output & Validity */}
                  <div className="px-4 py-4 flex gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-success" />
                        <span className="text-xs font-bold text-earth-brown">Output</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.output_document}</p>
                    </div>
                    {step.validity_years && (
                      <div className="shrink-0">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                          <span className="text-xs font-bold text-earth-brown">Valid</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.validity_years} taon</p>
                      </div>
                    )}
                  </div>

                  {/* Tips */}
                  {step.tips.length > 0 && (
                    <div className="px-4 py-4">
                      <div className="bg-mango-light rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Lightbulb className="w-3.5 h-3.5 text-mango" />
                          <span className="text-xs font-bold text-earth-brown">Mga Tip</span>
                        </div>
                        <ul className="space-y-1.5">
                          {step.tips.map((tip, i) => (
                            <li key={i} className="text-xs text-earth-brown flex items-start gap-1.5">
                              <span className="text-mango mt-0.5 shrink-0">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Post-registration */}
                  {step.post_registration && (
                    <div className="px-4 py-4">
                      <div className="bg-teal-light rounded-xl p-3.5">
                        <span className="text-xs font-bold text-earth-brown block mb-2">Pagkatapos ng Registration:</span>
                        <ul className="space-y-1.5">
                          {step.post_registration.map((item, i) => (
                            <li key={i} className="text-xs text-earth-brown flex items-start gap-1.5">
                              <span className="text-teal mt-0.5 shrink-0">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Renewal warning */}
                  {step.renewal_deadline && (
                    <div className="px-4 py-4">
                      <div className="bg-jeepney-red/10 rounded-xl p-3.5 border border-jeepney-red/20">
                        <p className="text-xs text-jeepney-red font-medium">
                          ⚠️ Deadline ng renewal: {step.renewal_deadline}. Late penalty: {step.late_penalty}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mark Step Complete CTA */}
                  {!isCompleted && (
                    <div className="px-4 py-4">
                      <Button
                        onClick={(e) => { e.stopPropagation(); onMarkComplete(); }}
                        disabled={!allReqsDone}
                        className={`w-full h-14 rounded-xl font-[var(--font-display)] text-sm ${
                          allReqsDone
                            ? "bg-success hover:bg-success/90 text-white shadow-sm"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        {allReqsDone
                          ? `Tapos na ang Step ${step.step_number}!`
                          : `I-check ang lahat ng ${step.requirements.length} requirement`
                        }
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Tools Drawer (header → bottom sheet) ─── */
const TOOLS = [
  { path: "/forms", icon: FileText, iconBg: "bg-teal-light", iconColor: "text-teal", title: "Auto-fill Forms", desc: "DTI, Barangay, BIR forms" },
  { path: "/places", icon: Navigation, iconBg: "bg-teal-light", iconColor: "text-teal", title: "Place Finder", desc: "Opisina, queue tips, maps" },
  { path: "/calendar", icon: CalendarDays, iconBg: "bg-mango-light", iconColor: "text-mango", title: "Renewal Calendar", desc: "Deadlines & reminders" },
  { path: "/planner", icon: Clock, iconBg: "bg-teal-light", iconColor: "text-teal", title: "Task Planner", desc: "May 2 oras ka ba?" },
  { path: "/grants", icon: Award, iconBg: "bg-mango-light", iconColor: "text-mango", title: "Grant Matching", desc: "BMBE, DOLE, SB Corp" },
  { path: "/hub", icon: Lightbulb, iconBg: "bg-teal-light", iconColor: "text-teal", title: "Negosyante Hub", desc: "Tips mula sa kapwa" },
];

/* ─── Main Roadmap Page ─── */
export default function Roadmap() {
  const [, navigate] = useLocation();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [checkedReqs, setCheckedReqs] = useState<Set<string>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"outdated_info" | "incorrect_data" | "suggestion" | "bug_report" | "general">("outdated_info");
  const [feedbackStep, setFeedbackStep] = useState<number | undefined>(undefined);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [shareToCommunity, setShareToCommunity] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const { data: profile } = trpc.profile.get.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const utils = trpc.useUtils();
  const feedbackMutation = trpc.feedback.submit.useMutation({
    onSuccess: (data) => {
      if (data.postId) {
        toast.success("Salamat! Naka-post na rin sa Hub. 🙏");
        utils.community.list.invalidate();
      } else {
        toast.success("Salamat sa feedback mo! 🙏");
      }
      setShowFeedback(false);
      setFeedbackMessage("");
    },
    onError: () => { toast.error("May error sa pag-submit. Subukan ulit."); },
  });

  const toggleReq = (key: string) => {
    setCheckedReqs((prev) => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };

  const markStepComplete = (stepNum: number) => {
    const step = manilaData.registration_steps.find(s => s.step_number === stepNum);
    if (!step) return;
    const allDone = step.requirements.every((_, i) => checkedReqs.has(`${stepNum}-${i}`));
    if (!allDone) { toast.error("Complete all requirements first!"); return; }
    setCompletedSteps((prev) => { const next = new Set(prev); next.add(stepNum); return next; });
    toast.success(`Step ${stepNum} complete! 🎉`);
  };

  const handleLockedTap = (stepNum: number) => {
    const priors: string[] = [];
    for (let n = 1; n < stepNum; n++) {
      if (!completedSteps.has(n)) priors.push(STEP_SHORT_TITLES[n] ?? `Step ${n}`);
    }
    toast.error(
      priors.length === 1
        ? `Tapusin muna ang ${priors[0]}.`
        : `Tapusin muna: ${priors.join(", ")}.`
    );
  };

  const firstIncomplete = manilaData.registration_steps.find(s => !completedSteps.has(s.step_number));
  const activeStep = firstIncomplete;

  const remainingCost = useMemo(() => {
    let min = 0, max = 0;
    manilaData.registration_steps.forEach(s => {
      if (!completedSteps.has(s.step_number)) { min += s.cost.min; max += s.cost.max; }
    });
    return { min, max };
  }, [completedSteps]);

  const remainingSteps = manilaData.registration_steps.filter(
    (s) => s.step_number !== activeStep?.step_number,
  );

  return (
    <div className="min-h-screen bg-warm-cream pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="container max-w-2xl lg:max-w-none flex items-center gap-3 h-14">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center lg:hidden"
            aria-label="Bumalik"
          >
            <ArrowLeft className="w-5 h-5 text-earth-brown" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-[var(--font-display)] text-sm font-bold text-earth-brown truncate">Lakad Roadmap</h1>
            <p className="text-[10px] text-muted-foreground font-[var(--font-mono)]">Lungsod ng Maynila • Sole Proprietorship</p>
          </div>
          <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
            <SheetTrigger asChild>
              <button
                className="relative p-2 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Buksan ang tools"
              >
                <LayoutGrid className="w-5 h-5 text-earth-brown" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-mango" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="rounded-t-2xl bg-warm-cream border-t-0 max-h-[85vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
            >
              <SheetHeader className="pb-2">
                <SheetTitle className="font-[var(--font-display)] text-base text-earth-brown">
                  Lahat ng Tools
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Mabilisang access sa lahat ng features.
                </SheetDescription>
              </SheetHeader>
              <div className="p-4 pt-2 grid grid-cols-2 gap-3">
                {TOOLS.map(({ path, icon: Icon, iconBg, iconColor, title, desc }) => (
                  <button
                    key={path}
                    onClick={() => { setToolsOpen(false); navigate(path); }}
                    className="bg-white rounded-xl border border-border p-3.5 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left min-h-[88px]"
                  >
                    <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mb-2.5`}>
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <h4 className="font-[var(--font-display)] text-xs font-bold text-earth-brown">{title}</h4>
                    <p className="text-[10px] text-earth-brown/70 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Combined sticky progress (under header) */}
      <ProgressCombined
        completedSteps={completedSteps}
        totalSteps={manilaData.registration_steps.length}
        remainingCost={remainingCost}
        firstIncompleteNumber={firstIncomplete?.step_number}
      />

      {/* ── Active Step ── */}
      {activeStep && (
        <div className="container max-w-2xl lg:max-w-3xl mt-4">
          <div className="relative">
            <StepCard
              step={activeStep}
              index={activeStep.step_number - 1}
              isCompleted={false}
              isActive={true}
              isLocked={false}
              checkedReqs={checkedReqs}
              onToggleReq={toggleReq}
              onMarkComplete={() => markStepComplete(activeStep.step_number)}
              onLockedTap={() => handleLockedTap(activeStep.step_number)}
              profile={profile ?? null}
              defaultExpanded={false}
            />
          </div>
        </div>
      )}

      {/* All-done celebration */}
      {!activeStep && (
        <div className="container max-w-2xl lg:max-w-3xl mt-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-success/10 border border-success/30 rounded-2xl p-6 text-center"
          >
            <Sparkles className="w-10 h-10 text-success mx-auto mb-3" />
            <h2 className="font-[var(--font-display)] text-lg font-bold text-earth-brown mb-1">Tapos na lahat!</h2>
            <p className="text-sm text-earth-brown/80">Lahat ng 5 hakbang kumpleto na. Mabuhay! 🎉</p>
          </motion.div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      {activeStep && <QuickActions navigate={navigate} />}

      {/* ── Remaining Steps ── */}
      <SectionDivider label="Lahat ng Hakbang" />
      <div className="container max-w-2xl lg:max-w-3xl">
        <div className="relative">
          {remainingSteps.map((step) => {
            const i = step.step_number - 1;
            const isCompleted = completedSteps.has(step.step_number);
            const prevCompleted =
              step.step_number === 1 ||
              completedSteps.has(step.step_number - 1);
            const isLocked = !prevCompleted && !isCompleted;
            return (
              <StepCard
                key={step.step_number}
                step={step}
                index={i}
                isCompleted={isCompleted}
                isActive={false}
                isLocked={isLocked}
                checkedReqs={checkedReqs}
                onToggleReq={toggleReq}
                onMarkComplete={() => markStepComplete(step.step_number)}
                onLockedTap={() => handleLockedTap(step.step_number)}
                profile={profile ?? null}
              />
            );
          })}
        </div>
      </div>

      {/* ── Grants teaser → /grants ── */}
      <SectionDivider label="Tulong-Pinansyal" />
      <div className="container max-w-2xl lg:max-w-3xl">
        <button
          onClick={() => navigate("/grants")}
          className="w-full bg-gradient-to-r from-mango/20 to-mango-light rounded-2xl border border-mango/30 p-4 shadow-sm hover:shadow-md active:scale-[0.99] transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-mango/25 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-mango" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-[var(--font-display)] text-sm font-bold text-earth-brown leading-snug">
                {manilaData.grants_and_programs.length} programa baka pwede mo ma-claim
              </h3>
              <p className="text-[11px] text-earth-brown/80 mt-0.5">
                BMBE tax exemption, DOLE Nego-Kart, SB Corp loan
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-mango shrink-0" />
          </div>
        </button>
      </div>

      {/* ── Rating ── */}
      {completedSteps.size >= 3 && (
        <div className="container max-w-2xl lg:max-w-3xl mt-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border p-5 shadow-sm text-center">
            <h3 className="font-[var(--font-display)] text-sm font-bold text-earth-brown mb-1">Kumusta ang Lakad Roadmap?</h3>
            <p className="text-xs text-earth-brown/80 mb-4">
              {ratingSubmitted ? "Salamat sa rating mo! Nakakatulong ito." : "I-rate ang guide na ito para makapag-improve kami."}
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={ratingSubmitted}
                  onClick={() => {
                    setRating(star);
                    setRatingSubmitted(true);
                    feedbackMutation.mutate({ feedbackType: "general", lguId: "manila_city", message: `Roadmap rating: ${star}/5 stars` });
                    toast.success(`Salamat! ${star}/5 ⭐`);
                  }}
                  onMouseEnter={() => !ratingSubmitted && setHoverRating(star)}
                  onMouseLeave={() => !ratingSubmitted && setHoverRating(0)}
                  className="transition-transform hover:scale-110 disabled:cursor-default min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`${star} stars`}
                >
                  <Star className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating) ? "text-mango fill-mango" : "text-muted-foreground/30"}`} />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Footer with Report issue ── */}
      <footer className="container max-w-2xl lg:max-w-3xl mt-10 mb-4">
        <div className="border-t border-border/50 pt-4 flex flex-col items-center gap-2">
          <button
            onClick={() => setShowFeedback(true)}
            className="inline-flex items-center gap-2 text-xs text-jeepney-red font-medium underline-offset-4 hover:underline min-h-[44px] px-3"
          >
            <Flag className="w-3.5 h-3.5" />
            May mali ba? I-report dito
          </button>
          <p className="text-[10px] text-muted-foreground/70 text-center">
            Outdated info, incorrect data, o suggestions
          </p>
        </div>
      </footer>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowFeedback(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[var(--font-display)] text-lg font-bold text-earth-brown">Report / Feedback</h2>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="p-2 rounded-xl hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {([
                  { value: "outdated_info", label: "Outdated Info" },
                  { value: "incorrect_data", label: "Incorrect Data" },
                  { value: "suggestion", label: "Suggestion" },
                  { value: "general", label: "General" },
                ] as const).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFeedbackType(type.value)}
                    className={`text-xs font-semibold px-3 py-2 rounded-full border transition-all min-h-[36px] ${
                      feedbackType === type.value
                        ? "bg-teal/10 text-teal border-teal/30"
                        : "bg-white text-earth-brown/80 border-border hover:border-teal/30"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <select
                value={feedbackStep ?? ""}
                onChange={(e) => setFeedbackStep(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-base focus:outline-none focus:ring-2 focus:ring-teal/40 mb-3 min-h-[48px]"
              >
                <option value="">General (walang specific step)</option>
                {manilaData.registration_steps.map((s) => (
                  <option key={s.step_number} value={s.step_number}>Step {s.step_number}: {s.title}</option>
                ))}
              </select>
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Describe the issue or suggestion..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-base focus:outline-none focus:ring-2 focus:ring-teal/40 mb-3 resize-none"
              />
              <label className="flex items-start gap-2.5 mb-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shareToCommunity}
                  onChange={(e) => setShareToCommunity(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-teal shrink-0"
                />
                <span className="text-xs text-earth-brown leading-snug">
                  I-share din sa <span className="font-semibold">Negosyante Hub</span> bilang
                  {" "}<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-jeepney-red/10 text-jeepney-red text-[10px] font-bold">
                    <Flag className="w-2.5 h-2.5" /> Warning
                  </span>{" "}
                  para mawarn ang ibang negosyante.
                </span>
              </label>
              <Button
                onClick={() => {
                  if (!feedbackMessage.trim()) return;
                  feedbackMutation.mutate({
                    feedbackType,
                    stepNumber: feedbackStep,
                    lguId: "manila_city",
                    message: feedbackMessage,
                    shareToCommunity,
                  });
                }}
                disabled={!feedbackMessage.trim() || feedbackMutation.isPending}
                className="w-full h-12 bg-teal hover:bg-teal/90 text-white font-[var(--font-display)] rounded-xl"
              >
                <Send className="w-4 h-4 mr-2" />
                {feedbackMutation.isPending ? "Sending..." : "Submit Feedback"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatFab />
    </div>
  );
}
