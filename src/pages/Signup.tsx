import {
  ArrowRight,
  LockKeyhole,
  Sparkles,
  User,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../utils/auth";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("1st Year");

  const [error, setError] = useState("");

 // 1. Add "async" here
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // 2. Add "await" right here
    const result = await signupUser(
      name,
      email,
      password,
      department,
      year
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/");
  };

  return (
    <main className="auth-page">
      <div className="auth-background-glow" />

      <section className="auth-container signup-container">

        {/* BRAND */}
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <Sparkles size={18} />
          </div>

          <span>NOVA</span>
        </div>

        {/* HEADER */}
        <div className="auth-header">
          <p className="section-label">
            JOIN NOVA
          </p>

          <h1>
            Make campus
            <span> yours.</span>
          </h1>

          <p>
            Create your student account and start
            planning your campus experience.
          </p>
        </div>

        {/* FORM */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* NAME */}
          <div className="auth-field">
            <label htmlFor="name">
              Full name
            </label>

            <div className="auth-password-input">
              <User size={16} />

              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="auth-field">
            <label htmlFor="signup-email">
              College email
            </label>

            <input
              id="signup-email"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          {/* DEPARTMENT + YEAR */}
          <div className="signup-grid">

            <div className="auth-field">
              <label htmlFor="department">
                Department
              </label>

              <input
                id="department"
                type="text"
                placeholder="e.g. CSE AIML"
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="year">
                Year
              </label>

              <select
                id="year"
                value={year}
                onChange={(e) =>
                  setYear(e.target.value)
                }
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>

          </div>

          {/* PASSWORD */}
          <div className="auth-field">
            <label htmlFor="signup-password">
              Password
            </label>

            <div className="auth-password-input">
              <LockKeyhole size={16} />

              <input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="auth-field">
            <label htmlFor="confirm-password">
              Confirm password
            </label>

            <div className="auth-password-input">
              <LockKeyhole size={16} />

              <input
                id="confirm-password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="auth-submit"
          >
            Create account
            <ArrowRight size={17} />
          </button>

        </form>

        {/* LOGIN */}
        <div className="auth-divider">
          <span>ALREADY HAVE AN ACCOUNT?</span>
        </div>

        <Link
          to="/login"
          className="auth-secondary-button"
        >
          Sign in to NOVA
          <ArrowRight size={16} />
        </Link>

        <p className="auth-footer">
          NOVA · Campus Event Board
        </p>

      </section>
    </main>
  );
}

export default Signup;
