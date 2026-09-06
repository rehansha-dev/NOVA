import {
  ArrowRight,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

 // 1. Add "async" right here
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); // (If you have an error state setup like in Signup)

    // 2. Add "await" right here
    const result = await loginUser(email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    // 3. Success! Send them to the dashboard/home
    navigate("/");
  };

  return (
    <main className="auth-page">
      <div className="auth-background-glow" />

      <section className="auth-container">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <Sparkles size={18} />
          </div>

          <span>NOVA</span>
        </div>

        <div className="auth-header">
          <p className="section-label">WELCOME BACK</p>

          <h1>
            Your campus.
            <span> Your moments.</span>
          </h1>

          <p>
            Sign in to continue planning your
            campus experience.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="auth-field">
            <label htmlFor="email">
              College email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor="password">
                Password
              </label>

              <span>Secure login</span>
            </div>

            <div className="auth-password-input">
              <LockKeyhole size={16} />

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
          >
            Sign in
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="auth-divider">
          <span>NEW TO NOVA?</span>
        </div>

        <Link
          to="/signup"
          className="auth-secondary-button"
        >
          Create your student account
          <ArrowRight size={16} />
        </Link>

        <p className="auth-footer">
          NOVA · Campus Event Board
        </p>
      </section>
    </main>
  );
}

export default Login;
