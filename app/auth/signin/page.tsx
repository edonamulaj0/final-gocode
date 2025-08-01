"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize search params.
  const searchParams = useSearchParams();

  // Check for success message from signup
  useEffect(() => {
    const success = searchParams.get("success");
    const message = searchParams.get("message");
    if (success) {
      setSuccessMessage(success);
    } else if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  // Function to handle form submission.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage(""); // Clear success message when attempting to sign in

    try {
      // Call the NextAuth signIn function with credentials.
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // If there's an error, set the error message.
        setError("Invalid credentials");
      } else {
        // If sign-in is successful, redirect to the dashboard
        window.location.href = "/?page=dashboard"; // Redirect to dashboard
      }
    } catch {
      // Handle unexpected errors during the sign-in process.
      setError("Something went wrong");
    } finally {
      // Reset loading state.
      setLoading(false);
    }
  };

  return (
    // Main container using the light-themed styles from the previous design.
    <div className="flex items-center justify-center min-h-screen p-4 bg-white text-[#171717]">
      {/* Sign-in card container */}
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Heading section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Form element with the handleSubmit function */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Success message display */}
          {successMessage && (
            <div className="text-sm text-center text-green-600 bg-green-50 p-3 rounded-md">
              {successMessage}
            </div>
          )}

          {/* Error message display, conditionally rendered */}
          {error && (
            <div className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Email input field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="you@example.com"
              value={email} // Bind to state
              onChange={(e) => setEmail(e.target.value)} // Update state on change
            />
          </div>

          {/* Password input field */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
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
              className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="••••••••"
              value={password} // Bind to state
              onChange={(e) => setPassword(e.target.value)} // Update state on change
            />
          </div>

          {/* Sign-in button with loading state */}
          <div>
            <button
              type="submit"
              disabled={loading} // Disable button when loading
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        {/* "Don't have an account?" link */}
        <div className="text-center text-sm">
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
