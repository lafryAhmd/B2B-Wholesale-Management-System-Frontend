import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

function fmtCurrency(v) { return '$' + Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function fmtDate(v) { if (!v) return '—'; const d = new Date(v); return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

// ─── My Invoices (Buyer View) ────────────────────────────────────────────────
export function MyInvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await axios.get(`/api/invoices/my?businessId=${user.id}`)
        setInvoices(res.data || [])
      } catch { setInvoices([]) }
      setLoading(false)
    }
    load()
  }, [user.id])

  const filtered = invoices.filter(inv => {
    const matchSearch = !search || (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) || (inv.buyerCompany || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  const unpaid = invoices.filter(i => i.status === 'UNPAID').length
  const overdue = invoices.filter(i => i.status === 'OVERDUE').length
  const paid = invoices.filter(i => i.status === 'PAID').length
  const totalDue = invoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + (i.totalAmount || 0), 0)

  return (
    <DashboardLayout activePage="invoices" welcomeText="View and manage your <strong>invoices</strong> — track payments and due dates.">
      <style>{`
        .inv-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;animation:fadeUp .35s ease both .05s;}
        .inv-stat{background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:16px 18px;position:relative;overflow:hidden;}
        .inv-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
        .inv-stat.green::before{background:linear-gradient(90deg,var(--accent),var(--teal));}
        .inv-stat.amber::before{background:linear-gradient(90deg,#d97706,#f59e0b);}
        .inv-stat.red::before{background:linear-gradient(90deg,#be123c,#f43f5e);}
        .inv-stat.blue::before{background:linear-gradient(90deg,#2563eb,#0ea5e9);}
        .inv-stat-label{font-size:.73rem;color:var(--muted);margin-bottom:6px;}
        .inv-stat-val{font-family:'DM Serif Display',serif;font-size:1.4rem;color:var(--text);}
        .inv-card{background:var(--surface);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;animation:fadeUp .35s ease both .1s;}
        .inv-card-head{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);}
        .inv-search{display:flex;gap:10px;}
        .inv-search input,.inv-search select{padding:9px 14px;border:1.5px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.84rem;background:var(--surface);color:var(--text);outline:none;}
        .inv-search input{width:220px;}
        .inv-search input:focus,.inv-search select:focus{border-color:var(--accent);}
        .inv-table{width:100%;border-collapse:collapse;}
        .inv-table thead th{text-align:left;font-size:.69rem;font-weight:600;color:#98b098;text-transform:uppercase;letter-spacing:.1em;padding:12px 20px;border-bottom:1px solid var(--border);}
        .inv-table tbody tr{border-bottom:1px solid var(--border);transition:background .15s;}
        .inv-table tbody tr:last-child{border-bottom:none;}
        .inv-table tbody tr:hover{background:var(--bg);}
        .inv-table tbody td{padding:14px 20px;font-size:.85rem;color:var(--text);vertical-align:middle;}
        .inv-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:.73rem;font-weight:600;}
        .inv-badge.UNPAID{background:#fffbeb;color:#d97706;}
        .inv-badge.PAID{background:var(--light);color:var(--green3);}
        .inv-badge.OVERDUE{background:#fff1f2;color:#be123c;}
        .inv-badge.CANCELLED{background:var(--bg);color:var(--muted);}
        .inv-badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor;}
        .inv-btn{padding:6px 14px;border-radius:7px;font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .18s;border:none;display:inline-flex;align-items:center;gap:5px;}
        .inv-btn-view{background:var(--bg);color:var(--text);border:1.5px solid var(--border);}
        .inv-btn-view:hover{border-color:var(--accent);color:var(--accent);}
        .inv-btn-pay{background:var(--green);color:#fff;}
        .inv-btn-pay:hover{background:var(--green2);}
        .inv-mono{font-family:'DM Mono',monospace;font-size:.82rem;color:var(--muted);}
        .inv-empty{text-align:center;padding:60px 20px;color:var(--muted);}
        .inv-loading{text-align:center;padding:60px;color:var(--muted);}
        .inv-spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;margin:0 auto 12px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:1024px){.inv-stats{grid-template-columns:repeat(2,1fr);}}
      `}</style>

      <div className="db-page-head">
        <div>
          <h1 className="db-page-title">My Invoices</h1>
          <p className="db-page-sub">View and pay your invoices</p>
        </div>
      </div>

      <div className="inv-stats">
        <div className="inv-stat amber"><div className="inv-stat-label">Unpaid</div><div className="inv-stat-val">{unpaid}</div></div>
        <div className="inv-stat red"><div className="inv-stat-label">Overdue</div><div className="inv-stat-val">{overdue}</div></div>
        <div className="inv-stat green"><div className="inv-stat-label">Paid</div><div className="inv-stat-val">{paid}</div></div>
        <div className="inv-stat blue"><div className="inv-stat-label">Total Outstanding</div><div className="inv-stat-val" style={{ fontSize: '1.2rem' }}>{fmtCurrency(totalDue)}</div></div>
      </div>

      <div className="inv-card">
        <div className="inv-card-head">
          <div className="inv-search">
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
          <div className="inv-loading"><div className="inv-spinner"></div>Loading invoices...</div>
        ) : filtered.length === 0 ? (
          <div className="inv-empty">
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📄</div>
            <div>No invoices found</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="inv-table">
              <thead><tr><th>Invoice #</th><th>Order</th><th>Issued</th><th>Due Date</th><th>Amount</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id}>
                    <td><span className="inv-mono">{inv.invoiceNumber}</span></td>
                    <td><span className="inv-mono">{inv.order?.orderNumber || inv.orderRef || '—'}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{fmtDate(inv.issuedAt)}</td>
                    <td style={{ color: inv.status === 'OVERDUE' ? '#be123c' : 'var(--muted)', fontWeight: inv.status === 'OVERDUE' ? 600 : 400 }}>{fmtDate(inv.dueDate)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--green3)' }}>{fmtCurrency(inv.totalAmount)}</td>
                    <td><span className={`inv-badge ${inv.status}`}><span className="inv-badge-dot"></span>{inv.status}</span></td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/invoices/${inv.id}`} className="inv-btn inv-btn-view">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

// ─── Invoice Detail Page ─────────────────────────────────────────────────────
export function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payModal, setPayModal] = useState(false)
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await axios.get(`/api/invoices/${id}`)
        setInvoice(res.data)
      } catch { setInvoice(null) }
      setLoading(false)
    }
    load()
  }, [id])

  async function handlePay() {
    setPaying(true)
    try {
      await axios.post(`/api/invoices/${id}/pay`, {
        amount: invoice.balanceDue || invoice.totalAmount,
        paymentMethod: payMethod,
        processedBy: 'Customer'
      })
      const res = await axios.get(`/api/invoices/${id}`)
      setInvoice(res.data)
      setPayModal(false)
      alert('Payment recorded successfully!')
    } catch (err) {
      alert('Payment failed: ' + (err.response?.data?.message || err.message))
    }
    setPaying(false)
  }

  const METHODS = [
    { value: 'CASH', label: 'Cash', icon: '💵' },
    { value: 'CARD', label: 'Card', icon: '💳' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦' },
    { value: 'ONLINE', label: 'Online Payment', icon: '🌐' },
  ]

  if (loading) return (
    <DashboardLayout activePage="invoices">
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .6s linear infinite', margin: '0 auto 12px' }}></div>
        Loading invoice...
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </DashboardLayout>
  )

  if (!invoice) return (
    <DashboardLayout activePage="invoices">
      <div style={{ textAlign: 'center', padding: 80, color: '#be123c' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>⚠️</div>
        Invoice not found
        <div style={{ marginTop: 12 }}><button onClick={() => navigate('/invoices')} style={{ padding: '8px 16px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>Back to Invoices</button></div>
      </div>
    </DashboardLayout>
  )

  const items = invoice.order?.items || invoice.items || []

  return (
    <DashboardLayout activePage="invoices">
      <style>{`
        .inv-detail-grid{display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:start;animation:fadeUp .35s ease both;}
        .inv-doc{background:var(--surface);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;}
        .inv-doc-head{padding:20px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);}
        .inv-doc-body{padding:24px;}
        .inv-doc-info{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;}
        .inv-doc-label{font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;}
        .inv-items-table{width:100%;border-collapse:collapse;margin-bottom:20px;}
        .inv-items-table thead th{text-align:left;font-size:.72rem;font-weight:600;color:#98b098;text-transform:uppercase;letter-spacing:.08em;padding:10px 0;border-bottom:1.5px solid var(--border);}
        .inv-items-table thead th:last-child,.inv-items-table thead th:nth-child(2),.inv-items-table thead th:nth-child(3){text-align:right;}
        .inv-items-table tbody td{padding:12px 0;font-size:.85rem;border-bottom:1px solid var(--border);}
        .inv-items-table tbody td:last-child,.inv-items-table tbody td:nth-child(2),.inv-items-table tbody td:nth-child(3){text-align:right;}
        .inv-items-table tfoot td{padding:10px 0;font-size:.88rem;}
        .inv-items-table tfoot td:last-child{text-align:right;}
        .inv-side{background:var(--surface);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;}
        .inv-side-head{padding:16px 20px;border-bottom:1px solid var(--border);font-size:.9rem;font-weight:600;}
        .inv-side-body{padding:20px;}
        .inv-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:.73rem;font-weight:600;}
        .inv-badge.UNPAID{background:#fffbeb;color:#d97706;}
        .inv-badge.PAID{background:var(--light);color:var(--green3);}
        .inv-badge.OVERDUE{background:#fff1f2;color:#be123c;}
        .inv-badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor;}
        .inv-pay-btn{width:100%;padding:12px;background:var(--green);color:#fff;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:10px;}
        .inv-pay-btn:hover{background:var(--green2);box-shadow:0 4px 16px rgba(20,83,45,.2);}
        .inv-paid-box{background:var(--light);border-radius:10px;padding:14px;text-align:center;margin-bottom:10px;}

        /* Pay Modal */
        .pay-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:300;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease;}
        .pay-modal{background:var(--surface);border-radius:16px;padding:28px;width:440px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,.15);animation:fadeUp .25s ease;}
        .pay-modal-title{font-family:'DM Serif Display',serif;font-size:1.15rem;color:var(--text);margin-bottom:18px;}
        .pay-method-list{display:flex;flex-direction:column;gap:8px;margin-bottom:20px;}
        .pay-method{display:flex;align-items:center;gap:12px;padding:12px 16px;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;transition:all .18s;background:var(--surface);}
        .pay-method:hover{border-color:var(--accent);}
        .pay-method.act{border-color:var(--accent);background:var(--light);}
        .pay-method-icon{font-size:1.3rem;}
        .pay-method-label{font-size:.88rem;font-weight:500;}
        .pay-method input{accent-color:var(--accent);}
        .pay-summary{display:flex;justify-content:space-between;padding:14px 16px;background:var(--bg);border-radius:10px;margin-bottom:18px;}
        .pay-btns{display:flex;gap:10px;}
        .pay-btns button{flex:1;padding:11px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.86rem;font-weight:600;cursor:pointer;transition:all .18s;}
        .pay-warn{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;font-size:.8rem;color:#92400e;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
        @media(max-width:900px){.inv-detail-grid{grid-template-columns:1fr;}}
      `}</style>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate('/invoices')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: '.84rem', fontFamily: "'DM Sans',sans-serif", color: 'var(--muted)', transition: 'all .18s' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Invoices
        </button>
      </div>

      <div className="inv-detail-grid">
        {/* Invoice Document */}
        <div className="inv-doc">
          <div className="inv-doc-head">
            <div>
              <span style={{ fontWeight: 600, fontSize: '1rem' }}>Invoice</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '.83rem', color: 'var(--muted)', marginLeft: 10 }}>#{invoice.invoiceNumber}</span>
            </div>
            <span className={`inv-badge ${invoice.status}`}><span className="inv-badge-dot"></span>{invoice.status}</span>
          </div>
          <div className="inv-doc-body">
            <div className="inv-doc-info">
              <div>
                <div className="inv-doc-label">Bill To</div>
                <div style={{ fontWeight: 600 }}>{invoice.buyerCompany || '—'}</div>
                <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{invoice.buyerEmail || ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: 6 }}><span className="inv-doc-label">Issued: </span><span style={{ fontWeight: 500 }}>{fmtDate(invoice.issuedAt)}</span></div>
                <div style={{ marginBottom: 6 }}><span className="inv-doc-label">Due: </span><span style={{ fontWeight: 500, color: invoice.status === 'OVERDUE' ? '#be123c' : 'inherit' }}>{fmtDate(invoice.dueDate)}</span></div>
                <div><span className="inv-doc-label">Order: </span><span style={{ fontFamily: "'DM Mono',monospace", fontSize: '.83rem' }}>{invoice.order?.orderNumber || '—'}</span></div>
              </div>
            </div>

            <table className="inv-items-table">
              <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{item.product?.name || item.productName || 'Product'}</td>
                    <td>{item.quantity}</td>
                    <td>{fmtCurrency(item.unitPrice)}</td>
                    <td style={{ fontWeight: 500 }}>{fmtCurrency(item.lineTotal || item.total || (item.unitPrice * item.quantity))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={3} style={{ textAlign: 'right', fontWeight: 600, paddingTop: 16 }}>Subtotal</td><td style={{ fontWeight: 600, paddingTop: 16 }}>{fmtCurrency(invoice.subtotal || invoice.order?.totalAmount)}</td></tr>
                {(invoice.discountAmount || 0) > 0 && <tr><td colSpan={3} style={{ textAlign: 'right', color: 'var(--accent)' }}>Discount</td><td style={{ color: 'var(--accent)' }}>-{fmtCurrency(invoice.discountAmount)}</td></tr>}
                {(invoice.lateFee || 0) > 0 && <tr><td colSpan={3} style={{ textAlign: 'right', color: '#be123c' }}>Late Fee</td><td style={{ color: '#be123c' }}>+{fmtCurrency(invoice.lateFee)}</td></tr>}
                <tr><td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.05rem', paddingTop: 12 }}>Total Due</td><td style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--green)', paddingTop: 12 }}>{fmtCurrency(invoice.totalAmount)}</td></tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment Sidebar */}
        <div className="inv-side">
          <div className="inv-side-head">Payment</div>
          <div className="inv-side-body">
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '.73rem', color: 'var(--muted)', marginBottom: 4 }}>Amount Due</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--green)', fontFamily: "'DM Serif Display',serif" }}>{fmtCurrency(invoice.totalAmount)}</div>
            </div>

            {(invoice.status === 'UNPAID' || invoice.status === 'OVERDUE') ? (
              <button className="inv-pay-btn" onClick={() => setPayModal(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Pay Now
              </button>
            ) : (
              <div className="inv-paid-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" style={{ marginBottom: 4 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <div style={{ fontWeight: 600, color: 'var(--green)', fontSize: '.88rem' }}>Payment Received</div>
                {invoice.paidAt && <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 2 }}>{fmtDate(invoice.paidAt)}</div>}
                {invoice.paymentMethod && <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>via {invoice.paymentMethod.replace(/_/g, ' ')}</div>}
              </div>
            )}

            {invoice.lateFee > 0 && (
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '10px 14px', fontSize: '.8rem', color: '#be123c', marginTop: 10 }}>
                A late fee of {fmtCurrency(invoice.lateFee)} has been applied.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pay Modal */}
      {payModal && (
        <div className="pay-overlay" onClick={() => setPayModal(false)}>
          <div className="pay-modal" onClick={e => e.stopPropagation()}>
            <div className="pay-modal-title">Make Payment</div>
            <div className="pay-summary">
              <span style={{ color: 'var(--muted)', fontSize: '.88rem' }}>Total amount</span>
              <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: '1.05rem' }}>{fmtCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="pay-warn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Payment records are final and cannot be altered after submission.
            </div>
            <div style={{ fontSize: '.82rem', fontWeight: 600, marginBottom: 8 }}>Select Payment Method</div>
            <div className="pay-method-list">
              {METHODS.map(m => (
                <label key={m.value} className={`pay-method${payMethod === m.value ? ' act' : ''}`} onClick={() => setPayMethod(m.value)}>
                  <input type="radio" name="payMethod" value={m.value} checked={payMethod === m.value} onChange={() => setPayMethod(m.value)} />
                  <span className="pay-method-icon">{m.icon}</span>
                  <span className="pay-method-label">{m.label}</span>
                </label>
              ))}
            </div>
            <div className="pay-btns">
              <button onClick={() => setPayModal(false)} style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)' }}>Cancel</button>
              <button onClick={handlePay} disabled={paying} style={{ background: paying ? '#ccc' : 'var(--green)', border: 'none', color: '#fff', cursor: paying ? 'wait' : 'pointer' }}>
                {paying ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
