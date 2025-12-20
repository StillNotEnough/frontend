// src/components/Auth/Login.tsx

import { useState } from "react";
import authService from "../../services/authService";
import "./AuthModal.css";

// Интерфейс для пропсов
interface LoginProps {
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ username, password });
      authService.saveTokens(response);

      onClose();
      window.location.reload();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h1 className="auth-modal-title">Sign in</h1>
          <p className="auth-modal-subtitle">
            Welcome back — enter your credentials
          </p>
        </div>

        {error && <div className="auth-modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-modal-form">
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-modal-button" disabled={loading}>
            {loading ? <span className="button-loader"></span> : "Continue"}
          </button>
        </form>

        <div className="auth-modal-footer">
          <p>
            Don't have an account?
            <span className="auth-link-button" onClick={onClose}>
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
