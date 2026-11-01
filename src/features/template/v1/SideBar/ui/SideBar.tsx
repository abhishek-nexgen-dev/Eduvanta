import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSidebarStore } from "../store/sidebar.store";
import { SidebarItem } from "./SidebarItem";
import { sidebarConfig } from "../config/sidebar.config";
import useAuthStorage from "../../../../login/v1/hooks/useAuthStorage";
import { EDUVANTA_LOGO_LOCAL, EDUVANTA_LOGO_URL } from "../../../../../constant/logo.constant";

export const Sidebar = () => {
  const { collapsed, toggleCollapse, mobileOpen, setMobileOpen } = useSidebarStore();
  const user = useAuthStorage((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    useAuthStorage.getState().logout();
    navigate("/");
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full  bg-[#08090D] border-r border-zinc-800/80">
      {/* Brand Header */}
      <div className="h-16 lg:h-20 px-4 sm:px-5 flex items-center justify-between border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-3 w-[80%] overflow-hidden ">
         
          {(!collapsed || mobileOpen) && (
            <div className="truncate  flex items-start">
              <img
              src={EDUVANTA_LOGO_LOCAL}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = EDUVANTA_LOGO_URL;
              }}
              alt="Eduvanta"
              className="h-[80%] w-[60%] object-cover"
            />
           
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          aria-label="Close menu"
        >
          <X size={22} />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`hidden lg:flex h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 items-center justify-center transition-colors ${
            collapsed ? "hidden" : ""
          }`}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {collapsed && !mobileOpen && (
        <div className="hidden lg:flex py-2 justify-center">
          <button
            onClick={toggleCollapse}
            title="Expand sidebar"
            className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 space-y-1 px-3 py-3 overflow-y-auto custom-scrollbar">
        {sidebarConfig.map((item) => (
          <div key={item.id} onClick={() => setMobileOpen(false)}>
            <SidebarItem item={item} collapsed={collapsed && !mobileOpen} />
          </div>
        ))}
      </nav>

      {/* Status & User Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 shrink-0">
        {(!collapsed || mobileOpen) && (
          <div className="mb-2 px-2.5 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-zinc-300 font-medium">AMQP RabbitMQ</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Active
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 px-1 sm:px-2">
          {!collapsed || mobileOpen ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-zinc-200 truncate">
                  {user?.name || "Prof. R. K. Sharma"}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">
                  {user?.email || "admin@gmail.com"}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="mx-auto h-8 w-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300 cursor-pointer"
              title={user?.name || "Admin"}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
          )}

          {(!collapsed || mobileOpen) && (
            <button
              onClick={handleLogout}
              title="Sign out of Admin Portal"
              className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
        hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 shrink-0
        ${collapsed ? "w-20" : "w-64 xl:w-72"}
      `}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:hidden
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {sidebarContent}
      </div>
    </>
  );
};
