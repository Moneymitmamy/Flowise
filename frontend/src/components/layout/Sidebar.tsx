import { NavLink } from "react-router-dom";
import { LayoutDashboard, FolderKanban, PlusCircle, X } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projekte", icon: FolderKanban, label: "Projekte" },
  { to: "/projekte/neu", icon: PlusCircle, label: "Neues Projekt" },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r
          transition-transform duration-200 ease-in-out
          md:translate-x-0 md:static md:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          backgroundColor: "hsl(var(--sidebar-background))",
          color: "hsl(var(--sidebar-foreground))",
          borderColor: "hsl(var(--sidebar-border))",
        }}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b"
          style={{ borderColor: "hsl(var(--sidebar-border))" }}
        >
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: "hsl(var(--sidebar-primary))" }}
          >
            KI-Navigator
          </span>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-black/5 md:hidden"
            aria-label="Seitenleiste schliessen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[hsl(var(--sidebar-primary-foreground))] bg-[hsl(var(--sidebar-primary))]"
                    : "hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
