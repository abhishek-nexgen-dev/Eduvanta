import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import useLoginForm from "../hooks/useLoginForm";
import useLogin from "../hooks/useLogin";
import { getErrorMessage } from "../../../../Utils/api.utils";

import { AuthFooter } from "./AuthFooter";
import Input from "../../../../Components/Input";
import useAuthStorage from "../hooks/useAuthStorage";
import { EDUVANTA_LOGO_LOCAL, EDUVANTA_LOGO_URL } from "../../../../constant/logo.constant";

export function LoginCard() {
  const { watch, setValue, formState, handleSubmit } = useLoginForm();
  const { errors } = formState;
  const [email, setEmail] = useState(watch("email") || "");
  const [password, setPassword] = useState(watch("password") || "");
  const [showPassword, setShowPassword] = useState(false);
  const [autofilled, setAutofilled] = useState(false);

  const loginMutation = useLogin();
  const navigate = useNavigate();

  const TEST_CREDENTIALS = {
    email: "admin@gmail.com",
    password: "Admin@123",
  };

  const fillTestCredentials = () => {
    setValue("email", TEST_CREDENTIALS.email, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("password", TEST_CREDENTIALS.password, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setEmail(TEST_CREDENTIALS.email);
    setPassword(TEST_CREDENTIALS.password);
    setAutofilled(true);
    toast.info("Demo credentials loaded! Click 'Sign In to Terminal' to proceed.");
  };

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const res = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      const user = res?.data?.user || res?.user;
      const userRole = (user?.role || "").toLowerCase();
      const isAllowedAdmin =
        userRole === "admin" ||
        userRole === "super admin" ||
        userRole === "super_admin" ||
        data.email.toLowerCase() === "admin@gmail.com";

      if (user && user.role && !isAllowedAdmin) {
        toast.error("You are not authorized to access this portal.");
        return;
      }

      toast.success("Credentials clearance verified! Entering terminal...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 600);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Login failed. Please check your credentials."));
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-zinc-800/90 bg-[#0A0B10]/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-6 sm:p-8 relative overflow-hidden transition-all duration-300">
      {/* Top subtle highlight glow line & ambient light */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <Header />

      {/* Demo Credentials Quick Fill Banner */}
      <div className="mt-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-zinc-900/40 p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <KeyRound size={15} />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white">Default Admin</span>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-1.5 py-0.2 rounded border border-indigo-500/30">
                SuperAdmin
              </span>
              {autofilled && (
                <span className="flex items-center text-[10px] text-emerald-400 font-semibold gap-0.5">
                  <CheckCircle2 size={11} /> Loaded
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 font-mono truncate">
              admin@gmail.com • Admin@123
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fillTestCredentials}
          className="group px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all duration-150 active:scale-95 shrink-0 flex items-center gap-1.5"
          title="Autofill standard test credentials"
        >
          <Sparkles
            size={12}
            className="text-indigo-200 transition-transform group-hover:rotate-12"
          />
          <span>Autofill</span>
        </button>
      </div>

      {/* Login Form */}
      <form className="space-y-4 sm:space-y-5 mt-6" onSubmit={handleSubmit(onSubmit)}>
        <Input
          name="email"
          label="Institutional Email"
          placeholder="admin@gmail.com"
          type="email"
          value={email}
          leftIcon={<Mail size={16} />}
          onChange={(_name, value) => {
            setValue("email", value);
            setEmail(value);
          }}
          error={errors.email?.message}
          readonly={false}
          autoComplete="email"
        />

        <Input
          name="password"
          label="Security Password"
          placeholder="Enter access password"
          type={showPassword ? "text" : "password"}
          value={password}
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-zinc-500 hover:text-zinc-300 p-1 focus:outline-none transition"
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          onChange={(_name, value) => {
            setValue("password", value);
            setPassword(value);
          }}
          error={errors.password?.message}
          readonly={false}
          autoComplete="current-password"
        />

        <Options />

        <SignInButton loading={loginMutation.isPending} />
      </form>

      {/* Helpdesk & Legal Footer */}
      <AuthFooter />
    </div>
  );
}

function Header() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-auto max-w-[220px] items-center justify-center mb-3">
        <img
          src={EDUVANTA_LOGO_LOCAL}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = EDUVANTA_LOGO_URL;
          }}
          alt="Eduvanta Logo"
          className="h-16 w-auto max-w-full object-contain drop-shadow-[0_4px_16px_rgba(99,102,241,0.25)]"
        />
      </div>

     

      <p className="mt-1 text-xs sm:text-sm text-zinc-400">
        Where Knowledge Finds Its Future • Institutional Governance Terminal
      </p>
    </div>
  );
}

function Options() {
  const isRememberMe = useAuthStorage((state) => state.isRememberMe);
  const setIsRememberMe = useAuthStorage((state) => state.setIsRememberMe);

  const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsRememberMe(event.target.checked);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
      <label className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 cursor-pointer select-none transition">
        <input
          type="checkbox"
          checked={isRememberMe}
          onChange={handleRememberMeChange}
          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
        />
        <span>Remember this workstation</span>
      </label>

      <Link
        to="/forgot-password"
        className="font-medium text-indigo-400 hover:text-indigo-300 transition underline-offset-4 hover:underline"
      >
        Forgot Password?
      </Link>
    </div>
  );
}

function SignInButton({ loading }: { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
      group
      h-12
      w-full
      rounded-xl
      bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400
      font-semibold
      text-xs sm:text-sm
      text-white
      shadow-xl shadow-indigo-600/25
      transition-all duration-200
      active:scale-[0.99]
      disabled:opacity-60 disabled:cursor-not-allowed
      flex items-center justify-center gap-2
    "
    >
      {loading ? (
        <>
          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Authenticating Clearance...</span>
        </>
      ) : (
        <>
          <ShieldCheck
            size={17}
            className="text-indigo-200 transition-transform group-hover:scale-110"
          />
          <span>Sign In to Terminal</span>
          <ArrowRight
            size={15}
            className="text-indigo-300 transition-transform group-hover:translate-x-0.5"
          />
        </>
      )}
    </button>
  );
}
