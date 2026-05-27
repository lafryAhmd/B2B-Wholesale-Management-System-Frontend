import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

function fmtCurrency(v) { return '$' + Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function fmtDate(v) { if (!v) return '—'; const d = new Date(v); return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
function fmtDatetime(v) { if (!v) return '—'; const d = new Date(v); return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }

// ─── Finance Invoice Management ──────────────────────────────────────────────
export function FinanceInvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [payModal, setPayModal] = useState(null)
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER')
  const [payRef, setPayRef] = useState('')
  const [paying, setPaying] = useState(false)

  async function loadInvoices() {
    setLoading(true)
    try {
      const url = statusFilter ? `/api/invoices?status=${statusFilter}` : '/api/invoices'
      const res = await axios.get(url)
      setInvoices(res.data || [])
    } catch { setInvoices([]) }
    setLoading(false)
  }

  useEffect(() => { loadInvoices() }, [statusFilter])

  async function recordPayment() {
    if (!payModal) return
    setPaying(true)
    try {
      await axios.post(`/api/invoices/${payModal.id}/record-payment`, {
        amount: payModal.balanceDue || payModal.totalAmount,
        paymentMethod: payMethod,
        referenceNumber: payRef
      })
      setPayModal(null)
      setPayRef('')
      alert('Payment recorded successfully!')
      loadInvoices()
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message))
    }
    setPaying(false)
  }

  const filtered = invoices.filter(inv => {
    if (!search) return true
    return (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) || (inv.buyerCompany || '').toLowerCase().includes(search.toLowerCase())
  })

  const unpaid = invoices.filter(i => i.status === 'UNPAID').length
  const overdue = invoices.filter(i => i.status === 'OVERDUE').length
  const paidCount = invoices.filter(i => i.status === 'PAID').length
  const totalOutstanding = invoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + (i.totalAmount || 0), 0)

  return (
    <DashboardLayout activePage="finance-invoices" welcomeText="Record payments and monitor <strong>invoice status</strong> across all businesses.">
      <style>{`
        .fin-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;animation:fadeUp .35s ease both .05s;}
        .fin-stat{background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:16px 18px;position:relative;overflow:hidden;}
        .fin-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
        .fin-stat.green::before{background:linear-gradient(90deg,var(--accent),var(--teal));}
        .fin-stat.amber::before{background:linear-gradient(90deg,#d97706,#f59e0b);}
        .fin-stat.red::before{background:linear-gradient(90deg,#be123c,#f43f5e);}
        .fin-stat.blue::before{background:linear-gradient(90deg,#2563eb,#0ea5e9);}
        .fin-stat-label{font-size:.73rem;color:var(--muted);margin-bottom:6px;}
        .fin-stat-val{font-family:'DM Serif Display',serif;font-size:1.4rem;color:var(--text);}
        .fin-card{background:var(--surface);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;animation:fadeUp .35s ease both .1s;}
        .fin-card-head{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);}
        .fin-search{display:flex;gap:10px;}
        .fin-search input,.fin-search select{padding:9px 14px;border:1.5px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.84rem;background:var(--surface);color:var(--text);outline:none;}
        .fin-search input{width:220px;}
        .fin-search input:focus,.fin-search select:focus{border-color:var(--accent);}
        .fin-table{width:100%;border-collapse:collapse;}
        .fin-table thead th{text-align:left;font-size:.69rem;font-weight:600;color:#98b098;text-transform:uppercase;letter-spacing:.1em;padding:12px 20px;border-bottom:1px solid var(--border);}
        .fin-table tbody tr{border-bottom:1px solid var(--border);transition:background .15s;}
        .fin-table tbody tr:last-child{border-bottom:none;}
        .fin-table tbody tr:hover{background:var(--bg);}
        .fin-table tbody td{padding:14px 20px;font-size:.85rem;color:var(--text);vertical-align:middle;}
        .fin-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:.73rem;font-weight:600;}
        .fin-badge.UNPAID{background:#fffbeb;color:#d97706;}
        .fin-badge.PAID{background:var(--light);color:var(--green3);}
        .fin-badge.OVERDUE{background:#fff1f2;color:#be123c;}
        .fin-badge.CANCELLED{background:var(--bg);color:var(--muted);}
        .fin-badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor;}
        .fin-btn{padding:6px 14px;border-radius:7px;font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .18s;border:none;display:inline-flex;align-items:center;gap:5px;}
        .fin-btn-pay{background:var(--green);color:#fff;}
        .fin-btn-pay:hover{background:var(--green2);}
        .fin-mono{font-family:'DM Mono',monospace;font-size:.82rem;color:var(--muted);}
        .fin-empty{text-align:center;padding:60px 20px;color:var(--muted);}
        .fin-loading{text-align:center;padding:60px;color:var(--muted);}
        .fin-spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;margin:0 auto 12px;}

        .pay-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:300;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease;}
        .pay-modal{background:var(--surface);border-radius:16px;padding:28px;width:440px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,.15);animation:fadeUp .25s ease;}
        .pay-modal-title{font-family:'DM Serif Display',serif;font-size:1.15rem;color:var(--text);margin-bottom:18px;}
        .pay-summary{display:flex;justify-content:space-between;padding:12px 14px;background:var(--bg);border-radius:10px;margin-bottom:16px;font-size:.88rem;}
        .pay-warn{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;font-size:.8rem;color:#92400e;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
        .pay-field{margin-bottom:14px;}
        .pay-field label{display:block;font-size:.8rem;font-weight:600;color:var(--text);margin-bottom:6px;}
        .pay-field select,.pay-field input{width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.86rem;outline:none;background:var(--surface);color:var(--text);box-sizing:border-box;}
        .pay-field select:focus,.pay-field input:focus{border-color:var(--accent);}
        .pay-btns{display:flex;gap:10px;margin-top:18px;}
        .pay-btns button{flex:1;padding:11px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.86rem;font-weight:600;cursor:pointer;transition:all .18s;}

        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:1024px){.fin-stats{grid-template-columns:repeat(2,1fr);}}
      `}</style>

      <div className="db-page-head">
        <div>
          <h1 className="db-page-title">Invoice Management</h1>
          <p className="db-page-sub">Record payments and monitor invoice status</p>
        </div>
      </div>

      <div className="fin-stats">
        <div className="fin-stat amber"><div className="fin-stat-label">Unpaid</div><div className="fin-stat-val">{unpaid}</div></div>
        <div className="fin-stat red"><div className="fin-stat-label">Overdue</div><div className="fin-stat-val">{overdue}</div></div>
        <div className="fin-stat green"><div className="fin-stat-label">Paid</div><div className="fin-stat-val">{paidCount}</div></div>
        <div className="fin-stat blue"><div className="fin-stat-label">Total Outstanding</div><div className="fin-stat-val" style={{ fontSize: '1.15rem' }}>{fmtCurrency(totalOutstanding)}</div></div>
      </div>

      <div className="fin-card">
        <div className="fin-card-head">
          <div className="fin-search">
            <input type="text" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="fin-loading"><div className="fin-spinner"></div>Loading invoices...</div>
        ) : filtered.length === 0 ? (
          <div className="fin-empty"><div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📄</div><div>No invoices found</div></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="fin-table">
              <thead><tr><th>Invoice #</th><th>Company</th><th>Issued</th><th>Due Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id}>
                    <td><span className="fin-mono">{inv.invoiceNumber}</span></td>
                    <td style={{ fontWeight: 500 }}>{inv.buyerCompany || '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{fmtDate(inv.issuedAt)}</td>
                    <td style={{ color: inv.status === 'OVERDUE' ? '#be123c' : 'var(--muted)', fontWeight: inv.status === 'OVERDUE' ? 600 : 400 }}>{fmtDate(inv.dueDate)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--green3)' }}>{fmtCurrency(inv.totalAmount)}</td>
                    <td><span className={`fin-badge ${inv.status}`}><span className="fin-badge-dot"></span>{inv.status}</span></td>
                    <td>
                      {inv.status !== 'PAID' && (
                        <button className="fin-btn fin-btn-pay" onClick={() => { setPayModal(inv); setPayRef('') }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {payModal && (
        <div className="pay-overlay" onClick={() => setPayModal(null)}>
          <div className="pay-modal" onClick={e => e.stopPropagation()}>
            <div className="pay-modal-title">Record Payment</div>
            <div className="pay-summary">
              <span style={{ color: 'var(--muted)' }}>Invoice #{payModal.invoiceNumber} · {payModal.buyerCompany}</span>
              <span style={{ fontWeight: 700, color: 'var(--green)' }}>{fmtCurrency(payModal.totalAmount)}</span>
            </div>
            <div className="pay-warn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Payment records are immutable once submitted.
            </div>
            <div className="pay-field">
              <label>Payment Method *</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="ONLINE">Online Payment Gateway</option>
              </select>
            </div>
            <div className="pay-field">
              <label>Reference / Transaction Number</label>
              <input type="text" placeholder="e.g. TXN-00123456" value={payRef} onChange={e => setPayRef(e.target.value)} />
            </div>
            <div className="pay-btns">
              <button onClick={() => setPayModal(null)} style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)' }}>Cancel</button>
              <button onClick={recordPayment} disabled={paying} style={{ background: paying ? '#ccc' : 'var(--green)', border: 'none', color: '#fff', cursor: paying ? 'wait' : 'pointer' }}>
                {paying ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

// ─── Overdue Invoices ────────────────────────────────────────────────────────
export function OverdueInvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // First trigger overdue check, then get overdue list
        await axios.get('/api/invoices/overdue/check').catch(() => {})
        const res = await axios.get('/api/invoices/overdue')
        setInvoices(res.data || [])
      } catch { setInvoices([]) }
      setLoading(false)
    }
    load()
  }, [])

  const totalOutstanding = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0)

  return (
    <DashboardLayout activePage="overdue" welcomeText="Invoices past due date — <strong>late fees applied automatically</strong>.">
      <style>{`
        .ov-alert{background:#fff1f2;border:1.5px solid #fecdd3;border-radius:10px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:10px;font-size:.88rem;color:#be123c;animation:fadeUp .35s ease both .05s;}
        .ov-card{background:var(--surface);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;animation:fadeUp .35s ease both .1s;}
        .ov-table{width:100%;border-collapse:collapse;}
        .ov-table thead th{text-align:left;font-size:.69rem;font-weight:600;color:#98b098;text-transform:uppercase;letter-spacing:.1em;padding:12px 20px;border-bottom:1px solid var(--border);}
        .ov-table tbody tr{border-bottom:1px solid var(--border);transition:background .15s;}
        .ov-table tbody tr:last-child{border-bottom:none;}
        .ov-table tbody tr:hover{background:#fff5f5;}
        .ov-table tbody td{padding:14px 20px;font-size:.85rem;color:var(--text);vertical-align:middle;}
        .ov-mono{font-family:'DM Mono',monospace;font-size:.82rem;color:var(--muted);}
        .ov-empty{text-align:center;padding:60px 20px;color:var(--muted);}
        .ov-loading{text-align:center;padding:60px;color:var(--muted);}
        .ov-spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:#be123c;border-radius:50%;animation:spin .6s linear infinite;margin:0 auto 12px;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div className="db-page-head">
        <div>
          <h1 className="db-page-title">Overdue Invoices</h1>
          <p className="db-page-sub">Invoices past due date — late fees applied automatically</p>
        </div>
      </div>

      {invoices.length > 0 && (
        <div className="ov-alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <strong>{invoices.length} invoices</strong> are overdue. Total outstanding: <strong>{fmtCurrency(totalOutstanding)}</strong>
        </div>
      )}

      <div className="ov-card">
        {loading ? (
          <div className="ov-loading"><div className="ov-spinner"></div>Checking overdue invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="ov-empty">
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>✅</div>
            <div style={{ fontWeight: 500 }}>No overdue invoices</div>
            <div style={{ fontSize: '.82rem', marginTop: 4 }}>All invoices are paid or within due date</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ov-table">
              <thead><tr><th>Invoice #</th><th>Company</th><th>Due Date</th><th>Days Overdue</th><th>Amount</th><th>Late Fee</th></tr></thead>
              <tbody>
                {invoices.map(inv => {
                  const daysOverdue = inv.daysOverdue || Math.max(0, Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000))
                  return (
                    <tr key={inv.id}>
                      <td><Link to={`/invoices/${inv.id}`} style={{ textDecoration: 'none' }}><span className="ov-mono" style={{ color: 'var(--accent)' }}>{inv.invoiceNumber}</span></Link></td>
                      <td style={{ fontWeight: 500 }}>{inv.buyerCompany || '—'}</td>
                      <td style={{ color: '#be123c', fontWeight: 500 }}>{fmtDate(inv.dueDate)}</td>
                      <td><span style={{ color: '#be123c', fontWeight: 600 }}>{daysOverdue}d</span></td>
                      <td style={{ fontWeight: 600 }}>{fmtCurrency(inv.totalAmount)}</td>
                      <td>{(inv.lateFee || 0) > 0 ? <span style={{ color: '#d97706' }}>+{fmtCurrency(inv.lateFee)}</span> : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

// ─── Audit Trail ─────────────────────────────────────────────────────────────
export function AuditTrailPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (dateFrom) params.append('dateFrom', dateFrom)
        if (dateTo) params.append('dateTo', dateTo)
        if (actionFilter) params.append('action', actionFilter)
        const res = await axios.get(`/api/invoices/audit-trail?${params.toString()}`)
        setLogs(res.data || [])
      } catch { setLogs([]) }
      setLoading(false)
    }
    load()
  }, [dateFrom, dateTo, actionFilter])

  const filtered = logs.filter(l => {
    if (!search) return true
    return (l.userName || '').toLowerCase().includes(search.toLowerCase()) || (l.action || '').toLowerCase().includes(search.toLowerCase()) || (l.note || '').toLowerCase().includes(search.toLowerCase())
  })

  const actionColor = {
    INVOICE_CREATED: 'var(--accent)',
    PAYMENT_RECORDED: '#16a34a',
    LATE_FEE_APPLIED: '#d97706',
    STATUS_CHANGED: '#2563eb',
    SOFT_DELETED: '#be123c',
  }

  const ACTIONS = ['INVOICE_CREATED', 'PAYMENT_RECORDED', 'LATE_FEE_APPLIED', 'STATUS_CHANGED']

  return (
    <DashboardLayout activePage="audit" welcomeText="Immutable log of all <strong>financial operations</strong>.">
      <style>{`
        .at-info{background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:10px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:10px;font-size:.85rem;color:#1d4ed8;animation:fadeUp .35s ease both .05s;}
        .at-card{background:var(--surface);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;animation:fadeUp .35s ease both .1s;}
        .at-card-head{padding:16px 20px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-bottom:1px solid var(--border);}
        .at-card-head input,.at-card-head select{padding:9px 14px;border:1.5px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.84rem;background:var(--surface);color:var(--text);outline:none;}
        .at-card-head input:focus,.at-card-head select:focus{border-color:var(--accent);}
        .at-log{display:grid;grid-template-columns:1fr auto;padding:14px 20px;border-bottom:1px solid var(--border);align-items:start;gap:16px;transition:background .15s;}
        .at-log:last-child{border-bottom:none;}
        .at-log:hover{background:var(--bg);}
        .at-log-head{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
        .at-log-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .at-log-action{font-weight:500;font-size:.88rem;}
        .at-log-id{font-size:.78rem;color:var(--muted);font-family:'DM Mono',monospace;}
        .at-log-meta{font-size:.83rem;color:var(--muted);padding-left:16px;}
        .at-log-time{font-size:.78rem;color:var(--muted);white-space:nowrap;}
        .at-empty{text-align:center;padding:60px 20px;color:var(--muted);}
        .at-loading{text-align:center;padding:60px;color:var(--muted);}
        .at-spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;margin:0 auto 12px;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div className="db-page-head">
        <div>
          <h1 className="db-page-title">Financial Audit Trail</h1>
          <p className="db-page-sub">Immutable log of all financial operations</p>
        </div>
      </div>

      <div className="at-info">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        This audit trail is immutable. No entries can be modified or deleted by any user role.
      </div>

      <div className="at-card">
        <div className="at-card-head">
          <input type="text" placeholder="Search user or action..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ width: 200 }}>
            <option value="">All Actions</option>
            {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 150 }} />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 150 }} />
        </div>

        {loading ? (
          <div className="at-loading"><div className="at-spinner"></div>Loading audit trail...</div>
        ) : filtered.length === 0 ? (
          <div className="at-empty">
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📋</div>
            <div>No audit entries found</div>
          </div>
        ) : (
          <div>
            {filtered.map((log, i) => (
              <div key={i} className="at-log">
                <div>
                  <div className="at-log-head">
                    <span className="at-log-dot" style={{ background: actionColor[log.action] || 'var(--muted)' }}></span>
                    <span className="at-log-action">{(log.action || '').replace(/_/g, ' ')}</span>
                    <span className="at-log-id">#{log.recordId}</span>
                  </div>
                  <div className="at-log-meta">
                    by <strong>{log.userName || 'System'}</strong> ({log.userRole || 'SYSTEM'})
                    {log.note && ` · ${log.note}`}
                  </div>
                </div>
                <div className="at-log-time">{fmtDatetime(log.timestamp)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
