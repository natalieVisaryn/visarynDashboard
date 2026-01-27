import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login,  hasCookie } from '../utils/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      // Check if user is already authenticated (hasCookie now uses checkAuth internally)
      const authenticated = await hasCookie();
      if (authenticated) {
        navigate('/', { replace: true });
      }
    };
    verifyAuth();
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--very-dark-blue)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--dark-blue)',
            padding: '64px',
            borderRadius: '16px',
            width: '528px',
            height: '636px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '2rem',
            }}
          >
            <img
              src="/visarynLogoLarge.svg"
              alt="Visaryn Logo"
              width={180}
              height={35}
            />
            <p
              style={{
                fontSize: '18px',
                lineHeight: '150%',
                letterSpacing: '-0.02em',
                color: 'var(--text-grey-white)',
                marginTop: '45px',
                marginBottom: 0,
                textAlign: 'center',
              }}
            >
              Sign in to access your compliance dashboard.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  color: 'var(--textGrey)',
                  marginBottom: '10px',
                  lineHeight: '100%',
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                required
                style={{
                  width: '400px',
                  height: '54px',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid var(--input-field-border)',
                  backgroundColor: 'var(--input-field-blue)',
                  color: 'white',
                  boxSizing: 'border-box',
                }}
                disabled={loading}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  color: 'var(--textGrey)',
                  marginBottom: '10px',
                  lineHeight: '100%',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative', width: '400px' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                  style={{
                    width: '100%',
                    height: '54px',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    borderRadius: '4px',
                    border: '1px solid var(--input-field-border)',
                    backgroundColor: 'var(--input-field-blue)',
                    color: 'white',
                    boxSizing: 'border-box',
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  disabled={loading}
                >
                  <img
                    src="/eyeIcon.svg"
                    alt={showPassword ? 'Hide password' : 'Show password'}
                    width={16}
                    height={13}
                  />
                </button>
              </div>
            </div>
            {error && (
              <div
                style={{
                  color: '#ff4444',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '400px',
                height: '48px',
                padding: '0.75rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: loading ? '#555' : 'var(--blue)',
                color: 'var(--text-dark-blue)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <p
            style={{
              lineHeight: '150%',
              letterSpacing: '-0.02em',
              color: 'var(--textGrey)',
              textAlign: 'left',
              marginTop: '50px',
              marginBottom: 0,
            }}
          >
            Admin-created accounts only. Contact your administrator for access.
          </p>
        </div>
      </main>
    </>
  );
};

export default Login;
