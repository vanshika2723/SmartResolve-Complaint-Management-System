
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Please enter your name and email.");
      return;
    }

    if (form.name.trim().length > 100) {
      setError("Name must be under 100 characters.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await register(
        form.name.trim(),
        form.email.trim(),
        form.password
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Link to="/" className="auth-brand">
          <span className="brand-icon">
            <ShieldCheck size={25} />
          </span>
          <span>SmartResolve</span>
        </Link>

        <div className="auth-visual-content">
          <span className="eyebrow">A BETTER WAY FORWARD</span>

          <h1>
            Speak up.
            <br />
            Get <span>solutions.</span>
          </h1>

          <p>
            Create your account to submit complaints,
            track progress and stay updated at every step.
          </p>

          <div className="visual-feature">
            <CheckCircle2 size={21} />
            Easy complaint submission
          </div>

          <div className="visual-feature">
            <CheckCircle2 size={21} />
            Track your complaint status
          </div>

          <div className="visual-feature">
            <CheckCircle2 size={21} />
            Keep your concerns organized
          </div>
        </div>

        <p className="visual-footer">
          Your concern matters. Every step counts.
        </p>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrap">
          <div className="mobile-brand">
            <span className="brand-icon">
              <ShieldCheck size={23} />
            </span>
            <strong>SmartResolve</strong>
          </div>

          <div className="form-heading">
            <span className="form-icon">
              <UserRound size={23} />
            </span>

            <h2>Create account</h2>
            <p>Join SmartResolve to manage your complaints.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="name">Full name</label>

            <div className="input-wrap">
              <UserRound size={18} />

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                maxLength={100}
                required
              />
            </div>

            <label htmlFor="register-email">Email address</label>

            <div className="input-wrap">
              <Mail size={18} />

              <input
                id="register-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <label htmlFor="register-password">Password</label>

            <div className="input-wrap">
              <Lock size={18} />

              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <label htmlFor="confirm-password">
              Confirm password
            </label>

            <div className="input-wrap">
              <Lock size={18} />

              <input
                id="confirm-password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create my account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>

          <p className="auth-security">
            <ShieldCheck size={15} />
            Your account is protected
          </p>
        </div>
      </section>
    </main>
  );
}