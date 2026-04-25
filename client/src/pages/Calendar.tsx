/*
 * NegosyoNav — Renewal & Deadline Calendar (Feature 09)
 * Tracks renewal deadlines for Mayor's Permit, BIR filings, DTI renewal.
 * Shows upcoming deadlines with countdown and reminders.
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar as CalendarIcon, Plus, Clock, AlertTriangle,
  CheckCircle2, ChevronRight, FileText, Building2, Landmark, Trash2, X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Deadline {
  id: string;
  title: string;
  titleTl: string;
  agency: string;
  dueDate: Date;
  frequency: string;
  penalty: string;
  reminderDays: number;
  icon: React.ElementType;
  color: string;
  tips: string[];
  custom?: boolean;
  notes?: string;
}

function getNextOccurrence(month: number, day: number): Date {
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), month - 1, day);
  if (thisYear > now) return thisYear;
  return new Date(now.getFullYear() + 1, month - 1, day);
}

function getDaysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function Calendar() {
  const [, navigate] = useLocation();
  const [expandedDeadline, setExpandedDeadline] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAgency, setNewAgency] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newDate, setNewDate] = useState("");

  const { data: remindersData, refetch: refetchReminders } = trpc.reminders.list.useQuery();
  const createReminder = trpc.reminders.create.useMutation({
    onSuccess: () => {
      refetchReminders();
      setShowCreateForm(false);
      setNewTitle(""); setNewAgency(""); setNewNotes(""); setNewDate("");
    },
  });
  const deleteReminder = trpc.reminders.delete.useMutation({
    onSuccess: () => refetchReminders(),
  });

  const customDeadlines: Deadline[] = useMemo(() => {
    if (!remindersData) return [];
    return remindersData.map(r => ({
      id: `custom_${r.id}`,
      title: r.title,
      titleTl: r.title,
      agency: r.agency ?? "Custom reminder",
      dueDate: new Date(r.dueDate),
      frequency: "One-time",
      penalty: "—",
      reminderDays: 7,
      icon: CalendarIcon,
      color: "teal",
      tips: r.notes ? [r.notes] : [],
      custom: true,
      notes: r.notes ?? undefined,
    }));
  }, [remindersData]);

  const handleCreate = () => {
    if (!newTitle.trim() || !newDate) return;
    createReminder.mutate({
      title: newTitle.trim(),
      agency: newAgency.trim() || undefined,
      notes: newNotes.trim() || undefined,
      dueDate: new Date(newDate).toISOString(),
    });
  };

  const handleDelete = (deadline: Deadline) => {
    if (!deadline.custom) return;
    const realId = deadline.id.replace(/^custom_/, "");
    deleteReminder.mutate({ id: realId });
  };

  // Assume registration was done this year — deadlines are calculated from now
  const deadlines: Deadline[] = useMemo(() => [
    {
      id: "mayors_permit",
      title: "Mayor's Permit Renewal",
      titleTl: "Pag-renew ng Mayor's Permit",
      agency: "Bureau of Permits, Manila City Hall",
      dueDate: getNextOccurrence(1, 20), // January 20 every year
      frequency: "Annually (every January 20)",
      penalty: "25% surcharge + 2% monthly interest on late renewal",
      reminderDays: 30,
      icon: Landmark,
      color: "jeepney-red",
      tips: [
        "Start renewal process in December to avoid January rush",
        "Go to E-BOSS Lounge for faster processing",
        "Bring previous year's permit, updated Barangay Clearance, and Cedula",
        "Online appointment available at manila.gov.ph",
      ],
    },
    {
      id: "barangay_clearance",
      title: "Barangay Clearance Renewal",
      titleTl: "Pag-renew ng Barangay Clearance",
      agency: "Barangay Hall",
      dueDate: getNextOccurrence(1, 10), // Before Mayor's Permit
      frequency: "Annually (before Mayor's Permit renewal)",
      penalty: "Cannot renew Mayor's Permit without valid Barangay Clearance",
      reminderDays: 45,
      icon: Building2,
      color: "teal",
      tips: [
        "Renew before Mayor's Permit — it's a prerequisite",
        "Some barangays allow renewal starting December",
        "Bring previous clearance and DTI Certificate",
      ],
    },
    {
      id: "bir_quarterly_q1",
      title: "BIR Quarterly Filing (Q1)",
      titleTl: "BIR Quarterly Filing — Unang Quarter",
      agency: "Bureau of Internal Revenue",
      dueDate: getNextOccurrence(4, 15), // April 15
      frequency: "Quarterly",
      penalty: "25% surcharge + 12% interest per annum on late filing",
      reminderDays: 14,
      icon: FileText,
      color: "mango",
      tips: [
        "Use BIR Form 1701Q for quarterly income tax",
        "File via eBIRForms or ORUS (orus.bir.gov.ph)",
        "Keep all receipts and invoices organized",
      ],
    },
    {
      id: "bir_quarterly_q2",
      title: "BIR Quarterly Filing (Q2)",
      titleTl: "BIR Quarterly Filing — Ikalawang Quarter",
      agency: "Bureau of Internal Revenue",
      dueDate: getNextOccurrence(8, 15), // August 15
      frequency: "Quarterly",
      penalty: "25% surcharge + 12% interest per annum on late filing",
      reminderDays: 14,
      icon: FileText,
      color: "mango",
      tips: [
        "Use BIR Form 1701Q",
        "If using 8% flat tax, still file quarterly returns",
      ],
    },
    {
      id: "bir_quarterly_q3",
      title: "BIR Quarterly Filing (Q3)",
      titleTl: "BIR Quarterly Filing — Ikatlong Quarter",
      agency: "Bureau of Internal Revenue",
      dueDate: getNextOccurrence(11, 15), // November 15
      frequency: "Quarterly",
      penalty: "25% surcharge + 12% interest per annum on late filing",
      reminderDays: 14,
      icon: FileText,
      color: "mango",
      tips: [
        "Use BIR Form 1701Q",
        "Start preparing documents early for annual filing",
      ],
    },
    {
      id: "bir_annual",
      title: "BIR Annual Income Tax Return",
      titleTl: "BIR Annual Income Tax Return",
      agency: "Bureau of Internal Revenue",
      dueDate: getNextOccurrence(4, 15), // April 15
      frequency: "Annually (April 15)",
      penalty: "25% surcharge + 12% interest per annum",
      reminderDays: 30,
      icon: FileText,
      color: "jeepney-red",
      tips: [
        "Use BIR Form 1701 for self-employed individuals",
        "BMBE-registered businesses may be exempt from income tax",
        "File via eBIRForms or ORUS",
        "Deadline is same as Q1 quarterly — file both together",
      ],
    },
    {
      id: "dti_renewal",
      title: "DTI Business Name Renewal",
      titleTl: "Pag-renew ng DTI Business Name",
      agency: "Department of Trade and Industry",
      dueDate: (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 5);
        return d;
      })(),
      frequency: "Every 5 years",
      penalty: "Business name may be released for others to register",
      reminderDays: 60,
      icon: FileText,
      color: "teal",
      tips: [
        "Renew online at bnrs.dti.gov.ph",
        "Same fee as initial registration",
        "Can renew up to 6 months before expiry",
      ],
    },
    {
      id: "cedula",
      title: "Community Tax Certificate (Cedula)",
      titleTl: "Community Tax Certificate (Cedula)",
      agency: "Manila City Treasurer's Office",
      dueDate: getNextOccurrence(1, 31), // January 31
      frequency: "Annually (by January 31)",
      penalty: "Penalty of 24% per annum on late payment",
      reminderDays: 30,
      icon: Landmark,
      color: "teal",
      tips: [
        "Available online at cedula.ctomanila.com",
        "Needed for Mayor's Permit renewal",
        "Bring previous year's cedula for reference",
      ],
    },
  ], []);

  // Sort by nearest deadline (built-in + custom Firestore reminders)
  const sorted = [...deadlines, ...customDeadlines].sort((a, b) => getDaysUntil(a.dueDate) - getDaysUntil(b.dueDate));

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return "bg-jeepney-red/10 text-jeepney-red border-jeepney-red/30";
    if (days <= 30) return "bg-mango-light text-earth-brown border-mango/30";
    return "bg-teal-light text-teal border-teal/30";
  };

  const getUrgencyLabel = (days: number) => {
    if (days <= 0) return "OVERDUE";
    if (days <= 7) return "THIS WEEK";
    if (days <= 30) return "THIS MONTH";
    if (days <= 90) return "UPCOMING";
    return "LATER";
  };

  return (
    <div className="min-h-screen bg-warm-cream pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="container flex items-center gap-3 h-14">
          <button onClick={() => navigate("/roadmap")} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-earth-brown" />
          </button>
          <div className="flex-1">
            <h1 className="font-[var(--font-display)] text-sm text-earth-brown">Renewal & Deadline Calendar</h1>
            <p className="text-[10px] text-muted-foreground font-[var(--font-mono)]">Never miss a renewal or filing deadline</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="h-10 px-3 rounded-xl bg-teal text-white flex items-center gap-1.5 text-xs font-semibold hover:bg-teal/90 active:scale-[0.98] transition"
            aria-label="Add reminder"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Add</span>
          </button>
        </div>
      </header>

      <div className="container max-w-2xl mt-4 space-y-4">
        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-teal" />
            <div>
              <h3 className="font-[var(--font-display)] text-sm text-earth-brown">
                {sorted.filter(d => getDaysUntil(d.dueDate) <= 30).length} deadline{sorted.filter(d => getDaysUntil(d.dueDate) <= 30).length !== 1 ? "s" : ""} within 30 days
              </h3>
              <p className="text-xs text-muted-foreground">
                Next deadline: <span className="font-semibold text-earth-brown">{sorted[0]?.title}</span> in {getDaysUntil(sorted[0]?.dueDate)} days
              </p>
            </div>
          </div>
        </motion.div>

        {/* Deadline cards */}
        {sorted.map((deadline, i) => {
          const days = getDaysUntil(deadline.dueDate);
          const isExpanded = expandedDeadline === deadline.id;
          const Icon = deadline.icon;

          return (
            <motion.div
              key={deadline.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${days <= 30 ? "border-mango/30" : "border-border"}`}
            >
              <button onClick={() => setExpandedDeadline(isExpanded ? null : deadline.id)} className="w-full text-left p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    days <= 7 ? "bg-jeepney-red/10" : days <= 30 ? "bg-mango-light" : "bg-teal/10"
                  }`}>
                    <Icon className={`w-5 h-5 ${days <= 7 ? "text-jeepney-red" : days <= 30 ? "text-mango" : "text-teal"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-[var(--font-mono)] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getUrgencyColor(days)}`}>
                        {getUrgencyLabel(days)}
                      </span>
                      <span className="text-[10px] font-[var(--font-mono)] text-muted-foreground">
                        {days <= 0 ? "OVERDUE" : `${days} days`}
                      </span>
                    </div>
                    <h3 className="font-[var(--font-display)] text-sm text-earth-brown leading-snug">{deadline.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(deadline.dueDate)}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>
              </button>

              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
                    <div className="text-xs text-muted-foreground italic">{deadline.titleTl}</div>

                    <div className="flex items-center gap-2 text-xs text-earth-brown">
                      <Clock className="w-4 h-4 text-teal" />
                      <span><span className="font-semibold">Frequency:</span> {deadline.frequency}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-earth-brown">
                      <Building2 className="w-4 h-4 text-teal" />
                      <span><span className="font-semibold">Agency:</span> {deadline.agency}</span>
                    </div>

                    {/* Penalty warning */}
                    <div className="bg-jeepney-red/5 rounded-xl p-3 border border-jeepney-red/20">
                      <p className="text-xs text-earth-brown flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-jeepney-red shrink-0 mt-0.5" />
                        <span><span className="font-semibold">Late Penalty:</span> {deadline.penalty}</span>
                      </p>
                    </div>

                    {/* Tips */}
                    {deadline.tips.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-earth-brown mb-2">
                          {deadline.custom ? "Notes:" : "Tips:"}
                        </h4>
                        <ul className="space-y-1.5">
                          {deadline.tips.map((tip, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {deadline.custom && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(deadline); }}
                        disabled={deleteReminder.isPending}
                        className="flex items-center gap-1.5 text-xs text-jeepney-red hover:underline min-h-11 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete reminder
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Create Reminder Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 max-h-[85dvh] overflow-y-auto overscroll-contain"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg text-foreground font-[var(--font-display)]">
                  Bagong Reminder
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 rounded-xl hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Title</p>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Hal: SSS quarterly contribution"
                className="w-full px-4 h-14 rounded-xl bg-muted border border-border text-base focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4"
              />

              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Due Date</p>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="block w-full min-w-0 appearance-none px-4 h-14 rounded-xl bg-muted border border-border text-base focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4"
              />

              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Agency (optional)</p>
              <input
                type="text"
                value={newAgency}
                onChange={(e) => setNewAgency(e.target.value)}
                placeholder="Hal: SSS, BIR, City Hall"
                className="w-full px-4 h-14 rounded-xl bg-muted border border-border text-base focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4"
              />

              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Notes (optional)</p>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Mga detalye o paalala..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-base focus:outline-none focus:ring-2 focus:ring-primary/40 mb-5 resize-none"
              />

              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newDate || createReminder.isPending}
                className="w-full h-14 bg-teal hover:bg-teal/90 text-white font-bold text-base rounded-xl font-[var(--font-display)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                {createReminder.isPending ? "Sino-save..." : "I-save Reminder"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
