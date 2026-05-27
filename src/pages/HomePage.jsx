import { Link } from 'react-router-dom'

const Star = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

export default function HomePage() {
  return (
    <div>
      <style>{`
        /* HERO */
        .hero { background: var(--green); position: relative; overflow: hidden; padding: 90px 40px 100px; }
        .hero::before { content:''; position:absolute; inset:0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px); background-size:48px 48px; pointer-events:none; }
        .hero-glow-1 { position:absolute; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle,rgba(22,163,74,0.28) 0%,transparent 65%); bottom:-200px; left:-150px; pointer-events:none; }
        .hero-glow-2 { position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(13,148,136,0.18) 0%,transparent 65%); top:-150px; right:-100px; pointer-events:none; }
        .hero-inner { position:relative; z-index:1; max-width:1080px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; }
        .hero-tag { display:inline-flex; align-items:center; gap:8px; background:rgba(134,239,172,0.12); border:1px solid rgba(134,239,172,0.25); border-radius:20px; padding:5px 14px; font-size:0.71rem; font-weight:600; color:#86efac; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:24px; width:fit-content; }
        .hero-tag .live-dot { width:6px; height:6px; background:#4ade80; border-radius:50%; animation:pulse 2s ease infinite; }
        .hero-h1 { font-family:'DM Serif Display',serif; font-size:3.2rem; line-height:1.12; color:#fff; font-weight:400; margin-bottom:22px; }
        .hero-h1 i { color:#86efac; font-style:italic; }
        .hero-desc { font-size:1rem; color:rgba(255,255,255,0.52); line-height:1.8; font-weight:300; max-width:440px; margin-bottom:36px; }
        .hero-btns { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:44px; }
        .btn-hero-primary { padding:13px 28px; background:#fff; border:none; border-radius:9px; font-family:'DM Sans',sans-serif; font-size:0.93rem; font-weight:600; color:var(--green); cursor:pointer; text-decoration:none; transition:all 0.2s; display:inline-flex; align-items:center; gap:8px; }
        .btn-hero-primary:hover { background:#f0fdf4; box-shadow:0 6px 20px rgba(0,0,0,0.12); transform:translateY(-1px); }
        .btn-hero-ghost { padding:13px 24px; background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.18); border-radius:9px; font-family:'DM Sans',sans-serif; font-size:0.93rem; font-weight:500; color:rgba(255,255,255,0.8); cursor:pointer; text-decoration:none; transition:all 0.2s; display:inline-flex; align-items:center; gap:8px; }
        .btn-hero-ghost:hover { background:rgba(255,255,255,0.13); border-color:rgba(255,255,255,0.28); }
        .hero-trust { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
        .trust-item { display:flex; align-items:center; gap:6px; font-size:0.78rem; color:rgba(255,255,255,0.4); }
        .trust-item svg { color:#86efac; }
        .hero-card-wrap { display:flex; flex-direction:column; gap:14px; animation:fadeUp 0.6s 0.1s ease both; }
        .float-card { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:20px 22px; backdrop-filter:blur(10px); }
        .float-card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .float-card-title { font-size:0.8rem; font-weight:600; color:rgba(255,255,255,0.6); letter-spacing:0.03em; }
        .green-badge { font-size:0.7rem; font-weight:700; background:rgba(74,222,128,0.15); border:1px solid rgba(74,222,128,0.25); color:#4ade80; border-radius:5px; padding:2px 8px; }
        .listing-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
        .listing-row:last-child { border-bottom:none; padding-bottom:0; }
        .listing-icon { width:36px; height:36px; border-radius:8px; background:rgba(255,255,255,0.07); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1rem; }
        .listing-info { flex:1; }
        .listing-name { font-size:0.86rem; font-weight:500; color:#fff; margin-bottom:2px; }
        .listing-meta { font-size:0.74rem; color:rgba(255,255,255,0.4); }
        .listing-price { font-size:0.9rem; font-weight:600; color:#4ade80; }
        .mini-cards { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .mini-card { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px 18px; display:flex; align-items:center; gap:14px; }
        .mini-card-icon { width:40px; height:40px; border-radius:10px; background:rgba(22,163,74,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#4ade80; }
        .mini-card-val { font-family:'DM Serif Display',serif; font-size:1.4rem; color:#fff; }
        .mini-card-label { font-size:0.74rem; color:rgba(255,255,255,0.4); }
        /* STATS BAR */
        .stats-bar { background:var(--bg); border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:28px 40px; }
        .stats-bar-inner { max-width:1080px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); }
        .stat-cell { text-align:center; padding:0 20px; border-right:1px solid var(--border); }
        .stat-cell:last-child { border-right:none; }
        .stat-cell-num { font-family:'DM Serif Display',serif; font-size:2rem; color:var(--text); margin-bottom:4px; }
        .stat-cell-lbl { font-size:0.79rem; color:var(--muted); }
        .stat-cell-delta { font-size:0.72rem; color:var(--accent); font-weight:600; margin-top:2px; }
        /* SECTION */
        .section { padding:80px 40px; }
        .section-inner { max-width:1080px; margin:0 auto; }
        .section-tag { display:inline-flex; align-items:center; gap:6px; background:var(--light); border-radius:20px; padding:4px 12px; font-size:0.7rem; font-weight:600; color:var(--accent); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:16px; }
        .section-h2 { font-family:'DM Serif Display',serif; font-size:2.2rem; font-weight:400; color:var(--text); margin-bottom:14px; line-height:1.2; }
        .section-sub { font-size:0.95rem; color:var(--muted); line-height:1.75; max-width:540px; }
        .steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:52px; }
        .step-card { background:var(--surface); border:1.5px solid var(--border); border-radius:16px; padding:28px; transition:border-color 0.2s,box-shadow 0.2s,transform 0.2s; }
        .step-card:hover { border-color:#86efac; box-shadow:0 8px 28px rgba(22,163,74,0.08); transform:translateY(-3px); }
        .step-num-big { font-family:'DM Serif Display',serif; font-size:2.4rem; color:var(--light); margin-bottom:16px; line-height:1; }
        .step-icon { width:44px; height:44px; background:var(--light); border-radius:11px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; color:var(--accent); }
        .step-card h3 { font-size:1rem; font-weight:600; color:var(--text); margin-bottom:8px; }
        .step-card p { font-size:0.86rem; color:var(--muted); line-height:1.7; }
        /* FEATURES */
        .features-section { background:var(--bg); padding:80px 40px; border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
        .features-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; margin-top:52px; }
        .feature-card { background:var(--surface); border:1.5px solid var(--border); border-radius:14px; padding:26px; display:flex; gap:18px; align-items:flex-start; transition:border-color 0.2s,box-shadow 0.2s; }
        .feature-card:hover { border-color:#86efac; box-shadow:0 4px 20px rgba(22,163,74,0.07); }
        .feature-ico { width:44px; height:44px; background:var(--light); border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--accent); }
        .feature-card h4 { font-size:0.95rem; font-weight:600; color:var(--text); margin-bottom:6px; }
        .feature-card p { font-size:0.84rem; color:var(--muted); line-height:1.7; }
        /* TESTIMONIALS */
        .testimonials-section { padding:80px 40px; }
        .testimonials-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; margin-top:52px; }
        .testi-card { background:var(--surface); border:1.5px solid var(--border); border-radius:14px; padding:26px; transition:border-color 0.2s,box-shadow 0.2s; }
        .testi-card:hover { border-color:#86efac; box-shadow:0 4px 18px rgba(22,163,74,0.07); }
        .testi-stars { display:flex; gap:3px; margin-bottom:14px; color:#f59e0b; }
        .testi-quote { font-size:0.88rem; color:var(--text); line-height:1.75; margin-bottom:18px; font-style:italic; }
        .testi-author { display:flex; align-items:center; gap:11px; }
        .testi-avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'DM Serif Display',serif; font-size:0.9rem; color:#fff; flex-shrink:0; }
        .testi-name { font-size:0.86rem; font-weight:600; color:var(--text); }
        .testi-role { font-size:0.77rem; color:var(--muted); }
        /* CTA */
        .cta-section { background:var(--green); padding:80px 40px; position:relative; overflow:hidden; }
        .cta-section::before { content:''; position:absolute; inset:0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px); background-size:44px 44px; pointer-events:none; }
        .cta-inner { position:relative; z-index:1; max-width:600px; margin:0 auto; text-align:center; }
        .cta-inner h2 { font-family:'DM Serif Display',serif; font-size:2.4rem; color:#fff; font-weight:400; margin-bottom:16px; line-height:1.2; }
        .cta-inner h2 i { color:#86efac; font-style:italic; }
        .cta-inner p { font-size:0.96rem; color:rgba(255,255,255,0.5); line-height:1.75; margin-bottom:36px; }
        .cta-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
        .btn-cta-white { padding:13px 28px; background:#fff; border:none; border-radius:9px; font-family:'DM Sans',sans-serif; font-size:0.93rem; font-weight:600; color:var(--green); cursor:pointer; text-decoration:none; transition:all 0.2s; display:inline-flex; align-items:center; gap:7px; }
        .btn-cta-white:hover { background:#f0fdf4; transform:translateY(-1px); box-shadow:0 6px 20px rgba(0,0,0,0.1); }
        .btn-cta-outline { padding:13px 24px; background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.2); border-radius:9px; font-family:'DM Sans',sans-serif; font-size:0.93rem; font-weight:500; color:rgba(255,255,255,0.85); cursor:pointer; text-decoration:none; transition:all 0.2s; display:inline-flex; align-items:center; gap:7px; }
        .btn-cta-outline:hover { background:rgba(255,255,255,0.14); }
        @media (max-width:1024px) { .hero-inner { grid-template-columns:1fr; } .hero-card-wrap { display:none; } .features-grid,.testimonials-grid { grid-template-columns:1fr; } }
        @media (max-width:768px) { .hero { padding:60px 20px 70px; } .hero-h1 { font-size:2.2rem; } .section,.features-section,.testimonials-section { padding:60px 20px; } .steps-grid { grid-template-columns:1fr; } }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="hero-inner">
          <div className="hero-left" style={{animation:'fadeUp 0.5s ease both'}}>
            <div className="hero-tag"><div className="live-dot"></div>B2B Stock Exchange Platform</div>
            <h1 className="hero-h1">Clear surplus stock.<br/><i>Grow your business.</i></h1>
            <p className="hero-desc">The professional marketplace connecting businesses to buy, sell, and exchange available inventory. Turn idle stock into revenue — fast.</p>
            <div className="hero-btns">
              <Link to="/register" className="btn-hero-primary">
                Start Trading Free
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <a href="#how-it-works" className="btn-hero-ghost">
                See how it works
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              </a>
            </div>
            <div className="hero-trust">
              {['Free to join','No listing fees','Verified B2B only'].map(t => (
                <div className="trust-item" key={t}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="hero-card-wrap">
            <div className="float-card">
              <div className="float-card-head">
                <span className="float-card-title">LIVE LISTINGS</span>
                <span className="green-badge">↑ 142 new today</span>
              </div>
              {[
                {icon:'📱', name:'Samsung Galaxy A54 — 200 units', meta:'Electronics · Metro NYC · Listed 4 min ago', price:'$18,200'},
                {icon:'👕', name:'Polo Shirts, Mixed Sizes — 500 pcs', meta:'Apparel · Chicago, IL · Listed 12 min ago', price:'$4,750'},
                {icon:'⚙️', name:'Industrial Drill Sets — 80 units', meta:'Tools · Dallas, TX · Listed 28 min ago', price:'$6,400'},
              ].map(r => (
                <div className="listing-row" key={r.name}>
                  <div className="listing-icon">{r.icon}</div>
                  <div className="listing-info">
                    <div className="listing-name">{r.name}</div>
                    <div className="listing-meta">{r.meta}</div>
                  </div>
                  <div className="listing-price">{r.price}</div>
                </div>
              ))}
            </div>
            <div className="mini-cards">
              <div className="mini-card">
                <div className="mini-card-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                <div><div className="mini-card-val">$2.1B</div><div className="mini-card-label">Total Traded</div></div>
              </div>
              <div className="mini-card">
                <div className="mini-card-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                <div><div className="mini-card-val">4,200+</div><div className="mini-card-label">Active Stores</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="stats-bar-inner">
          {[
            {num:'4,200+',lbl:'Verified Businesses',delta:'↑ +341 this month'},
            {num:'$2.1B',lbl:'Total Stock Traded',delta:'↑ Growing 28% YoY'},
            {num:'72hrs',lbl:'Avg. Stock Clearance',delta:'↓ 3× faster than industry'},
            {num:'98%',lbl:'Satisfaction Rate',delta:'Based on 12,400+ reviews'},
          ].map(s => (
            <div className="stat-cell" key={s.lbl}>
              <div className="stat-cell-num">{s.num}</div>
              <div className="stat-cell-lbl">{s.lbl}</div>
              <div className="stat-cell-delta">{s.delta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="section" id="how-it-works">
        <div className="section-inner">
          <div className="section-tag">How It Works</div>
          <h2 className="section-h2">Trade stock in three simple steps</h2>
          <p className="section-sub">From sign-up to your first deal — StockBridge is built for speed, simplicity, and secure B2B commerce.</p>
          <div className="steps-grid">
            {[
              {num:'01',icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,title:'Register & Verify',desc:'Create your business account in minutes. Our team verifies your registration number to ensure all buyers and sellers are legitimate B2B entities.'},
              {num:'02',icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,title:'List or Browse',desc:'Post your surplus inventory with price, quantity, and photos — or browse thousands of live listings filtered by industry, location, and price range.'},
              {num:'03',icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,title:'Deal & Get Paid',desc:'Negotiate, agree terms, and complete transactions securely on-platform. Funds are protected until both parties confirm delivery and acceptance.'},
            ].map(s => (
              <div className="step-card" key={s.num}>
                <div className="step-num-big">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="section-inner">
          <div className="section-tag">Features</div>
          <h2 className="section-h2">Everything you need to trade smarter</h2>
          <p className="section-sub">Built specifically for the demands of B2B stock trading — powerful, fast, and secure.</p>
          <div className="features-grid">
            {[
              {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,title:'Live Inventory Feed',desc:'Real-time listings updated as businesses post and close deals. Set alerts for categories you\'re buying in and never miss a bargain.'},
              {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,title:'Verified Business Network',desc:'Every member is KYB-verified. No individual consumers — just trusted wholesale buyers and sellers, reducing fraud risk dramatically.'},
              {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,title:'Map-Based Discovery',desc:'Find buyers and sellers near you using our integrated Google Maps search. Reduce logistics costs by sourcing locally.'},
              {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,title:'Smart Dashboard',desc:'Track your listings, deals in progress, revenue, and network insights from a single clean dashboard designed for busy traders.'},
            ].map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-ico">{f.icon}</div>
                <div><h4>{f.title}</h4><p>{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="section-inner">
          <div className="section-tag">Testimonials</div>
          <h2 className="section-h2">Trusted by thousands of businesses</h2>
          <div className="testimonials-grid">
            {[
              {quote:'"We cleared $180,000 of overstock in six weeks. StockBridge found buyers we never would have reached through our own network."',initials:'MR',name:'Marcus Reynolds',role:'Ops Director, Metro Electronics',bg:'linear-gradient(135deg,#14532d,#16a34a)'},
              {quote:'"The verification process gives us confidence we\'re dealing with real businesses. We\'ve sourced stock at 40% below retail consistently."',initials:'SP',name:'Sana Patel',role:'CEO, LowCost Supply Co.',bg:'linear-gradient(135deg,#0d9488,#0f766e)'},
              {quote:'"I listed 300 units of seasonal apparel on a Monday, had three inquiries by Tuesday, and closed a deal by Friday. Incredible speed."',initials:'JO',name:'James O\'Brien',role:'Owner, Clearline Fashions',bg:'linear-gradient(135deg,#1e40af,#3b82f6)'},
            ].map(t => (
              <div className="testi-card" key={t.name}>
                <div className="testi-stars">{[1,2,3,4,5].map(i=><Star key={i}/>)}</div>
                <p className="testi-quote">{t.quote}</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{background:t.bg}}>{t.initials}</div>
                  <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to clear your <i>surplus stock?</i></h2>
          <p>Join 4,200+ verified businesses already using StockBridge to turn idle inventory into revenue. Free to join, no commitment required.</p>
          <div className="cta-btns">
            <Link to="/register" className="btn-cta-white">
              Create Free Account
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/login" className="btn-cta-outline">Sign In</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
