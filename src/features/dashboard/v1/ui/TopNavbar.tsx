import { memo } from "react";
import {
  Bell,
  CircleHelp,
  LogOut,
} from "lucide-react";
import useAuthStorage from "../../../login/v1/hooks/useAuthStorage";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function TopNavbar() {
  const user = useAuthStorage((state) => state.user);
  const logout = useAuthStorage((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.info("Signed out of Eduvanta Admin Session.");
  };

  return (
    <>
      <header className="sticky top-0 z-20 py-3 px-4 sm:px-6 bg-[#08090D]/95 backdrop-blur-md border-b border-zinc-800/80 flex items-center justify-end gap-4">
        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
    
          

          {/* Notifications */}
          <button
            onClick={() => toast.info("No unread alerts in administrative queue. All pipelines normal.")}
            className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700/80 transition"
            title="Notification Center"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-[#08090D]"></span>
          </button>

          {/* Help Desk */}
          <button
            onClick={() =>
              toast.info("Eduvanta Support: support@eduvanta.edu | Hotline: +91 6202665784")
            }
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700/80 transition"
            title="Institutional Help Desk"
          >
            <CircleHelp size={16} />
          </button>

          {/* User Profile Capsule */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-zinc-800">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-indigo-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">
                {user?.name || "Prof. R. K. Sharma"}
              </p>
              <p className="text-[10px] text-zinc-400 leading-tight">
                {user?.role === "super admin" || user?.role === "super_admin" || user?.email?.toLowerCase() === "admin@gmail.com"
                  ? "Super Administrator"
                  : "Institutional Admin"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition ml-1"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      
    </>
  );
}

export default memo(TopNavbar);
