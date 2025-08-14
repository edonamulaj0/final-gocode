"use client";
import React, { useState } from "react";
// Next.js specific imports - these are commented out to allow compilation in environments without Next.js
// import { useRouter } from "next/navigation"; // Kept commented out for compilation
import Link from "next/link"; // Uncommented as requested
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  GraduationCap,
  Check,
} from "lucide-react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    class: "B2",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // useRouter is commented out to allow compilation in environments without Next.js
  // const router = typeof window !== 'undefined' ? useRouter() : null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          class: formData.class,
        }),
      });

      if (response.ok) {
        window.location.href =
          "/auth/signin?message=Account created successfully! Please sign in.";
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create account");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const currentPasswordStrength = passwordStrength(formData.password);

  return (
    <>
      <div
        className="flex items-center justify-center min-h-screen p-4"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-bg-start) 0%, var(--accent-bg-end) 100%)",
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse"
            style={{
              background:
                "linear-gradient(to br, rgba(60, 150, 200, 0.1), rgba(100, 80, 200, 0.1))",
            }}
          ></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000"
            style={{
              background:
                "linear-gradient(to tr, rgba(80, 200, 150, 0.1), rgba(60, 150, 200, 0.1))",
            }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500"
            style={{
              background:
                "linear-gradient(to r, rgba(200, 180, 80, 0.05), rgba(200, 80, 150, 0.05))",
            }}
          ></div>
        </div>

        {/* Main sign-up container */}
        <div
          className="w-full max-w-sm p-8 space-y-6 rounded-xl relative z-10"
          style={{
            background: "rgba(10, 61, 82, 0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 8px 60px rgba(0, 0, 0, 0.4)",
            color: "var(--secondary)",
          }}
        >
          {/* Sign-up form card */}
          <div className="space-y-6 delay-200">
            <h1
              className="text-3xl text-center font-bold mb-3"
              style={{ color: "var(--secondary-text)" }}
            >
              Join MasterMore
            </h1>
            {/* Error message */}
            {error && (
              <div
                className="glass-card p-4"
                style={{
                  border: "1px solid rgba(255, 0, 0, 0.3)",
                  background: "rgba(255, 0, 0, 0.15)",
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "rgb(255, 100, 100)" }}
                  >
                    {error}
                  </p>
                </div>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name input */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold"
                  style={{ color: "var(--secondary-text)" }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User
                      className="h-5 w-5"
                      style={{ color: "rgba(248, 245, 233, 0.5)" }}
                    />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="glass-input w-full focus:placeholder-opacity-70"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold"
                  style={{ color: "var(--secondary-text)" }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail
                      className="h-5 w-5"
                      style={{ color: "rgba(248, 245, 233, 0.5)" }}
                    />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="glass-input w-full focus:placeholder-opacity-70"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Class selection */}
              <div className="space-y-2">
                <label
                  htmlFor="class"
                  className="block text-sm font-semibold"
                  style={{ color: "var(--secondary-text)" }}
                >
                  Class Level
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <GraduationCap
                      className="h-5 w-5"
                      style={{ color: "rgba(248, 245, 233, 0.5)" }}
                    />
                  </div>
                  <select
                    id="class"
                    name="class"
                    required
                    className="glass-input w-full appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23F8F5E9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 9 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1.25rem center",
                      backgroundSize: "1.25rem 1.25rem",
                      paddingRight: "2.5rem",
                    }}
                    value={formData.class}
                    onChange={handleChange}
                  >
                    <option value="B2">B2 - Beginner</option>
                    <option value="B3">B3 - Intermediate</option>
                    <option value="M1">M1 - Advanced</option>
                    <option value="M2">M2 - Expert</option>
                  </select>
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold"
                  style={{ color: "var(--secondary-text)" }}
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock
                      className="h-5 w-5"
                      style={{ color: "rgba(248, 245, 233, 0.5)" }}
                    />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="glass-input w-full password-input focus:placeholder-opacity-70"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff
                        className="h-5 w-5"
                        style={{
                          color: "rgba(248, 245, 233, 0.5)",
                          transition: "color 0.2s",
                        }}
                      />
                    ) : (
                      <Eye
                        className="h-5 w-5"
                        style={{
                          color: "rgba(248, 245, 233, 0.5)",
                          transition: "color 0.2s",
                        }}
                      />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span
                        className="text-xs"
                        style={{ color: "rgba(248, 245, 233, 0.7)" }}
                      >
                        Password strength
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          currentPasswordStrength <= 1
                            ? "text-red-400"
                            : currentPasswordStrength === 2
                            ? "text-yellow-400"
                            : currentPasswordStrength === 3
                            ? "text-blue-400"
                            : "text-green-400"
                        }`}
                      >
                        {getPasswordStrengthText(currentPasswordStrength)}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= currentPasswordStrength
                              ? getPasswordStrengthColor(
                                  currentPasswordStrength
                                )
                              : "bg-gray-700" // Darker gray for inactive bar
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password input */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold"
                  style={{ color: "var(--secondary-text)" }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock
                      className="h-5 w-5"
                      style={{ color: "rgba(248, 245, 233, 0.5)" }}
                    />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="glass-input w-full password-input focus:placeholder-opacity-70"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff
                        className="h-5 w-5"
                        style={{
                          color: "rgba(248, 245, 233, 0.5)",
                          transition: "color 0.2s",
                        }}
                      />
                    ) : (
                      <Eye
                        className="h-5 w-5"
                        style={{
                          color: "rgba(248, 245, 233, 0.5)",
                          transition: "color 0.2s",
                        }}
                      />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="flex items-center space-x-2 mt-2">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <Check className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">
                          Passwords match
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-4 rounded-full bg-red-800/20 flex items-center justify-center">
                          <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                        </div>
                        <span className="text-xs text-red-400 font-medium">
                          Passwords don&apos;t match
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="glass-button w-full py-4 px-6 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[rgba(248,245,233,0.3)] border-t-[rgba(248,245,233,1)] rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create your account</span>
                  </>
                )}
              </button>
            </form>

            {/* Sign in link */}
            <div
              className="text-center pt-4 border-t text-sm"
              style={{ borderColor: "rgba(248, 245, 233, 0.1)" }}
            >
              <p style={{ color: "rgba(248, 245, 233, 0.7)" }}>
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="font-semibold transition-colors inline-flex items-center space-x-1"
                  style={{
                    color: "var(--secondary-text)",
                    textDecoration: "underline",
                  }}
                >
                  <span>Sign in</span>
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8  delay-400">
            <p
              className="text-sm"
              style={{ color: "rgba(248, 245, 233, 0.6)" }}
            >
              By creating an account, you agree to our{" "}
              <Link
                href="#"
                className="hover:underline"
                style={{ color: "var(--secondary-text)" }}
              >
                Terms of Service
              </Link>{" "}
              and {/* Reverted back to Link component from next/link */}
              <Link
                href="#"
                className="hover:underline"
                style={{ color: "var(--secondary-text)" }}
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
