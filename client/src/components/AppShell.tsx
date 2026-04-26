import { useLocation } from "wouter";
import DesktopSidebar from "./DesktopSidebar";

const NO_SHELL = ["/login", "/onboarding"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const noShell = NO_SHELL.includes(location);

  if (noShell) return <>{children}</>;

  return (
    <>
      <DesktopSidebar />
      <div className="lg:pl-64">{children}</div>
    </>
  );
}
