import { Outlet } from "react-router-dom";
import { Sidebar } from "./ui/SideBar";
import { Menu } from "lucide-react";
import { useSidebarStore } from "./store/sidebar.store";
import useAuthStorage from "../../../login/v1/hooks/useAuthStorage";
import { EDUVANTA_LOGO_LOCAL, EDUVANTA_LOGO_URL } from "../../../../constant/logo.constant";

const Template = () => {
  const toggleMobile = useSidebarStore((state) => state.toggleMobile);
  const user = useAuthStorage((state) => state.user);

  return (
    <div className="flex min-h-screen w-full bg-[#06070B] text-white">
      <Sidebar />
      <div className="min-w-0 flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#08090D]/95 backdrop-blur-md border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleMobile}
              aria-label="Open navigation menu"
              className="p-2 -ml-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <img
                src={EDUVANTA_LOGO_LOCAL}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = EDUVANTA_LOGO_URL;
                }}
                alt="Eduvanta"
                className="h-full w-1/2 object-contain"
              />
         
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
            <div className="h-7 w-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Template;
