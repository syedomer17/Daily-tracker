import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Secure authentication and sign-in to access your personal Deen & Dunya tracker.",
  openGraph: {
    title: "Sign In | DeenSync",
    description:
      "Secure authentication to access your personal Deen & Dunya tracking workspace.",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
