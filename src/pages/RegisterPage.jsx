import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const STEPS = [
  { index: 'Step 01', title: 'Account Type' },
  { index: 'Step 02', title: 'Business Details' },
  { index: 'Step 03', title: 'Security Setup' },
  { index: 'Step 04', title: 'Confirmation' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState('store')
  const [pwVisible, setPwVisible] = useState(false)
  const [pw, setPw] = useState('')
  const [mapOpen, setMapOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Form data state
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    registrationNo: '',
    streetAddress: '',
    city: '',
    postcode: ''
  })

  function getStrength(p) {
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const strength = getStrength(pw)
  const strengthColors = ['#d1dbd1','#ef4444','#f59e0b','#22c55e','#15803d']
  const strengthLabels = ['','Weak','Fair','Good','Strong']

  async function handleSubmit() {
    const payload = {
      email: formData.email,
      phone: formData.phone,
      businessName: formData.businessName,
      businessType: formData.businessType,
      registrationNumber: formData.registrationNo,
      street: formData.streetAddress,
      city: formData.city,
      zipCode: formData.postcode,
      username: formData.email,
      password: pw
    }

    try {
      const res = await fetch('/api/business/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Registration failed')
        return
      }

      const saved = await res.json()
      localStorage.setItem('user', JSON.stringify({
        id: saved.id,
        email: saved.email,
        businessName: saved.businessName,
        businessType: saved.businessType,
        role: selectedType === 'company' ? 'SELLER' : 'BUYER',
        accountType: selectedType
      }))
      setSubmitted(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (e) {
      alert('Could not connect to server. Make sure backend is running.')
    }
  }

  if (submitted) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:60,height:60,background:'var(--accent)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 22px',boxShadow:'0 6px 24px rgba(22,163,74,0.3)'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:'1.6rem',fontWeight:400,color:'var(--text)',marginBottom:10}}>Account created!</h2>
          <p style={{fontSize:'0.88rem',color:'var(--muted)'}}>Redirecting to your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',fontFamily:"'DM Sans',sans-serif",background:'var(--bg)',color:'var(--text)'}}>
      <style>{`
        .rp-topnav{position:sticky;top:0;z-index:200;background:var(--green);height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 36px;box-shadow:0 2px 12px rgba(20,83,45,0.2);}
        .rp-brand{display:flex;align-items:center;gap:10px;}
        .rp-logo{width:32px;height:32px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.22);border-radius:8px;display:flex;align-items:center;justify-content:center;}
        .rp-brand-name{font-family:'DM Serif Display',serif;font-size:1.1rem;color:#fff;}
        .rp-brand-name b{color:#86efac;font-weight:400;}
        .rp-nav-right{font-size:0.83rem;color:rgba(255,255,255,0.55);}
        .rp-nav-right a{color:#86efac;text-decoration:none;font-weight:500;}
        .rp-wrap{min-height:calc(100vh - 58px);display:flex;align-items:flex-start;justify-content:center;padding:40px 24px 60px;}
        .rp-shell{width:100%;max-width:980px;display:grid;grid-template-columns:220px 1fr;gap:28px;align-items:start;}
        .rp-sidebar{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px 22px;position:sticky;top:80px;box-shadow:0 2px 12px rgba(20,83,45,0.06);}
        .rp-sb-label{font-size:0.67rem;font-weight:600;color:#98b098;text-transform:uppercase;letter-spacing:.12em;margin-bottom:16px;}
        .rp-step-list{list-style:none;display:flex;flex-direction:column;gap:2px;}
        .rp-step-list li{display:flex;align-items:center;gap:11px;padding:10px;border-radius:9px;transition:background .2s;}
        .rp-step-list li.active{background:var(--light);}
        .rp-snum{width:26px;height:26px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:.69rem;font-weight:700;color:#98b098;flex-shrink:0;background:var(--surface);transition:all .25s;}
        .rp-step-list li.active .rp-snum{border-color:var(--accent);background:var(--accent);color:#fff;}
        .rp-step-list li.done .rp-snum{border-color:var(--teal);background:var(--teal);color:#fff;}
        .rp-sidx{font-size:.63rem;color:#98b098;margin-bottom:1px;}
        .rp-stitle{font-size:.82rem;font-weight:500;color:var(--muted);}
        .rp-step-list li.active .rp-stitle{color:var(--text);font-weight:600;}
        .rp-step-list li.done .rp-stitle{color:var(--teal);}
        .rp-sep{height:1px;background:var(--border);margin:20px 0;}
        .rp-note{background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:13px;font-size:.78rem;color:var(--muted);line-height:1.65;}
        .rp-note strong{display:block;font-size:.81rem;color:var(--text);margin-bottom:5px;}
        .rp-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:36px 40px 44px;box-shadow:0 2px 12px rgba(20,83,45,.06);}
        .rp-prog-wrap{height:4px;background:var(--border);border-radius:4px;margin-bottom:34px;overflow:hidden;}
        .rp-prog{height:100%;background:linear-gradient(90deg,var(--accent),var(--teal));border-radius:4px;transition:width .45s ease;}
        .rp-ph{margin-bottom:26px;}
        .rp-ph h2{font-family:'DM Serif Display',serif;font-size:1.5rem;font-weight:400;color:var(--text);margin-bottom:6px;}
        .rp-ph p{font-size:.86rem;color:var(--muted);line-height:1.65;}
        .type-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px;}
        .type-card{border:1.5px solid var(--border);border-radius:12px;padding:20px;cursor:pointer;transition:border-color .2s,box-shadow .2s,background .2s;background:var(--surface);position:relative;user-select:none;}
        .type-card:hover{border-color:#86efac;box-shadow:0 2px 10px rgba(22,163,74,.08);}
        .type-card.sel{border-color:var(--accent);background:rgba(22,163,74,.03);box-shadow:0 0 0 3px rgba(22,163,74,.1);}
        .t-dot{position:absolute;top:14px;right:14px;width:18px;height:18px;border-radius:50%;border:2px solid var(--border);transition:all .2s;}
        .type-card.sel .t-dot{border-color:var(--accent);background:var(--accent);}
        .t-ico{width:34px;height:34px;background:var(--light);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;}
        .type-card h3{font-size:.9rem;font-weight:600;color:var(--text);margin-bottom:5px;}
        .type-card p{font-size:.77rem;color:var(--muted);line-height:1.55;}
        .sdiv{font-size:.67rem;font-weight:600;color:#98b098;text-transform:uppercase;letter-spacing:.12em;padding-bottom:10px;border-bottom:1.5px solid var(--border);margin-bottom:18px;margin-top:6px;}
        .fg{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .s2{grid-column:span 2;}
        .rf{display:flex;flex-direction:column;}
        .rf label{font-size:.78rem;font-weight:600;color:var(--text);margin-bottom:7px;display:flex;align-items:center;gap:6px;}
        .opt{font-size:.62rem;background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:1px 5px;color:#98b098;text-transform:uppercase;letter-spacing:.05em;font-weight:500;}
        .iw{position:relative;}
        .iw .ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--border2);pointer-events:none;display:flex;transition:color .2s;}
        .iw input,.iw select,.iw textarea{width:100%;padding:11px 12px 11px 37px;background:var(--bg);border:1.5px solid var(--border);border-radius:9px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.88rem;outline:none;transition:border-color .2s,box-shadow .2s,background .2s;-webkit-appearance:none;appearance:none;}
        .iw input::placeholder,.iw textarea::placeholder{color:#98b098;}
        .iw input:focus,.iw select:focus,.iw textarea:focus{border-color:var(--accent);background:var(--warm);box-shadow:0 0 0 3px rgba(22,163,74,.1);}
        .iw:focus-within .ico{color:var(--accent);}
        .ni{padding-left:12px!important;}
        .sbars{display:flex;gap:4px;align-items:center;margin-top:7px;}
        .sbar{flex:1;height:3px;background:var(--border);border-radius:2px;transition:background .3s;}
        .stxt{font-size:.7rem;color:#98b098;min-width:42px;text-align:right;}
        .terms{display:flex;align-items:flex-start;gap:10px;background:var(--bg);border:1.5px solid var(--border);border-radius:9px;padding:13px;}
        .terms input[type=checkbox]{-webkit-appearance:none;appearance:none;width:17px;height:17px;border:1.5px solid var(--border2);border-radius:4px;cursor:pointer;flex-shrink:0;margin-top:2px;position:relative;transition:all .2s;}
        .terms input[type=checkbox]:checked{background:var(--accent);border-color:var(--accent);}
        .terms p{font-size:.8rem;color:var(--muted);line-height:1.65;}
        .terms a{color:var(--accent);text-decoration:none;font-weight:500;}
        .fpe{width:100%;padding:12px 16px;background:var(--bg);border:1.5px solid var(--border);border-radius:9px;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:.87rem;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s;}
        .fpe:hover{border-color:var(--accent);color:var(--accent);background:var(--warm);}
        .fnav{display:flex;gap:12px;margin-top:32px;padding-top:24px;border-top:1px solid var(--border);}
        .bback{padding:11px 22px;background:transparent;border:1.5px solid var(--border);border-radius:9px;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:500;cursor:pointer;transition:all .2s;}
        .bback:hover{border-color:var(--text);color:var(--text);}
        .bnext{flex:1;padding:12px;background:var(--green);border:none;border-radius:9px;color:#fff;font-family:'DM Sans',sans-serif;font-size:.92rem;font-weight:600;cursor:pointer;transition:background .2s,box-shadow .2s,transform .15s;}
        .bnext:hover{background:var(--green2);box-shadow:0 5px 16px rgba(20,83,45,.2);transform:translateY(-1px);}
        .mc{border:1.5px solid var(--border);border-radius:12px;background:var(--surface);overflow:hidden;margin-bottom:28px;}
        .mh{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;cursor:pointer;user-select:none;transition:background .15s;}
        .mh:hover{background:var(--bg);}
        .mhl{display:flex;align-items:center;gap:12px;}
        .mico{width:32px;height:32px;background:var(--light);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .mttl{font-size:.86rem;font-weight:600;color:var(--text);}
        .msub{font-size:.74rem;color:var(--muted);margin-top:1px;}
        .mb{border-top:1px solid var(--border);padding:16px;animation:fadeIn .25s ease;}
        .mpl{width:100%;height:200px;border:1.5px solid var(--border);border-radius:9px;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#98b098;font-size:.82rem;}
        .pw-eye-r{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#98b098;display:flex;padding:2px;transition:color .2s;}
        .pw-eye-r:hover{color:var(--accent);}
        @media(max-width:900px){.rp-shell{grid-template-columns:1fr;}.rp-sidebar{display:none;}.rp-card{padding:28px 20px 40px;}}
        @media(max-width:560px){.type-grid,.fg{grid-template-columns:1fr;}.s2{grid-column:span 1;}}
      `}</style>

      <nav className="rp-topnav">
        <div className="rp-brand">
          <div className="rp-logo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/><circle cx="20" cy="18" r="2.5" fill="#fff"/></svg></div>
          <div className="rp-brand-name">Stock<b>Bridge</b></div>
        </div>
        <div className="rp-nav-right">Already registered? <Link to="/login">Sign in</Link></div>
      </nav>

      <div className="rp-wrap">
        <div className="rp-shell">
          <aside className="rp-sidebar">
            <div className="rp-sb-label">Registration</div>
            <ul className="rp-step-list">
              {STEPS.map((s,i)=>{const n=i+1;const cls=step===n?'active':step>n?'done':'';return(
                <li key={n} className={cls}>
                  <div className="rp-snum">{step>n?<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>:n}</div>
                  <div><div className="rp-sidx">{s.index}</div><div className="rp-stitle">{s.title}</div></div>
                </li>
              )})}
            </ul>
            <div className="rp-sep"></div>
            <div className="rp-note"><strong>Why StockBridge?</strong>Join 4,200+ businesses trading surplus stock. Clear stock 3× faster than traditional methods.</div>
          </aside>

          <div className="rp-card">
            <div className="rp-prog-wrap"><div className="rp-prog" style={{width:`${((step-1)/4)*100}%`}}></div></div>

            {/* STEP 1 */}
            {step===1&&<div>
              <div className="rp-ph"><h2>What type of account do you need?</h2><p>Select the option that best describes your business.</p></div>
              <div className="type-grid">
                <label className={`type-card${selectedType==='store'?' sel':''}`} onClick={()=>setSelectedType('store')}>
                  <div className="t-dot"></div>
                  <div className="t-ico"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
                  <h3>Retail / Wholesale Store</h3>
                  <p>Physical or online stores looking to sell surplus or source stock from other businesses.</p>
                </label>
                <label className={`type-card${selectedType==='company'?' sel':''}`} onClick={()=>setSelectedType('company')}>
                  <div className="t-dot"></div>
                  <div className="t-ico"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
                  <h3>Company / Enterprise</h3>
                  <p>Multi-location companies managing high-volume inventory and bulk stock exchanges.</p>
                </label>
              </div>
              <div className="sdiv">Contact Information</div>
              <div className="fg">
                <div className="rf"><label>Email Address</label><div className="iw"><span className="ico"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span><input type="email" placeholder="you@company.com" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})}/></div></div>
                <div className="rf"><label>Phone Number</label><div className="iw"><span className="ico"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-2.97-8.62A2 2 0 0 1 3.74 1.17h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.06-1.06a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span><input type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})}/></div></div>
              </div>
              <div className="fnav"><button type="button" className="bnext" onClick={()=>setStep(2)}>Continue to Business Details →</button></div>
            </div>}

            {/* STEP 2 */}
            {step===2&&<div>
              <div className="rp-ph"><h2>Tell us about your business</h2><p>Enter your business details. Optional fields can be added later.</p></div>
              <div className="mc">
                <div className="mh" onClick={()=>setMapOpen(o=>!o)}>
                  <div className="mhl"><div className="mico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div><div><div className="mttl">Find on Google Maps <span className="opt">Optional</span></div><div className="msub">Click your location to auto-fill the address</div></div></div>
                  <svg style={{transition:'transform 0.25s',transform:mapOpen?'rotate(180deg)':'none'}} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                {mapOpen&&<div className="mb"><div className="mpl"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b8ccb8" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><p>Map preview</p><small style={{fontSize:'0.72rem',color:'#b8ccb8'}}>Google Maps API required</small></div></div>}
              </div>
              <div className="fg">
                <div className="rf s2"><label>Business Name</label><div className="iw"><span className="ico"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span><input type="text" placeholder="Your Company Ltd." value={formData.businessName} onChange={e=>setFormData({...formData,businessName:e.target.value})}/></div></div>
                <div className="rf"><label>Business Type</label><div className="iw"><span className="ico"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></span><select style={{paddingLeft:37}} value={formData.businessType} onChange={e=>setFormData({...formData,businessType:e.target.value})}><option value="">Select…</option><option>Electronics</option><option>Apparel</option><option>Food &amp; Beverage</option><option>Tools &amp; Hardware</option><option>Other</option></select></div></div>
                <div className="rf"><label>Registration No. <span className="opt">Optional</span></label><div className="iw"><span className="ico"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span><input type="text" placeholder="e.g. 12345678" value={formData.registrationNo} onChange={e=>setFormData({...formData,registrationNo:e.target.value})}/></div></div>
                <div className="rf s2"><label>Street Address</label><div className="iw"><span className="ico"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span><input type="text" placeholder="123 Main Street" value={formData.streetAddress} onChange={e=>setFormData({...formData,streetAddress:e.target.value})}/></div></div>
                <div className="rf"><label>City</label><div className="iw"><input type="text" placeholder="New York" className="ni" value={formData.city} onChange={e=>setFormData({...formData,city:e.target.value})}/></div></div>
                <div className="rf"><label>Postcode</label><div className="iw"><input type="text" placeholder="10001" className="ni" value={formData.postcode} onChange={e=>setFormData({...formData,postcode:e.target.value})}/></div></div>
              </div>
              <div className="fnav"><button type="button" className="bback" onClick={()=>setStep(1)}>← Back</button><button type="button" className="bnext" onClick={()=>setStep(3)}>Continue to Security →</button></div>
            </div>}

            {/* STEP 3 */}
            {step===3&&<div>
              <div className="rp-ph"><h2>Set up your security</h2><p>Create a strong password and optionally enrol biometrics.</p></div>
              <div className="fg">
                <div className="rf s2">
                  <label>Password</label>
                  <div className="iw"><span className="ico"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span><input type={pwVisible?'text':'password'} placeholder="Create a secure password" value={pw} onChange={e=>setPw(e.target.value)}/><button type="button" className="pw-eye-r" onClick={()=>setPwVisible(v=>!v)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></div>
                  <div className="sbars">{[1,2,3,4].map(i=><div key={i} className="sbar" style={{background:i<=strength?strengthColors[strength]:undefined}}></div>)}<span className="stxt">{strengthLabels[strength]}</span></div>
                </div>
                <div className="rf s2"><label>Confirm Password</label><div className="iw"><span className="ico"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span><input type="password" placeholder="Repeat your password"/></div></div>
              </div>
              <div style={{height:16}}></div>
              <button type="button" className="fpe"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 1a11 11 0 0 0-8.82 17.6"/><path d="M12 7a5 5 0 0 1 5 5"/><path d="M12 7a5 5 0 0 0-4.9 4"/><path d="M8 12a4 4 0 0 0 4 4"/><path d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-2 5.6"/></svg>Enrol Fingerprint<span className="opt">Optional</span></button>
              <div style={{height:16}}></div>
              <div className="terms"><input type="checkbox" id="terms"/><p><label htmlFor="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>. I confirm all business details are accurate.</label></p></div>
              <div className="fnav"><button type="button" className="bback" onClick={()=>setStep(2)}>← Back</button><button type="button" className="bnext" onClick={()=>setStep(4)}>Review &amp; Submit →</button></div>
            </div>}

            {/* STEP 4 */}
            {step===4&&<div>
              <div className="rp-ph"><h2>Review &amp; confirm</h2><p>Everything looks good? Submit to create your account.</p></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:28}}>
                {[
                  {key:'Account Type',val:selectedType==='store'?'Retail / Wholesale Store':'Company / Enterprise'},
                  {key:'Email',val:formData.email || 'Not provided'},
                  {key:'Phone',val:formData.phone || 'Not provided'},
                  {key:'Business Name',val:formData.businessName || 'Not provided'},
                  {key:'Business Type',val:formData.businessType || 'Not selected'},
                  {key:'City',val:formData.city || 'Not provided'}
                ].map(s=>(
                  <div key={s.key} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:9,padding:'12px 14px'}}>
                    <div style={{fontSize:'0.67rem',fontWeight:600,color:'#98b098',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>{s.key}</div>
                    <div style={{fontSize:'0.87rem',color:'var(--text)',fontWeight:500}}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="fnav"><button type="button" className="bback" onClick={()=>setStep(3)}>← Back</button><button type="button" className="bnext" onClick={handleSubmit}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Create My Account</button></div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}
