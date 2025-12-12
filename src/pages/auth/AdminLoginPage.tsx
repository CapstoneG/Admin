import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/auth/AdminLoginPage.css';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  const from = (location.state as any)?.from || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const hasAdminRole = user?.roles?.some((role: any) => 
      role.name === 'ADMIN' || role.name === 'admin'
    );
    
    if (user && hasAdminRole) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">

        <form className="admin-login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="admin-error-message">
              {error}
            </div>
          )}

          <div className="admin-form-group">
            <label htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/" className="back-home-link">
            ← Back to Home
          </a>
        </div>
      </div>

      <div className="admin-login-bg">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
