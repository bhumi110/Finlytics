import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import "../../styles/login.css";

const Login = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password are required."); return; }
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      const map = { EMPLOYEE: "/employee/dashboard", MANAGER: "/manager/dashboard",
        FINANCE: "/finance/dashboard", ADMIN: "/admin/dashboard" };
      navigate(map[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left — Brand */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">F</div>
          <div className="login-brand-name">Finlytics</div>
          <div className="login-brand-tagline">
            Enterprise expense management.<br />
            Multi-level approvals, audit trails,<br />
            and real-time reimbursements.
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-heading">Welcome back</div>
          <div className="login-subheading">Sign in to your account to continue</div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label className="login-label">Email Address</label>
              <input className="login-input" type="email"
                placeholder="you@company.com"
                value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="login-label">Password</label>
              <input className="login-input" type="password"
                placeholder="Enter your password"
                value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} />
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;