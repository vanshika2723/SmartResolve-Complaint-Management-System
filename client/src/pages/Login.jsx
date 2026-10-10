
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
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

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      const user = await login(
        form.email.trim(),
        form.password
      );

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        const destination = location.state?.from?.pathname;
        navigate(
          destination?.startsWith("/") &&
            !destination.startsWith("//")
            ? destination
            : "/dashboard",
          { replace: true }
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to log in. Please try again."
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
          <span className="eyebrow">YOUR VOICE MATTERS</span>
          <h1>
            Every concern
            <br />
            deserves a <span>solution.</span>
          </h1>
          <p>
            Submit complaints, follow every update, and
            stay informed until your issue is resolved.
          </p>

          <div className="visual-feature">
            <span className="feature-check">✓</span>
            Transparent complaint tracking
          </div>
          <div className="visual-feature">
            <span className="feature-check">✓</span>
            Updates you can rely on
          </div>
          <div className="visual-feature">
            <span className="feature-check">✓</span>
            One place for every concern
          </div>
        </div>

        <p className="visual-footer">
          Making complaint resolution simpler.
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
              <Lock size={23} />
            </span>
            <h2>Welcome back</h2>
            <p>Sign in to continue to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="email">Email address</label>
            <div className="input-wrap">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <Lock size={18} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
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
              {loading ? "Signing in..." : "Sign in to account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>

          <p className="auth-security">
            <ShieldCheck size={15} />
            Secure access to your complaints
          </p>
        </div>
      </section>
    </main>
  );
}