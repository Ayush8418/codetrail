import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/lib/model/User";
import connectDB from "@/lib/dbConnect";

// ---------------------------
// AUTH CONFIG
export const authOptions: NextAuthOptions = {
  providers: [
    // GOOGLE OAUTH PROVIDER
    GoogleProvider({
      // OAuth client credentials from Google Cloud Console
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // GITHUB OAUTH PROVIDER
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // Request access to both user profile and email
      authorization: { params: { scope: "read:user user:email" } },
    }),

    // CREDENTIALS PROVIDER (email + password login)
    CredentialsProvider({
      name: "Credentials",

      // Fields expected from the login form
      credentials: {
        email: { label: "Email", type: "email", placeholder: "smith@gmail.com" },
        password: { label: "Password", type: "password" },
      },

      // This runs when someone logs in using email/password
      async authorize(credentials): Promise<any> {
        try {
          // Basic validation
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please enter both email and password");
          }
          
          await connectDB();

          // Find user and include password field (hidden by default)
          const user = await UserModel
            .findOne({ email: credentials.email })
            .select("+password");

          if (!user) {
            throw new Error("No user found with this email");
          }

          // Compare entered password with hashed password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password!
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // IMPORTANT:
          // Whatever we return here becomes "user" in the jwt() callback
          return {
            id: user._id.toString(),
            name: user.username,
            email: user.email,
            picture: user.profileImage || null,
          };
        } catch (error: any) {
          console.error("Authorize error:", error);
          throw new Error(error.message || "Login failed");
        }
      },
    }),
  ],

  // Custom login page route
  pages: {
    signIn: "/auth/signin",
  },

  // Used to encrypt JWT cookies
  secret: process.env.NEXTAUTH_SECRET,

  // CALLBACKS
  callbacks: {

    // signIn() — Runs every time a user successfully logs in
    async signIn({ user, account, profile }) {
      try {
        await connectDB();

        // ---------- GOOGLE LOGIN ----------
        if (account?.provider === "google" && profile?.email) {
          // Check if user already exists
          const existingUser = await UserModel.findOne({
            email: profile.email,
          });

          // If not, create new DB entry
          if (!existingUser) {
            await UserModel.create({
              username: profile.name,
              email: profile.email,
              googleId: account.providerAccountId,
              profileImage: (profile as any).picture ?? null,
              emailVerified: (profile as any).email_verified ?? false,
            });
          }
        }

        // ---------- GITHUB LOGIN ----------
        if (account?.provider === "github" && profile) {
          // GitHub sometimes hides emails (your original code handled this)
          // Left empty for now unless you want to re-enable it
        }

        return true; // allow sign-in
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false; // block sign-in
      }
    },

    // jwt() — Runs on EVERY request after login
    async jwt({ token, user, account }) {
      try {
        // This condition is TRUE ONLY on first sign-in
        if (user?.email) {
          await connectDB();

          // Fetch full DB user (role, theme, etc.)
          const dbUser = await UserModel.findOne({ email: user.email });

          if (dbUser) {
            // Add custom fields to JWT token
            token.id = dbUser._id.toString();
            token.role = dbUser.role ?? "user";
            token.theme = dbUser.theme;
          }

          // Save provider only during sign-in
          if (account?.provider) {
            token.provider = account.provider;
          }
        }

        // Return token for browser cookie storage
        return token;
      } catch (err) {
        console.error("JWT callback error:", err);
        return token; // Never break the session
      }
    },

    // session() — Controls what the client receives
    async session({ session, token }) {
      try {
        // Copy our custom JWT fields into the session object
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.theme = token.theme as string;
          session.user.provider = token.provider as string;
        }

        return session;
      } catch (err) {
        console.error("Session callback error:", err);
        return session;
      }
    }
  },
};

// Export the handler for Next.js App Router (GET & POST)
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
