import { useLocation } from "wouter";
import {
  Sparkles,
  Map,
  FileText,
  Users,
  User,
  Award,
  CalendarDays,
  MapPin,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

const PRIMARY: NavItem[] = [
  { path: "/", icon: Sparkles, label: "Chat" },
  { path: "/roadmap", icon: Map, label: "Roadmap" },
  { path: "/forms", icon: FileText, label: "Forms" },
  { path: "/hub", icon: Users, label: "Hub" },
  { path: "/profile", icon: User, label: "Profile" },
];

const SECONDARY: NavItem[] = [
  { path: "/grants", icon: Award, label: "Grants" },
  { path: "/calendar", icon: CalendarDays, label: "Calendar" },
  { path: "/places", icon: MapPin, label: "Places" },
  { path: "/planner", icon: ListChecks, label: "Planner" },
];

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-11",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{item.label}</span>
    </button>
  );
}

export default function DesktopSidebar() {
  const [location, navigate] = useLocation();

  const renderGroup = (items: NavItem[]) =>
    items.map((item) => (
      <NavLink
        key={item.path}
        item={item}
        active={
          item.path === "/"
            ? location === "/"
            : location === item.path || location.startsWith(item.path + "/")
        }
        onClick={() => navigate(item.path)}
      />
    ));

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-card lg:z-40">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
          N
        </div>
        <span className="font-display text-lg font-bold text-foreground">NegosyoNav</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {renderGroup(PRIMARY)}
        <div className="my-3 border-t border-border" />
        {renderGroup(SECONDARY)}
      </nav>
      <div className="px-5 py-3 border-t border-border">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Manila City · MVP</p>
      </div>
    </aside>
  );
}
