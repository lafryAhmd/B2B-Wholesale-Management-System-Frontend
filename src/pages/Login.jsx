import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [pwVisible, setPwVisible] = useState(false);
  const [loginState, setLoginState] = useState('idle'); // idle | loading | success
  const [fpState, setFpState] = useState('idle'); // idle | scanning | verified

  const handleLogin = () => {
    setLoginState('loading');
    setTimeout(() => {
      setLoginState('success');
      setTimeout(() => navigate('/dashboard'), 800);
    }, 1500);
  };

  const handleFp = () => {
    setFpState('scanning');
    setTimeout(() => setFpState('verified'), 2800);
  };

  return (
    <div className="login-page">
      {/* LEFT PANEL */}
      <aside className="left-panel">
        <div className="grid-lines"></div>
        <div className="stripe"></div>

        <div className="brand">
          <div className="logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              <circle cx="20" cy="18" r="2.5" fill="#fff"/>
            </svg>
          </div>
          <div className="brand-name">Stock<b>Bridge</b></div>
        </div>

        <div className="panel-body">
          <div className="panel-tag">
            <div className="dot"></div>
            B2B Stock Exchange
          </div>
          <h1 className="panel-headline">
            Trade surplus.<br/>
            <i>Scale faster.</i>
          </h1>
          <p className="panel-desc">
            The professional marketplace where businesses buy, sell, and exchange available inventory — unlocking new revenue and reducing waste.
          </p>
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(134,239,172,0.8)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              Live inventory listings across 4,200+ stores
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(134,239,172,0.8)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              Secure B2B transactions with verified businesses
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(134,239,172,0.8)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              Average stock clearance in under 72 hours
            </div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat"><div className="stat-num">4,200+</div><div className="stat-label">Active Stores</div></div>
          <div className="stat"><div className="stat-num">$2.1B</div><div className="stat-label">Stock Traded</div></div>
          <div className="stat"><div className="stat-num">98%</div><div className="stat-label">Satisfaction</div></div>
        </div>
      </aside>

      {/* RIGHT PANEL - Form */}
      <main className="right-panel">
        <div className="form-wrap">
          <div className="form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to manage listings and trade stock.</p>
          </div>

          <div className="field">
            <label htmlFor="email">Email address</label>
            <div className="input-wrap">
              <span className="icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input type="email" id="email" placeholder="you@company.com" autoComplete="email" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <span className="icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                type={pwVisible ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button className="pw-eye" onClick={() => setPwVisible(!pwVisible)} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div className="meta-row">
            <label className="cb-label"><input type="checkbox" /> Keep me signed in</label>
            <a href="#" className="forgot">Forgot password?</a>
          </div>

          <button
            className="btn-primary"
            onClick={handleLogin}
            style={loginState === 'loading' ? { opacity: 0.7, pointerEvents: 'none' } : loginState === 'success' ? { background: '#0d9488' } : {}}
          >
            {loginState === 'loading' ? 'Signing in\u2026' : loginState === 'success' ? '\u2713 Signed in successfully' : 'Sign in to StockBridge'}
          </button>

          <div className="or-row"><hr/><span>or use biometrics</span><hr/></div>

          <button
            className={`fp-btn ${fpState === 'scanning' ? 'scanning' : ''} ${fpState === 'verified' ? 'verified' : ''}`}
            onClick={handleFp}
          >
            {fpState === 'scanning' ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:'spin 0.9s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Scanning fingerprint&hellip;
              </>
            ) : fpState === 'verified' ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Identity verified
              </>
            ) : (
              <>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 1a11 11 0 0 0-8.82 17.6"/>
                  <path d="M12 7a5 5 0 0 1 5 5"/>
                  <path d="M12 7a5 5 0 0 0-4.9 4"/>
                  <path d="M8 12a4 4 0 0 0 4 4"/>
                  <path d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-2 5.6"/>
                </svg>
                Sign in with Fingerprint
                <span className="fp-badge">Optional</span>
              </>
            )}
          </button>

          <p className="form-foot">New to StockBridge? <Link to="/register">Create an account &rarr;</Link></p>

          <div className="trust-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            256-bit SSL Encrypted <div className="dot"></div> SOC 2 Certified <div className="dot"></div> GDPR Compliant
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
