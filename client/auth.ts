import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

function cleanEnv(val?: string): string {
  if (!val) return "";
  return val.replace(/^["']|["']$/g, "").trim();
}

// Clean any accidental quotes from environment variables
if (process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = cleanEnv(process.env.NEXTAUTH_URL);
}
if (process.env.AUTH_URL) {
  process.env.AUTH_URL = cleanEnv(process.env.AUTH_URL);
}

const githubId = cleanEnv(process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID);
const githubSecret = cleanEnv(process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET);
const authSecret =
  cleanEnv(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) ||
  "fallback_secret_for_development_and_testing_environment_only_minimum_32_bytes";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: githubId,
      clientSecret: githubSecret,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: authSecret,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" && account.providerAccountId) {
        try {
          const db = await getDb();
          if (!db) {
            // If DB is offline, continue so user isn't hard-locked, using token-based id
            return true;
          }

          const users = db.collection("users");
          const providerAccountId = String(account.providerAccountId);

          // 1. Look up existing user by provider + providerAccountId
          let existingUser = await users.findOne({
            provider: "github",
            providerAccountId,
          });

          // 2. If not found by account ID, look up by email to avoid duplicates
          if (!existingUser && user.email) {
            existingUser = await users.findOne({
              email: user.email,
            });
          }

          if (existingUser) {
            // Update profile info without storing sensitive OAuth tokens
            await users.updateOne(
              { _id: existingUser._id },
              {
                $set: {
                  name: user.name ?? existingUser.name,
                  email: user.email ?? existingUser.email,
                  image: user.image ?? existingUser.image,
                  provider: "github",
                  providerAccountId,
                  updatedAt: new Date(),
                },
              }
            );
            user.id = existingUser._id.toString();
          } else {
            // Create user with stable internal ObjectId identifier
            const newUserId = new ObjectId();
            await users.insertOne({
              _id: newUserId,
              name: user.name ?? "GitHub User",
              email: user.email ?? null,
              image: user.image ?? null,
              provider: "github",
              providerAccountId,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            user.id = newUserId.toString();
          }
        } catch (error) {
          console.error("Error in signIn user mapping:", error);
          // Allow sign in to succeed even if db fails temporarily
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
