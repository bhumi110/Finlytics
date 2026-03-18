import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import "../../styles/register.css";

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const validate = () => {
    if (!form.name.trim())              return "Name is required.";
    if (!form.email)                    return "Email is required.";
    if (!form.password)                 return "Password is required.";
    if (form.password.length < 6)       return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(form.password))   return "Password needs at least one uppercase letter.";
    if (!/[0-9]/.test(form.password))   return "Password needs at least one number.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/employee/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Left — Brand */}
      <div className="register-left">
        <div className="register-brand">
          <div className="register-brand-icon">F</div>
          <div className="register-brand-name">Finlytics</div>
          <div className="register-brand-tagline">
            Join your team on Finlytics.<br />
            Submit, track, and manage<br />
            expenses with ease.
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="register-right">
        <div className="register-form-wrap">
          <div className="register-heading">Create account</div>
          <div className="register-subheading">You'll be registered as an Employee</div>

          {error && <div className="register-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {[
              { label: "Full Name",         name: "name",     type: "text",     placeholder: "John Smith" },
              { label: "Email Address",     name: "email",    type: "email",    placeholder: "you@company.com" },
              { label: "Password",          name: "password", type: "password", placeholder: "Min 6 chars, 1 uppercase, 1 number" },
              { label: "Confirm Password",  name: "confirm",  type: "password", placeholder: "Repeat your password" },
            ].map(f => (
              <div key={f.name} style={{ marginBottom: 14 }}>
                <label className="register-label">{f.label}</label>
                <input className="register-input" name={f.name} type={f.type}
                  placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} />
              </div>
            ))}

            <button className="register-btn" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="register-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;