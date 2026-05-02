import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Alert } from "../../components/UI";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate("/dashboard");
    else setError(result.message);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-grid" />
      <div className="auth-bg-glow" />
      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo-icon">⬡</div>
          <div>
<<<<<<< HEAD
            <div className="auth-title">Nigehban</div>
=======
            <div className="auth-title">EZC</div>
>>>>>>> 6f5fd618279b49db3dbafc62e00ea301f8cc1163
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: 2 }}>
              CRIME ANALYTICS PLATFORM
            </div>
          </div>
        </div>

        <div className="auth-headline">CREATE ACCOUNT</div>
        <div className="auth-sub">Public user registration</div>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text" name="name" className="form-control"
              placeholder="John Smith"
              value={form.name} onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" name="email" className="form-control"
              placeholder="john@example.com"
              value={form.email} onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" name="password" className="form-control"
              placeholder="••••••••"
              value={form.password} onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password" name="confirmPassword" className="form-control"
              placeholder="••••••••"
              value={form.confirmPassword} onChange={handleChange} required
            />
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-divider">or</div>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
