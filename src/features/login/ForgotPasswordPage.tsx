import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  KeyRound,
  Lock,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import api, { getErrorMessage } from "../../Utils/api.utils";
import { EDUVANTA_LOGO_LOCAL, EDUVANTA_LOGO_URL } from "../../constant/logo.constant";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("admin@gmail.com");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [redirectTimer, setRedirectTimer] = useState(5);

  const navigate = useNavigate();

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  // Auto-redirect timer when password reset is successful
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (step === 3) {
      interval = setInterval(() => {
        setRedirectTimer((prev) => {
          if (prev <= 1) {
            navigate("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please provide your registered institutional email.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/v1/forgot-password", {
        email: email.trim(),
      });

      toast.success(res.data?.message || `Verification code dispatched to ${email}!`);
      setStep(2);
      setResendTimer(60);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to send reset code. Please verify email."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    try {
      const res = await api.post("/api/v1/forgot-password", {
        email: email.trim(),
      });
      toast.success(res.data?.message || `Fresh verification code dispatched to ${email}!`);
      setResendTimer(60);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to resend code. Please try again later."));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must contain at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/v1/validate/password", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPassword.trim(),
      });
      toast.success(res.data?.message || "Administrator password updated successfully!");
      setStep(3);
      setRedirectTimer(5);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Invalid or expired OTP code."));
    } finally {
      setLoading(false);
    }
  };

  // Password requirement checks
  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <main className="relative min-h-screen bg-[#06070B] text-white flex flex-col justify-center py-8 sm:py-12 px-3.5 sm:px-6 lg:px-8 overflow-hidden select-none">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Ambient background glow & cyber grid */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#312e810a_1px,transparent_1px),linear-gradient(to_bottom,#312e810a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_60%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-auto max-w-[200px] items-center justify-center mb-1">
            <img
              src={EDUVANTA_LOGO_LOCAL}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = EDUVANTA_LOGO_URL;
              }}
              alt="Eduvanta Logo"
              className="h-14 w-auto max-w-full object-contain drop-shadow-[0_4px_16px_rgba(99,102,241,0.25)]"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-2 shadow-sm">
              <ShieldCheck size={13} className="text-indigo-400" /> Security Clearance Recovery
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Reset Credentials
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Eduvanta Institutional Administrator Access Recovery
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                step >= 1
                  ? "bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10"
                  : "bg-zinc-900/60 text-zinc-600 border border-zinc-800/60"
              }`}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-[10px]">
                1
              </span>
              <span>Identify</span>
            </div>

            <span className="text-zinc-700 text-xs font-bold">→</span>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                step >= 2
                  ? "bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10"
                  : "bg-zinc-900/60 text-zinc-600 border border-zinc-800/60"
              }`}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-[10px]">
                2
              </span>
              <span>Verify & Reset</span>
            </div>

            <span className="text-zinc-700 text-xs font-bold">→</span>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                step >= 3
                  ? "bg-emerald-600/25 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                  : "bg-zinc-900/60 text-zinc-600 border border-zinc-800/60"
              }`}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px]">
                3
              </span>
              <span>Restored</span>
            </div>
          </div>
        </div>

        {/* Step 1: Request OTP */}
        {step === 1 && (
          <div className="rounded-3xl border border-zinc-800/90 bg-[#0A0B10]/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-6 sm:p-8 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Account Identification</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Enter your institutional administrator email address. We will generate and dispatch
                a 6-digit cryptographic verification OTP.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                  Registered Institutional Email
                </label>
                <div className="relative mt-2">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                    className="w-full pl-10 pr-3.5 py-3 bg-zinc-900/70 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Demo Default Banner */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-zinc-900/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between gap-2 shadow-inner">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle size={15} className="shrink-0 text-indigo-400" />
                  <span className="truncate">
                    Default admin: <strong className="text-white font-mono">admin@gmail.com</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmail("admin@gmail.com")}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-[11px] font-semibold text-indigo-200 hover:text-white shrink-0 transition flex items-center gap-1 active:scale-95"
                >
                  <Sparkles size={11} /> Use Default
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-indigo-600/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transmitting Authorization Code...</span>
                  </>
                ) : (
                  <>
                    <KeyRound
                      size={16}
                      className="text-indigo-200 transition-transform group-hover:scale-110"
                    />
                    <span>Send Verification Code</span>
                    <ArrowRight
                      size={15}
                      className="text-indigo-300 transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-zinc-900 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition group"
              >
                <ArrowLeft
                  size={13}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                <span>Return to Portal Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Verification Code & New Password */}
        {step === 2 && (
          <div className="rounded-3xl border border-zinc-800/90 bg-[#0A0B10]/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-6 sm:p-8 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Recipient banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
              <div className="flex items-center gap-2 min-w-0">
                <Mail size={15} className="text-indigo-400 shrink-0" />
                <span className="text-xs text-zinc-300 truncate">
                  Dispatched to: <strong className="text-white font-mono">{email}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 shrink-0 ml-2"
              >
                Change
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* OTP Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                    6-Digit Authorization Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtp("849201")}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium flex items-center gap-1"
                  >
                    <Sparkles size={11} /> Fill Demo OTP (849201)
                  </button>
                </div>
                <div className="relative">
                  <KeyRound
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full pl-10 pr-3.5 py-3 bg-zinc-900/70 border border-zinc-800 rounded-xl text-base font-mono tracking-[0.3em] text-center text-indigo-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                {/* Resend Timer */}
                <div className="mt-1.5 flex items-center justify-end text-xs text-zinc-500">
                  {resendTimer > 0 ? (
                    <span>
                      Resend code in{" "}
                      <strong className="text-zinc-400 font-mono">{resendTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                    >
                      <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                      <span>Resend Code</span>
                    </button>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                    New Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full pl-10 pr-3.5 py-3 bg-zinc-900/70 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                    Confirm New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    {showConfirmPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showConfirmPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-3.5 py-3 bg-zinc-900/70 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Requirement Checklist */}
              <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  {isMinLength ? (
                    <Check size={13} className="text-emerald-400 shrink-0" />
                  ) : (
                    <X size={13} className="text-zinc-500 shrink-0" />
                  )}
                  <span className={isMinLength ? "text-emerald-300 font-medium" : "text-zinc-400"}>
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isMatching ? (
                    <Check size={13} className="text-emerald-400 shrink-0" />
                  ) : (
                    <X size={13} className="text-zinc-500 shrink-0" />
                  )}
                  <span className={isMatching ? "text-emerald-300 font-medium" : "text-zinc-400"}>
                    Passwords match
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-[0.98]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-indigo-600/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <div className="rounded-3xl border border-emerald-500/30 bg-[#0A0B10]/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-6 sm:p-8 space-y-6 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-600/15 to-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/20 animate-pulse">
              <CheckCircle2 size={34} />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Clearance Restored!</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Your administrative credentials for{" "}
                <strong className="text-zinc-200">{email}</strong> have been successfully updated.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 font-mono">
              <span>Auto-redirecting in</span>
              <strong className="text-emerald-400 text-sm font-bold">{redirectTimer}s</strong>
            </div>

            <button
              onClick={() => navigate("/")}
              className="group w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-emerald-600/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Return to Portal Sign In</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}

        {/* Security Footer Notice */}
        <p className="text-center text-[11px] text-zinc-600">
          Eduvanta Security Protocol v4.2 • Protected by TLS 1.3 Strict & AMQP Clearance
        </p>
      </div>
    </main>
  );
}
