import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const businessName = user.businessName || 'My Business'
  const displayName = businessName
  const initials = businessName ? businessName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'
  const listings = [
    {name:'Samsung Galaxy A54',units:200,price:'$18,200',status:'live'},
    {name:'Polo Shirts Mixed',units:500,price:'$4,750',status:'live'},
    {name:'Industrial Drill Sets',units:80,price:'$6,400',status:'live'},
    {name:'Bluetooth Speakers',units:120,price:'$3,100',status:'pending'},
    {name:'Kitchen Appliance Set',units:40,price:'$5,600',status:'closed'},
  ]
  const activity = [
    {color:'#16a34a',title:'Deal closed — 200 Samsung units',meta:'Buyer: TechWholesale NJ · 1h ago'},
    {color:'#2563eb',title:'New offer received on Polo Shirts',meta:'$4,200 offer · 3h ago'},
    {color:'#d97706',title:'Listing approved — Drill Sets',meta:'80 units · Now live · 5h ago'},
    {color:'#0d9488',title:'New message from FastStock Ltd',meta:'Re: bulk pricing inquiry · 8h ago'},
    {color:'#be123c',title:'Listing expired — Winter Coats',meta:'45 units unsold · Renew now'},
  ]
  const stats = [
    {label:'Revenue This Month',val:'$42,810',delta:'↑ +18.4% from last month',deltaStyle:{},c:''},
    {label:'Active Listings',val:'7',delta:'3 pending review',deltaStyle:{color:'var(--muted)'},c:'blue'},
    {label:'Deals in Progress',val:'3',delta:'↑ 1 needs response',deltaStyle:{color:'#d97706'},c:'amber'},
    {label:'Stock Cleared',val:'1,840',delta:'Units sold this month',deltaStyle:{color:'#be123c'},c:'rose'},
  ]

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>
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
        .head-btns{display:flex;gap:10px;}
        .btn-out{display:flex;align-items:center;gap:6px;padding:8px 14px;background:var(--surface);border:1.5px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.84rem;font-weight:500;color:var(--text);cursor:pointer;text-decoration:none;transition:all .18s;}
        .btn-out:hover{border-color:var(--accent);color:var(--accent);}
        .btn-pri{display:flex;align-items:center;gap:6px;padding:8px 16px;background:var(--green);border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.84rem;font-weight:600;color:#fff;cursor:pointer;transition:all .18s;}
        .btn-pri:hover{background:var(--green2);box-shadow:0 4px 14px rgba(20,83,45,.2);}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;animation:fadeUp .35s ease both .05s;}
        .stat-card{background:var(--surface);border:1.5px solid var(--border);border-radius:12px;padding:20px;transition:border-color .2s,box-shadow .2s,transform .2s;position:relative;overflow:hidden;}
        .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--accent),var(--teal));}
        .stat-card.blue::before{background:linear-gradient(90deg,#2563eb,#0ea5e9);}
        .stat-card.amber::before{background:linear-gradient(90deg,#d97706,#f59e0b);}
        .stat-card.rose::before{background:linear-gradient(90deg,#be123c,#f43f5e);}
        .stat-card:hover{border-color:var(--border2);transform:translateY(-2px);box-shadow:0 4px 18px rgba(20,83,45,.07);}
        .sc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .sc-label{font-size:.77rem;color:var(--muted);}
        .sc-icon{width:30px;height:30px;border-radius:7px;background:var(--light);color:var(--accent);display:flex;align-items:center;justify-content:center;}
        .stat-card.blue .sc-icon{background:#eff6ff;color:#2563eb;}
        .stat-card.amber .sc-icon{background:#fffbeb;color:#d97706;}
        .stat-card.rose .sc-icon{background:#fff1f2;color:#be123c;}
        .sc-val{font-family:'DM Serif Display',serif;font-size:1.85rem;color:var(--text);line-height:1;margin-bottom:6px;}
        .sc-delta{font-size:.77rem;color:var(--accent);font-weight:600;}
        .main-grid{display:grid;grid-template-columns:1fr 320px;gap:20px;margin-bottom:22px;animation:fadeUp .35s ease both .12s;}
        .card{background:var(--surface);border:1.5px solid var(--border);border-radius:12px;padding:22px;}
        .card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
        .card-title{font-size:.93rem;font-weight:600;color:var(--text);}
        .card-sub{font-size:.78rem;color:var(--muted);margin-top:2px;}
        .tabs{display:flex;background:var(--bg);border-radius:7px;padding:3px;gap:2px;}
        .tab{padding:5px 12px;border-radius:5px;font-size:.78rem;font-weight:500;color:var(--muted);cursor:pointer;border:none;font-family:'DM Sans',sans-serif;background:none;transition:all .18s;}
        .tab.act{background:var(--surface);color:var(--green);box-shadow:0 1px 4px rgba(20,83,45,.08);}
        .tab:hover:not(.act){color:var(--text);}
        .chart-wrap{height:190px;position:relative;}
        svg.line-chart{width:100%;height:100%;}
        .act-item{display:flex;gap:12px;padding:11px 0;border-bottom:1px solid var(--border);}
        .act-item:last-child{border-bottom:none;}
        .act-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px;}
        .act-title{font-size:.84rem;color:var(--text);margin-bottom:2px;font-weight:500;}
        .act-meta{font-size:.75rem;color:var(--muted);}
        .bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;animation:fadeUp .35s ease both .2s;}
        table{width:100%;border-collapse:collapse;}
        thead th{text-align:left;font-size:.69rem;font-weight:600;color:#98b098;text-transform:uppercase;letter-spacing:.1em;padding:0 0 12px 0;border-bottom:1px solid var(--border);}
        tbody tr{border-bottom:1px solid var(--border);transition:background .15s;}
        tbody tr:last-child{border-bottom:none;}
        tbody tr:hover{background:var(--warm);}
        tbody td{padding:12px 0;font-size:.85rem;color:var(--text);vertical-align:middle;}
        .pill{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:.73rem;font-weight:600;}
        .pill.live{background:var(--light);color:var(--green3);}
        .pill.pending{background:#fffbeb;color:#d97706;}
        .pill.closed{background:var(--bg2);color:var(--muted);}
        .pill-dot{width:5px;height:5px;border-radius:50%;background:currentColor;}
        .actions-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .action-card{display:flex;flex-direction:column;align-items:flex-start;padding:16px;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;transition:all .18s;text-decoration:none;}
        .action-card:hover{border-color:#86efac;background:var(--warm);transform:translateY(-2px);box-shadow:0 4px 16px rgba(22,163,74,.08);}
        .action-icon{width:36px;height:36px;border-radius:9px;background:var(--light);display:flex;align-items:center;justify-content:center;color:var(--accent);margin-bottom:10px;}
        .action-card.blue .action-icon{background:#eff6ff;color:#2563eb;}
        .action-card.amber .action-icon{background:#fffbeb;color:#d97706;}
        .action-card.teal .action-icon{background:#f0fdfc;color:var(--teal);}
        .action-label{font-size:.84rem;font-weight:600;color:var(--text);margin-bottom:2px;}
        .action-desc{font-size:.76rem;color:var(--muted);}
        .welcome-bar{background:var(--green);padding:18px 32px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
        .welcome-text{font-size:.88rem;color:rgba(255,255,255,.75);}
        .welcome-text strong{color:#fff;font-weight:600;}
        .btn-sm{padding:7px 14px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:7px;font-family:'DM Sans',sans-serif;font-size:.81rem;font-weight:500;color:rgba(255,255,255,.85);cursor:pointer;text-decoration:none;transition:background .18s;display:inline-flex;align-items:center;gap:6px;}
        .btn-sm:hover{background:rgba(255,255,255,.2);}
        @media(max-width:1024px){.stats-grid{grid-template-columns:repeat(2,1fr);}.main-grid{grid-template-columns:1fr;}}
      `}</style>

      {/* TOPBAR */}
      <header className="db-topbar">
        <div className="db-brand">
          <div className="db-logo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/><circle cx="20" cy="18" r="2.5" fill="#fff"/></svg></div>
          <div className="db-brand-name">Stock<b>Bridge</b></div>
        </div>
        <nav className="db-topnav">
          <Link to="/"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Home</Link>
          <a href="#" className="act"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>Dashboard</a>
          <Link to="/marketplace">Marketplace</Link>
          <a href="#">My Listings</a>
          <a href="#">Deals</a>
        </nav>
        <div className="db-topright">
          <button className="db-notif"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><div className="notif-dot"></div></button>
          <div className="db-chip"><div className="db-avatar">{initials}</div><span className="db-chip-name">{displayName}</span></div>
        </div>
      </header>

      <div className="db-layout">
        {/* SIDEBAR */}
        <aside className="db-sidebar">
          <div className="db-sb-section">
            <div className="db-sb-label">Main</div>
            <a className="nav-item act" href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>Overview</a>
            <a className="nav-item" href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Analytics</a>
            <Link className="nav-item" to="/marketplace"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Marketplace<span className="nav-count">142</span></Link>
          </div>
          <div className="db-sep"></div>
          <div className="db-sb-section">
            <div className="db-sb-label">My Business</div>
            <Link className="nav-item" to="/products"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>Product Management</Link>
            <Link className="nav-item" to="/orders"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>Order Management</Link>
            <a className="nav-item" href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>Active Deals<span className="nav-count amber">3</span></a>
            <a className="nav-item" href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Messages<span className="nav-count">5</span></a>
            <a className="nav-item" href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>Network</a>
          </div>
          <div className="db-sep"></div>
          <div className="db-sb-section">
            <div className="db-sb-label">Inventory</div>
            <Link className="nav-item" to="/inventory"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>Stock Management</Link>
            <Link className="nav-item" to="/inventory/alerts"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Stock Alerts</Link>
          </div>
          <div className="db-sep"></div>
          <div className="db-sb-section">
            <div className="db-sb-label">Reports</div>
            <Link className="nav-item" to="/reports/sales"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>Sales Report</Link>
            <Link className="nav-item" to="/reports/revenue"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Revenue Growth</Link>
            <Link className="nav-item" to="/reports/unpaid"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Unpaid Invoices</Link>
            <Link className="nav-item" to="/reports/top-clients"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 12 7s5-3 7.5-3a2.5 2.5 0 0 1 0 5H18l-6 11L6 9z"/></svg>Top Clients</Link>
          </div>
          <div className="db-sep"></div>
          <div className="db-sb-section">
            <div className="db-sb-label">Finance</div>
            <Link className="nav-item" to="/invoices"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>My Invoices</Link>
            <Link className="nav-item" to="/finance/invoices"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Invoice Management</Link>
            <Link className="nav-item" to="/finance/overdue"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Overdue Invoices</Link>
            <Link className="nav-item" to="/finance/audit"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Audit Trail</Link>
          </div>
          <div className="db-sep"></div>
          <div className="db-sb-section">
            <div className="db-sb-label">Account</div>
            <a className="nav-item" href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings</a>
            <Link className="nav-item" to="/login" style={{color:'#be123c'}} onClick={() => localStorage.removeItem('user')}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</Link>
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
          <div className="welcome-bar">
            <div><div className="welcome-text">Good morning, <strong>{displayName}</strong> 👋 — Welcome to your dashboard.</div></div>
            <a href="#" className="btn-sm"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Listing</a>
          </div>

          <div className="db-content">
            <div className="db-page-head">
              <div><h1 className="db-page-title">Dashboard</h1><p className="db-page-sub">Here's your trading overview for today, Monday 23 March 2026.</p></div>
              <div className="head-btns">
                <button className="btn-out"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export</button>
                <button className="btn-pri"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Listing</button>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="stats-grid">
              {stats.map(s=>(
                <div key={s.label} className={`stat-card${s.c?' '+s.c:''}`}>
                  <div className="sc-head"><span className="sc-label">{s.label}</span><div className="sc-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div></div>
                  <div className="sc-val">{s.val}</div>
                  <div className="sc-delta" style={s.deltaStyle}>{s.delta}</div>
                </div>
              ))}
            </div>

            {/* MAIN GRID */}
            <div className="main-grid">
              <div className="card">
                <div className="card-head">
                  <div><div className="card-title">Revenue Overview</div><div className="card-sub">Monthly trading performance</div></div>
                  <div className="tabs">
                    {['7D','1M','3M','YTD'].map((t,i)=><button key={t} className={`tab${i===0?' act':''}`}>{t}</button>)}
                  </div>
                </div>
                <div className="chart-wrap">
                  <svg className="line-chart" viewBox="0 0 560 180" preserveAspectRatio="none">
                    <defs><linearGradient id="gr1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16a34a" stopOpacity="0.18"/><stop offset="100%" stopColor="#16a34a" stopOpacity="0"/></linearGradient></defs>
                    <line x1="0" y1="45" x2="560" y2="45" stroke="#d1dbd1" strokeWidth="1"/>
                    <line x1="0" y1="90" x2="560" y2="90" stroke="#d1dbd1" strokeWidth="1"/>
                    <line x1="0" y1="135" x2="560" y2="135" stroke="#d1dbd1" strokeWidth="1"/>
                    <path d="M0,155 L70,140 L140,120 L210,130 L280,90 L350,70 L420,55 L490,35 L560,20 L560,180 L0,180Z" fill="url(#gr1)"/>
                    <path d="M0,155 L70,140 L140,120 L210,130 L280,90 L350,70 L420,55 L490,35 L560,20" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="280" cy="90" r="4" fill="#16a34a" stroke="#fff" strokeWidth="2"/>
                    <circle cx="420" cy="55" r="4" fill="#16a34a" stroke="#fff" strokeWidth="2"/>
                    <circle cx="560" cy="20" r="4" fill="#16a34a" stroke="#fff" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              <div className="card">
                <div className="card-head"><div><div className="card-title">Recent Activity</div><div className="card-sub">Last 24 hours</div></div></div>
                <div>
                  {activity.map(a=>(
                    <div key={a.title} className="act-item">
                      <div className="act-dot" style={{background:a.color}}></div>
                      <div><div className="act-title">{a.title}</div><div className="act-meta">{a.meta}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM GRID */}
            <div className="bottom-grid">
              <div className="card">
                <div className="card-head"><div><div className="card-title">My Active Listings</div><div className="card-sub">7 total listings</div></div><a href="#" className="btn-out" style={{fontSize:'0.79rem',padding:'6px 12px'}}>View All</a></div>
                <div style={{overflowX:'auto'}}>
                  <table>
                    <thead><tr><th>Item</th><th>Units</th><th>Price</th><th>Status</th></tr></thead>
                    <tbody>
                      {listings.map(l=>(
                        <tr key={l.name}>
                          <td style={{fontWeight:500}}>{l.name}</td>
                          <td style={{color:'var(--muted)'}}>{l.units}</td>
                          <td style={{fontWeight:600,color:'var(--green3)'}}>{l.price}</td>
                          <td><span className={`pill ${l.status}`}><span className="pill-dot"></span>{l.status.charAt(0).toUpperCase()+l.status.slice(1)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div className="card-head"><div><div className="card-title">Quick Actions</div><div className="card-sub">Common tasks</div></div></div>
                <div className="actions-grid">
                  {[
                    {label:'New Listing',desc:'Post surplus stock',c:'',icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>},
                    {label:'Browse Stock',desc:'Find deals near you',c:'blue',icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>},
                    {label:'My Deals',desc:'3 active right now',c:'amber',icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>},
                    {label:'Messages',desc:'5 unread messages',c:'teal',icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>},
                  ].map(a=>(
                    <a key={a.label} href="#" className={`action-card${a.c?' '+a.c:''}`}>
                      <div className="action-icon">{a.icon}</div>
                      <div className="action-label">{a.label}</div>
                      <div className="action-desc">{a.desc}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
