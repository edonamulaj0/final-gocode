"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react"; // NextAuth signIn import - requires next-auth installed
import { useSearchParams } from "next/navigation"; // Next.js useSearchParams import - requires next installed
import Link from "next/link"; // Next.js Link component import - requires next installed

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  useEffect(() => {
    const success = searchParams.get("success");
    const message = searchParams.get("message");
    if (success) {
      setSuccessMessage(success);
    } else if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else {
        window.location.href = "/?page=dashboard";
      }
    } catch (err) {
      console.error("Sign-in process error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4"
      style={{
        background:
          "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
      }}
    >
      <div
        className="w-full max-w-sm p-8 space-y-6 rounded-xl"
        style={{
          background: "rgba(10, 61, 82, 0.7)",
          backdropFilter: "blur(20px)", // Increased blur for more glassmorphism
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 8px 60px rgba(0, 0, 0, 0.4)",
          color: "var(--secondary)",
        }}
      >
        <div className="text-center">
          <h1
            className="text-2xl font-bold mastermore-title"
            style={{ color: "var(--secondary)" }}
          >
            Sign in to your account
          </h1>
          <p
            className="mt-2 text-sm mastermore-subtitle"
            style={{ color: "rgba(248, 245, 233, 0.8)" }}
          >
            Welcome back! Please enter your details.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {successMessage && (
            <div className="text-sm text-center text-green-600 bg-green-50 p-3 rounded-md">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium"
              style={{ color: "var(--secondary)" }}
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-2 mt-1 text-sm"
              style={{
                background: "rgba(8, 44, 58, 0.5)", // Darker transparent input background
                border: "1px solid rgba(255, 255, 255, 0.2)", // Lighter border
                borderRadius: "0.4rem",
                color: "var(--secondary)",
                transition: "all 0.2s ease",
              }}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password input field group. */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
                style={{ color: "var(--secondary)" }}
              >
                Password
              </label>
              <a
                href="#"
                className="text-sm font-medium"
                style={{
                  color: "var(--secondary)",
                  opacity: 0.8,
                  textDecoration: "underline",
                }}
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-2 mt-1 text-sm"
              style={{
                background: "rgba(8, 44, 58, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "0.4rem",
                color: "var(--secondary)",
                transition: "all 0.2s ease",
              }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Sign-in button. */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary glass-button w-full py-4 px-6 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[rgba(248,245,233,0.3)] border-t-[rgba(248,245,233,1)] rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign in</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <p
            className="text-gray-600"
            style={{ color: "rgba(248, 245, 233, 0.7)" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium"
              style={{
                color: "var(--secondary)",
                textDecoration: "underline",
                opacity: 0.9,
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
