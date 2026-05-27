import { Link } from 'react-router-dom'

export default function DashboardLayout({ children, activePage, welcomeText, welcomeAction }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const businessName = user.businessName || 'My Business'
  const displayName = businessName
  const initials = businessName ? businessName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'

  const topLinks = [
    { to: '/', label: 'Home', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { to: '/dashboard', label: 'Dashboard', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { to: '/marketplace', label: 'Marketplace', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
    { to: '#', label: 'My Listings' },
    { to: '#', label: 'Deals' },
  ]

  const sidebarSections = [
    {
      label: 'Main', items: [
        { to: '/dashboard', label: 'Overview', key: 'overview', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
        { to: '#', label: 'Analytics', key: 'analytics', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
        { to: '/marketplace', label: 'Marketplace', key: 'marketplace', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
      ]
    },
    {
      label: 'My Business', items: [
        { to: '/products', label: 'Product Management', key: 'products', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
        { to: '/orders', label: 'Order Management', key: 'orders', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
        { to: '#', label: 'Active Deals', key: 'deals', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, count: '3', countClass: 'amber' },
        { to: '#', label: 'Messages', key: 'messages', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, count: '5' },
        { to: '#', label: 'Network', key: 'network', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
      ]
    },
    {
      label: 'Inventory', items: [
        { to: '/inventory', label: 'Stock Management', key: 'inventory', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
        { to: '/inventory/alerts', label: 'Stock Alerts', key: 'stock-alerts', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
      ]
    },
    {
      label: 'Reports', items: [
        { to: '/reports/sales', label: 'Sales Report', key: 'sales-report', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> },
        { to: '/reports/revenue', label: 'Revenue Growth', key: 'revenue-report', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
        { to: '/reports/unpaid', label: 'Unpaid Invoices', key: 'unpaid-report', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
        { to: '/reports/top-clients', label: 'Top Clients', key: 'top-clients', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 12 7s5-3 7.5-3a2.5 2.5 0 0 1 0 5H18l-6 11L6 9z"/></svg> },
      ]
    },
    {
      label: 'Finance', items: [
        { to: '/invoices', label: 'My Invoices', key: 'invoices', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
        { to: '/finance/invoices', label: 'Invoice Management', key: 'finance-invoices', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
        { to: '/finance/overdue', label: 'Overdue Invoices', key: 'overdue', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
        { to: '/finance/audit', label: 'Audit Trail', key: 'audit', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
      ]
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        .db-topbar{background:var(--green);height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;flex-shrink:0;box-shadow:0 2px 10px rgba(20,83,45,.18);position:sticky;top:0;z-index:100;}
        .db-brand{display:flex;align-items:center;gap:10px;}
        .db-logo{width:30px;height:30px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:7px;display:flex;align-items:center;justify-content:center;}
        .db-brand-name{font-family:'DM Serif Display',serif;font-size:1rem;color:#fff;}
        .db-brand-name b{color:#86efac;font-weight:400;}
        .db-topnav{display:flex;align-items:center;gap:2px;}
        .db-topnav a{padding:6px 12px;border-radius:6px;font-size:.84rem;font-weight:500;color:rgba(255,255,255,.6);text-decoration:none;transition:all .18s;display:flex;align-items:center;gap:5px;}
        .db-topnav a:hover{background:rgba(255,255,255,.08);color:#fff;}
        .db-topnav a.act{background:rgba(255,255,255,.12);color:#fff;}
        .db-topright{display:flex;align-items:center;gap:10px;}
        .db-notif{width:32px;height:32px;border-radius:7px;background:rgba(255,255,255,.1);border:none;cursor:pointer;color:rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;position:relative;transition:background .18s;}
        .db-notif:hover{background:rgba(255,255,255,.18);}
        .notif-dot{position:absolute;top:5px;right:5px;width:7px;height:7px;border-radius:50%;background:#fbbf24;border:1.5px solid var(--green);}
        .db-chip{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:5px 10px 5px 7px;cursor:pointer;transition:background .18s;}
        .db-chip:hover{background:rgba(255,255,255,.18);}
        .db-avatar{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#16a34a,#0d9488);display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;color:#fff;}
        .db-chip-name{font-size:.82rem;font-weight:500;color:rgba(255,255,255,.85);}
        .db-layout{display:flex;flex:1;overflow:hidden;}
        .db-sidebar{width:220px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;}
        .db-sb-section{padding:16px 12px 8px;}
        .db-sb-label{font-size:.65rem;font-weight:600;color:#98b098;text-transform:uppercase;letter-spacing:.12em;padding:0 8px;margin-bottom:6px;}
        .nav-item{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:8px;font-size:.84rem;font-weight:500;color:var(--muted);text-decoration:none;transition:all .18s;margin-bottom:1px;cursor:pointer;}
        .nav-item:hover{background:var(--bg);color:var(--text);}
        .nav-item.act{background:var(--light);color:var(--green);}
        .nav-item.act svg{color:var(--accent);}
        .nav-item svg{flex-shrink:0;}
        .nav-count{margin-left:auto;font-size:.68rem;font-weight:700;background:var(--accent);color:#fff;border-radius:10px;padding:1px 6px;}
        .nav-count.amber{background:#d97706;}
        .db-sep{height:1px;background:var(--border);margin:8px 12px;}
        .db-sb-footer{margin-top:auto;padding:16px 12px;border-top:1px solid var(--border);}
        .db-sb-user{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:8px;cursor:pointer;transition:background .18s;}
        .db-sb-user:hover{background:var(--bg);}
        .sb-avatar{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--accent),var(--teal));display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:#fff;flex-shrink:0;}
        .sb-name{font-size:.83rem;font-weight:600;color:var(--text);}
        .sb-role{font-size:.73rem;color:var(--muted);}
        .sb-status{width:8px;height:8px;border-radius:50%;background:var(--accent);margin-left:auto;box-shadow:0 0 5px rgba(22,163,74,.4);flex-shrink:0;}
        .db-main{flex:1;overflow-y:auto;display:flex;flex-direction:column;}
        .db-content{padding:28px 32px 48px;}
        .db-page-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:26px;}
        .db-page-title{font-family:'DM Serif Display',serif;font-size:1.6rem;font-weight:400;color:var(--text);margin-bottom:3px;}
        .db-page-sub{font-size:.84rem;color:var(--muted);}
        .welcome-bar{background:var(--green);padding:18px 32px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
        .welcome-text{font-size:.88rem;color:rgba(255,255,255,.75);}
        .welcome-text strong{color:#fff;font-weight:600;}
        .btn-sm{padding:7px 14px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:7px;font-family:'DM Sans',sans-serif;font-size:.81rem;font-weight:500;color:rgba(255,255,255,.85);cursor:pointer;text-decoration:none;transition:background .18s;display:inline-flex;align-items:center;gap:6px;}
        .btn-sm:hover{background:rgba(255,255,255,.2);}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>

      {/* TOPBAR */}
      <header className="db-topbar">
        <div className="db-brand">
          <div className="db-logo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/><circle cx="20" cy="18" r="2.5" fill="#fff"/></svg></div>
          <div className="db-brand-name">Stock<b>Bridge</b></div>
        </div>
        <nav className="db-topnav">
          {topLinks.map(l => (
            <Link key={l.label} to={l.to} className={activePage === l.label.toLowerCase() ? 'act' : ''}>
              {l.icon}{l.label}
            </Link>
          ))}
        </nav>
        <div className="db-topright">
          <button className="db-notif"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><div className="notif-dot"></div></button>
          <div className="db-chip"><div className="db-avatar">{initials}</div><span className="db-chip-name">{displayName}</span></div>
        </div>
      </header>

      <div className="db-layout">
        {/* SIDEBAR */}
        <aside className="db-sidebar">
          {sidebarSections.map((section, si) => (
            <div key={section.label}>
              {si > 0 && <div className="db-sep"></div>}
              <div className="db-sb-section">
                <div className="db-sb-label">{section.label}</div>
                {section.items.map(item => (
                  <Link key={item.key} className={`nav-item${activePage === item.key ? ' act' : ''}`} to={item.to}>
                    {item.icon}{item.label}
                    {item.count && <span className={`nav-count${item.countClass ? ' ' + item.countClass : ''}`}>{item.count}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="db-sep"></div>
          <div className="db-sb-section">
            <div className="db-sb-label">Account</div>
            <a className="nav-item" href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings</a>
            <Link className="nav-item" to="/login" style={{ color: '#be123c' }} onClick={() => localStorage.removeItem('user')}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</Link>
          </div>
          <div className="db-sb-footer">
            <div className="db-sb-user">
              <div className="sb-avatar">{initials}</div>
              <div><div className="sb-name">{displayName}</div><div className="sb-role">{user.businessType || 'Business'}</div></div>
              <div className="sb-status"></div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="db-main">
          {welcomeText && (
            <div className="welcome-bar">
              <div><div className="welcome-text" dangerouslySetInnerHTML={{ __html: welcomeText }}></div></div>
              {welcomeAction}
            </div>
          )}
          <div className="db-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
