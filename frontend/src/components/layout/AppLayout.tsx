import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-16 items-center gap-3 border-b px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 hover:bg-muted"
            aria-label="Navigation oeffnen"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-lg font-bold tracking-tight">KI-Navigator</span>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
