"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");
  const [loading, setLoading] = useState(false);

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
        return "Server authentication configuration error. Check your AUTH_SECRET and GitHub OAuth credentials.";
      default:
        return "An unexpected authentication error occurred. Please try again.";
    }
  };

  const errorMessage = getErrorMessage(errorParam);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-md space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-500 shadow-xl shadow-emerald-500/20">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Deen & Dunya Tracker
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Daily routine, Salah, DSA & career milestones tracked in one secure place.
          </p>
        </div>

        {/* Authentication Card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-6 sm:p-8 shadow-xl shadow-zinc-950/5 backdrop-blur transition-all">
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">Authentication Error</span>
                <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGitHubLogin}
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-900 dark:bg-white px-5 py-3.5 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition shadow-lg shadow-zinc-900/10 disabled:opacity-60"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <svg
                  className="h-5 w-5 fill-current"
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
              <span>{loading ? "Connecting to GitHub..." : "Continue with GitHub"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 font-mono text-[10px]">
                  Protected Multi-Tenant Architecture
                </span>
              </div>
            </div>

            {/* Security Guarantee List */}
            <div className="space-y-2.5 pt-1 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Isolated personal database record — zero shared state</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Encrypted Auth.js session cookies & strict server validation</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Automatic cloud sync for Salah, habits & deep work logs</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-rose-500 shrink-0" />
                <span>Preserves your streaks and target July 2027 milestone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 font-mono">
          Deen & Dunya Tracker &bull; Production Security &bull; Next.js 16
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
