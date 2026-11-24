"use client";

import { useState, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Sparkles,
  Lock,
  AlertCircle,
  Clock,
  ArrowRight,
  Code2,
  Moon,
  CheckCircle2,
  Trophy,
} from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const handleGitHubLogin = async () => {
    try {
      setLoading(true);
      await signIn("github", { callbackUrl });
    } catch {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: string | null) => {
    if (!error) return null;
    switch (error) {
      case "OAuthSignin":
      case "OAuthCallbackError":
        return "Could not authenticate with GitHub. Please check your GitHub OAuth configuration in .env.";
      case "AccessDenied":
        return "Access was denied. Please allow GitHub account permissions.";
      case "Configuration":
        return "Server authentication configuration error. Check AUTH_SECRET and GitHub OAuth credentials.";
      default:
        return "An unexpected authentication error occurred. Please try again.";
    }
  };

  const errorMessage = getErrorMessage(errorParam);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 px-4 py-8 sm:px-6 lg:px-8 transition-colors">
      {/* Background Ambient Glow Gradients */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-blue-500/15 dark:bg-blue-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 dark:bg-purple-500/10 blur-[140px]" />
        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Main Card: Responsive Split Layout on Desktop, Fluid Stack on Mobile */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/75 shadow-2xl shadow-zinc-900/10 backdrop-blur-2xl transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
            {/* Left Column: Brand & Lifestyle Narrative (7 cols on lg) */}
            <div className="relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 lg:col-span-7 bg-gradient-to-br from-zinc-50/90 via-emerald-50/30 to-blue-50/20 dark:from-zinc-900/90 dark:via-emerald-950/20 dark:to-zinc-950/80 border-b lg:border-b-0 lg:border-r border-zinc-200/70 dark:border-zinc-800/70">
              {/* Brand Header */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/25 border border-emerald-500/20 bg-zinc-900">
                    <Image
                      src="/apple-touch-icon.png"
                      alt="DeenSync Logo"
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white">
                        DeenSync
                      </span>
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        Pro Tracker
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Spiritual Consistency & Technical Mastery
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
                    Build high-leverage habits for the{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">Hereafter</span> and your{" "}
                    <span className="text-blue-600 dark:text-blue-400">Tech Career</span>.
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-lg">
                    A unified daily operating system engineered for students and developers. Track your daily timetable, 5 prayers, LeetCode DSA, SQL practice, deep-work sessions, and July 2027 placement milestones.
                  </p>
                </div>

                {/* Feature Badges Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50 p-2.5 shadow-xs">
                    <Moon className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      5 Daily Prayers on time
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50 p-2.5 shadow-xs">
                    <Code2 className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      150 DSA + 100 SQL Goal
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50 p-2.5 shadow-xs">
                    <Clock className="h-4 w-4 text-purple-500 shrink-0" />
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      Focus Timer & Deep Work
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50 p-2.5 shadow-xs">
                    <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      July 2027 Career Roadmap
                    </span>
                  </div>
                </div>
              </div>

              {/* Islamic Mindset Anchor Quote */}
              <div className="pt-6 sm:pt-8 mt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <blockquote className="border-l-2 border-emerald-500 pl-3.5 space-y-1">
                  <p className="text-xs italic text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif">
                    &quot;Work for your worldly life as if you will live forever, and work for your Hereafter as if you will die tomorrow.&quot;
                  </p>
                  <cite className="text-[11px] not-italic font-semibold text-zinc-500 dark:text-zinc-400 block">
                    — Imam Ali (RA) / Islamic Wisdom
                  </cite>
                </blockquote>
              </div>
            </div>

            {/* Right Column: Secure Authentication Action (5 cols on lg) */}
            <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12 lg:col-span-5 bg-white/90 dark:bg-zinc-900/90">
              <div className="w-full max-w-sm mx-auto space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-3">
                    <Sparkles className="h-3 w-3 text-emerald-500" />
                    <span>Instant Single Sign-On</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {session?.user ? "Welcome back" : "Sign in to your account"}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {session?.user
                      ? `Signed in as ${session.user.name || session.user.email}`
                      : "Sync your routine, streaks, and progress securely"}
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold">Authentication Notice</span>
                      <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Area */}
                {status === "authenticated" && session?.user ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200">
                      <p className="font-semibold">Active Session Detected</p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                        Your account is linked and ready.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(callbackUrl)}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3.5 text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleGitHubLogin}
                      disabled={loading}
                      className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 px-5 py-3.5 text-sm font-bold text-white dark:text-zinc-950 transition-all duration-200 shadow-xl shadow-zinc-900/15 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
                    >
                      {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <svg
                          className="h-5 w-5 fill-current shrink-0"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          />
                        </svg>
                      )}
                      <span>{loading ? "Connecting securely..." : "Continue with GitHub"}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 font-mono text-[10px]">
                          Zero-Trust Architecture
                        </span>
                      </div>
                    </div>

                    {/* Trust & Privacy Checklist */}
                    <div className="space-y-2 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 p-3.5 border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Isolated tenant records in MongoDB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>HttpOnly encrypted cookie sessions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                        <span>No passwords stored — verified OAuth only</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Back to Home Link */}
                <div className="text-center pt-2">
                  <Link
                    href="/"
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  >
                    ← Explore preview dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 mt-6 font-mono">
          DeenSync &bull; Built with Next.js 16 & Auth.js &bull; Asia/Kolkata
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <span className="text-xs font-mono text-zinc-500">Loading secure portal...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
