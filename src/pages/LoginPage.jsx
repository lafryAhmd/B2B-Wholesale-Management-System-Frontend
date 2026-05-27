import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const [pwVisible, setPwVisible] = useState(false)
  const [loginState, setLoginState] = useState('idle') // idle | loading | done
  const [fpState, setFpState] = useState('idle') // idle | scanning | verified

  function handleLogin() {
    setLoginState('loading')
    setTimeout(() => {
      setLoginState('done')
      setTimeout(() => navigate('/dashboard'), 800)
    }, 1500)
  }

  function handleFp() {
    setFpState('scanning')
    setTimeout(() => setFpState('verified'), 2800)
  }

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'var(--bg)', fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        .lp-left { width:44%; min-height:100vh; background:var(--green); display:flex; flex-direction:column; padding:48px 52px 44px; position:relative; overflow:hidden; flex-shrink:0; }
        .lp-left::before { content:''; position:absolute; inset:0; background-image: radial-gradient(ellipse 70% 60% at 15% 85%,rgba(22,163,74,0.3) 0%,transparent 55%), radial-gradient(ellipse 50% 50% at 85% 10%,rgba(13,148,136,0.2) 0%,transparent 55%); pointer-events:none; }
        .lp-grid-lines { position:absolute; inset:0; background-image: linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px); background-size:44px 44px; pointer-events:none; }
        .lp-stripe { position:absolute; top:0; right:-80px; width:180px; height:100%; background:rgba(255,255,255,0.02); transform:skewX(-8deg); pointer-events:none; }
        .lp-brand { display:flex; align-items:center; gap:12px; position:relative; z-index:1; animation:fadeUp 0.5s ease both; }
        .lp-logo { width:38px; height:38px; background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.22); border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .lp-brand-name { font-family:'DM Serif Display',serif; font-size:1.25rem; color:#fff; }
        .lp-brand-name b { color:#86efac; font-weight:400; }
        .lp-body { position:relative; z-index:1; flex:1; display:flex; flex-direction:column; justify-content:center; padding:48px 0 32px; animation:fadeUp 0.5s 0.08s ease both; }
        .lp-tag { display:inline-flex; align-items:center; gap:7px; background:rgba(134,239,172,0.12); border:1px solid rgba(134,239,172,0.25); border-radius:20px; padding:5px 14px; font-size:0.72rem; font-weight:600; color:#86efac; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:26px; width:fit-content; }
        .lp-tag .dot { width:6px; height:6px; background:#4ade80; border-radius:50%; animation:pulse 2s ease infinite; }
        .lp-headline { font-family:'DM Serif Display',serif; font-size:2.7rem; line-height:1.15; color:#fff; font-weight:400; margin-bottom:20px; }
        .lp-headline i { color:#86efac; font-style:italic; }
        .lp-desc { font-size:0.92rem; color:rgba(255,255,255,0.5); line-height:1.8; font-weight:300; max-width:320px; margin-bottom:40px; }
        .lp-feature-list { display:flex; flex-direction:column; gap:14px; }
        .lp-feature-item { display:flex; align-items:center; gap:12px; font-size:0.87rem; color:rgba(255,255,255,0.65); }
        .lp-feature-icon { width:30px; height:30px; border-radius:7px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .lp-stats-row { display:flex; gap:0; border-top:1px solid rgba(255,255,255,0.1); padding-top:28px; margin-top:40px; position:relative; z-index:1; animation:fadeUp 0.5s 0.15s ease both; }
        .lp-stat { flex:1; padding-right:20px; }
        .lp-stat:not(:first-child) { padding-left:20px; border-left:1px solid rgba(255,255,255,0.08); }
        .lp-stat-num { font-family:'DM Serif Display',serif; font-size:1.55rem; color:#fff; margin-bottom:3px; }
        .lp-stat-label { font-size:0.67rem; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.1em; }
        /* RIGHT */
        .lp-right { flex:1; display:flex; align-items:center; justify-content:center; padding:48px 40px; overflow-y:auto; background:var(--surface); position:relative; }
        .lp-right::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--green3),var(--teal)); }
        .lp-form-wrap { width:100%; max-width:390px; animation:fadeUp 0.5s 0.05s ease both; }
        .lp-form-header { margin-bottom:32px; }
        .lp-form-header h2 { font-family:'DM Serif Display',serif; font-size:1.9rem; color:var(--text); font-weight:400; margin-bottom:7px; }
        .lp-form-header p { font-size:0.87rem; color:var(--muted); line-height:1.6; }
        .lp-field { margin-bottom:16px; }
        .lp-field label { display:block; font-size:0.79rem; font-weight:600; color:var(--text); margin-bottom:7px; }
        .lp-input-wrap { position:relative; }
        .lp-input-wrap .icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--border2); pointer-events:none; display:flex; transition:color 0.2s; }
        .lp-input-wrap input { width:100%; padding:12px 42px; background:var(--bg); border:1.5px solid var(--border); border-radius:10px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:0.92rem; outline:none; transition:border-color 0.2s,box-shadow 0.2s,background 0.2s; }
        .lp-input-wrap input::placeholder { color:#98b098; }
        .lp-input-wrap input:focus { border-color:var(--accent); background:var(--warm); box-shadow:0 0 0 3px rgba(22,163,74,0.1); }
        .lp-input-wrap:focus-within .icon { color:var(--accent); }
        .pw-eye { position:absolute; right:13px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--border2); display:flex; padding:2px; transition:color 0.2s; }
        .pw-eye:hover { color:var(--accent); }
        .lp-meta-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .cb-label { display:flex; align-items:center; gap:8px; font-size:0.83rem; color:var(--muted); cursor:pointer; }
        .cb-label input[type=checkbox] { -webkit-appearance:none; appearance:none; width:16px; height:16px; border:1.5px solid var(--border2); border-radius:4px; cursor:pointer; flex-shrink:0; position:relative; transition:all 0.2s; }
        .cb-label input[type=checkbox]:checked { background:var(--accent); border-color:var(--accent); }
        .cb-label input[type=checkbox]:checked::after { content:''; position:absolute; left:3px; top:0; width:5px; height:9px; border:2px solid #fff; border-top:none; border-left:none; transform:rotate(45deg); }
        .forgot { font-size:0.82rem; color:var(--accent); text-decoration:none; font-weight:500; }
        .forgot:hover { color:var(--green); }
        .lp-btn-primary { width:100%; padding:13px; background:var(--green); border:none; border-radius:10px; color:#fff; font-family:'DM Sans',sans-serif; font-size:0.93rem; font-weight:600; cursor:pointer; transition:background 0.2s,box-shadow 0.2s,transform 0.15s; }
        .lp-btn-primary:hover { background:var(--green2); box-shadow:0 6px 20px rgba(20,83,45,0.22); transform:translateY(-1px); }
        .lp-btn-primary:active { transform:none; box-shadow:none; }
        .or-row { display:flex; align-items:center; gap:14px; margin:20px 0; }
        .or-row hr { flex:1; border:none; border-top:1.5px solid var(--border); }
        .or-row span { font-size:0.78rem; color:#98b098; white-space:nowrap; }
        .fp-btn { width:100%; padding:12px 16px; background:var(--bg); border:1.5px solid var(--border); border-radius:10px; color:var(--muted); font-family:'DM Sans',sans-serif; font-size:0.87rem; font-weight:500; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.2s; }
        .fp-btn:hover { border-color:var(--accent); color:var(--accent); background:var(--warm); }
        .fp-btn.scanning { border-color:var(--accent); color:var(--accent); pointer-events:none; }
        .fp-btn.verified { border-color:var(--teal); color:var(--teal); background:#f0fdfc; }
        .fp-badge { font-size:0.62rem; background:var(--bg2); border:1px solid var(--border); border-radius:4px; padding:1px 6px; color:#98b098; text-transform:uppercase; letter-spacing:0.06em; font-weight:600; }
        .form-foot { text-align:center; margin-top:20px; font-size:0.83rem; color:var(--muted); }
        .form-foot a { color:var(--accent); text-decoration:none; font-weight:600; }
        .form-foot a:hover { text-decoration:underline; }
        .trust-row { display:flex; align-items:center; justify-content:center; gap:7px; margin-top:22px; padding-top:18px; border-top:1px solid var(--border); font-size:0.7rem; color:#98b098; letter-spacing:0.04em; }
        .trust-row svg { color:var(--accent); flex-shrink:0; }
        .trust-row .dot { width:3px; height:3px; background:var(--border); border-radius:50%; }
        @media (max-width:860px) { .lp-left { display:none; } .lp-right { padding:40px 24px; } }
      `}</style>

      {/* LEFT PANEL */}
      <aside className="lp-left">
        <div className="lp-grid-lines"></div>
        <div className="lp-stripe"></div>
        <div className="lp-brand">
          <div className="lp-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              <circle cx="20" cy="18" r="2.5" fill="#fff"/>
            </svg>
          </div>
          <div className="lp-brand-name">Stock<b>Bridge</b></div>
        </div>
        <div className="lp-body">
          <div className="lp-tag"><div className="dot"></div>B2B Stock Exchange</div>
          <h1 className="lp-headline">Trade surplus.<br/><i>Scale faster.</i></h1>
          <p className="lp-desc">The professional marketplace where businesses buy, sell, and exchange available inventory — unlocking new revenue and reducing waste.</p>
          <div className="lp-feature-list">
            {[
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(134,239,172,0.8)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, text:'Live inventory listings across 4,200+ stores'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(134,239,172,0.8)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, text:'Secure B2B transactions with verified businesses'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(134,239,172,0.8)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, text:'Average stock clearance in under 72 hours'},
            ].map((f,i) => (
              <div className="lp-feature-item" key={i}>
                <div className="lp-feature-icon">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <div className="lp-stats-row">
          {[{num:'4,200+',lbl:'Active Stores'},{num:'$2.1B',lbl:'Stock Traded'},{num:'98%',lbl:'Satisfaction'}].map(s => (
            <div className="lp-stat" key={s.lbl}>
              <div className="lp-stat-num">{s.num}</div>
              <div className="lp-stat-label">{s.lbl}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main className="lp-right">
        <div className="lp-form-wrap">
          <div className="lp-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to manage listings and trade stock.</p>
          </div>

          <div className="lp-field">
            <label htmlFor="email">Email address</label>
            <div className="lp-input-wrap">
              <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
              <input type="email" id="email" placeholder="you@company.com" autoComplete="email"/>
            </div>
          </div>

          <div className="lp-field">
            <label htmlFor="password">Password</label>
            <div className="lp-input-wrap">
              <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
              <input type={pwVisible ? 'text' : 'password'} id="password" placeholder="Enter your password" autoComplete="current-password"/>
              <button className="pw-eye" onClick={() => setPwVisible(v => !v)} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div className="lp-meta-row">
            <label className="cb-label"><input type="checkbox"/> Keep me signed in</label>
            <a href="#" className="forgot">Forgot password?</a>
          </div>

          <button
            className="lp-btn-primary"
            onClick={handleLogin}
            style={loginState === 'loading' ? {opacity:0.7,pointerEvents:'none'} : loginState === 'done' ? {background:'#0d9488'} : {}}
          >
            {loginState === 'loading' ? 'Signing in…' : loginState === 'done' ? '✓ Signed in successfully' : 'Sign in to StockBridge'}
          </button>

          <div className="or-row"><hr/><span>or use biometrics</span><hr/></div>

          <button
            className={`fp-btn${fpState === 'scanning' ? ' scanning' : fpState === 'verified' ? ' verified' : ''}`}
            onClick={handleFp}
          >
            {fpState === 'scanning' ? (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:'spin 0.9s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Scanning fingerprint…</>
            ) : fpState === 'verified' ? (
              <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Identity verified</>
            ) : (
              <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 1a11 11 0 0 0-8.82 17.6"/><path d="M12 7a5 5 0 0 1 5 5"/><path d="M12 7a5 5 0 0 0-4.9 4"/><path d="M8 12a4 4 0 0 0 4 4"/><path d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-2 5.6"/></svg> Sign in with Fingerprint <span className="fp-badge">Optional</span></>
            )}
          </button>

          <p className="form-foot">New to StockBridge? <Link to="/register">Create an account →</Link></p>

          <div className="trust-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            256-bit SSL Encrypted <div className="dot"></div> SOC 2 Certified <div className="dot"></div> GDPR Compliant
          </div>
        </div>
      </main>
    </div>
  )
}
