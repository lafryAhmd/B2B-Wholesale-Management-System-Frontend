import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'

function fmtCurrency(v) { return '$' + Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function fmtDate(v) { if (!v) return '—'; return new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

export default function OrderPayment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER')
  const [payRef, setPayRef] = useState('')
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await axios.get(`/api/orders/${id}`)
        setOrder(res.data)
      } catch { setOrder(null) }
      setLoading(false)
    }
    load()
  }, [id])

  const [paymentResult, setPaymentResult] = useState(null)

  async function handlePayment() {
    setPaying(true)
    try {
      const totalAmount = order.finalAmount || order.totalAmount || 0
      const res = await axios.post(`/api/invoices/order/${id}/pay`, {
        amount: totalAmount,
        paymentMethod: payMethod,
        referenceNumber: payRef,
        notes: 'Payment from Order Payment page',
        processedBy: 'Customer'
      })
      setPaymentResult(res.data)
      setPaid(true)
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      alert('Payment failed: ' + msg)
    }
    setPaying(false)
  }

  const METHODS = [
    { value: 'CASH', label: 'Cash', icon: '💵', desc: 'Pay with physical cash' },
    { value: 'CARD', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦', desc: 'Direct bank wire transfer' },
    { value: 'ONLINE', label: 'Online Payment', icon: '🌐', desc: 'PayPal, Stripe, etc.' },
  ]

  return (
    <DashboardLayout activePage="orders" welcomeText="Complete your <strong>payment</strong> for the approved order.">
      <style>{`
        .op-back{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:7px;font-size:.82rem;font-weight:500;color:var(--muted);cursor:pointer;border:1.5px solid var(--border);background:var(--surface);font-family:'DM Sans',sans-serif;transition:all .18s;margin-bottom:24px;text-decoration:none;}
        .op-back:hover{border-color:var(--accent);color:var(--accent);}
        .op-grid{display:grid;grid-template-columns:1fr 380px;gap:24px;align-items:start;animation:fadeUp .35s ease both;}
        .op-card{background:var(--surface);border:1.5px solid var(--border);border-radius:14px;overflow:hidden;}
        .op-card-head{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
        .op-card-body{padding:24px;}
        .op-order-num{font-family:'DM Mono',monospace;font-size:.85rem;color:var(--muted);}
        .op-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:20px;font-size:.75rem;font-weight:600;background:var(--light);color:var(--green3);}
        .op-badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor;}
        .op-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
        .op-info-label{font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px;}
        .op-items-table{width:100%;border-collapse:collapse;margin-bottom:16px;}
        .op-items-table thead th{text-align:left;font-size:.7rem;font-weight:600;color:#98b098;text-transform:uppercase;letter-spacing:.08em;padding:10px 0;border-bottom:1.5px solid var(--border);}
        .op-items-table thead th:nth-child(2),.op-items-table thead th:nth-child(3),.op-items-table thead th:last-child{text-align:right;}
        .op-items-table tbody td{padding:13px 0;font-size:.85rem;border-bottom:1px solid var(--border);}
        .op-items-table tbody td:nth-child(2),.op-items-table tbody td:nth-child(3),.op-items-table tbody td:last-child{text-align:right;}
        .op-total{border-top:2px solid var(--border);padding-top:14px;margin-top:8px;}
        .op-total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:.88rem;}

        .op-method-list{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}
        .op-method{display:flex;align-items:center;gap:14px;padding:14px 18px;border:1.5px solid var(--border);border-radius:12px;cursor:pointer;transition:all .2s;background:var(--surface);}
        .op-method:hover{border-color:var(--accent);background:#f4f7f4;}
        .op-method.act{border-color:var(--accent);background:var(--light);box-shadow:0 2px 8px rgba(22,163,74,.08);}
        .op-method-icon{font-size:1.5rem;width:40px;text-align:center;}
        .op-method-info{flex:1;}
        .op-method-label{font-size:.88rem;font-weight:600;color:var(--text);}
        .op-method-desc{font-size:.76rem;color:var(--muted);margin-top:1px;}
        .op-method input{accent-color:var(--accent);width:16px;height:16px;}
        .op-ref-field{margin-bottom:20px;}
        .op-ref-field label{display:block;font-size:.8rem;font-weight:600;color:var(--text);margin-bottom:6px;}
        .op-ref-field input{width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.86rem;outline:none;background:var(--surface);color:var(--text);box-sizing:border-box;}
        .op-ref-field input:focus{border-color:var(--accent);}
        .op-pay-btn{width:100%;padding:14px;background:var(--green);color:#fff;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.92rem;font-weight:600;cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .op-pay-btn:hover{background:var(--green2);box-shadow:0 4px 16px rgba(20,83,45,.2);}
        .op-pay-btn:disabled{background:#ccc;cursor:wait;}
        .op-warn{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;font-size:.8rem;color:#92400e;margin-bottom:16px;display:flex;align-items:center;gap:8px;line-height:1.4;}
        .op-success{text-align:center;padding:40px 20px;}
        .op-success-icon{width:64px;height:64px;border-radius:50%;background:var(--light);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:1.8rem;}
        .op-success h2{font-family:'DM Serif Display',serif;font-size:1.3rem;color:var(--text);margin-bottom:6px;}
        .op-success p{font-size:.88rem;color:var(--muted);margin-bottom:20px;}
        .op-success-detail{background:var(--bg);border-radius:10px;padding:16px;text-align:left;margin-bottom:20px;}
        .op-success-row{display:flex;justify-content:space-between;padding:5px 0;font-size:.84rem;}
        .op-success-btns{display:flex;gap:10px;justify-content:center;}
        .op-success-btns a,.op-success-btns button{padding:10px 20px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.86rem;font-weight:600;cursor:pointer;transition:all .18s;text-decoration:none;display:inline-flex;align-items:center;gap:6px;}
        .op-loading{text-align:center;padding:80px 20px;color:var(--muted);}
        .op-spinner{width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;margin:0 auto 14px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:900px){.op-grid{grid-template-columns:1fr;}}
      `}</style>

      <Link to="/orders" className="op-back">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Orders
      </Link>

      {loading ? (
        <div className="op-loading"><div className="op-spinner"></div>Loading order...</div>
      ) : !order ? (
        <div className="op-loading" style={{ color: '#be123c' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>⚠️</div>
          Order not found
        </div>
      ) : paid ? (
        /* ─── Payment Success ─── */
        <div className="op-card">
          <div className="op-success">
            <div className="op-success-icon">✅</div>
            <h2>Payment Successful!</h2>
            <p>Your payment for order {order.orderNumber} has been recorded.</p>
            <div className="op-success-detail">
              <div className="op-success-row"><span style={{ color: 'var(--muted)' }}>Order</span><span style={{ fontWeight: 600 }}>{order.orderNumber}</span></div>
              <div className="op-success-row"><span style={{ color: 'var(--muted)' }}>Amount Paid</span><span style={{ fontWeight: 700, color: 'var(--green)' }}>{fmtCurrency(order.finalAmount)}</span></div>
              <div className="op-success-row"><span style={{ color: 'var(--muted)' }}>Payment Method</span><span style={{ fontWeight: 500 }}>{METHODS.find(m => m.value === payMethod)?.label}</span></div>
              {payRef && <div className="op-success-row"><span style={{ color: 'var(--muted)' }}>Reference</span><span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{payRef}</span></div>}
              <div className="op-success-row"><span style={{ color: 'var(--muted)' }}>Date</span><span style={{ fontWeight: 500 }}>{fmtDate(new Date())}</span></div>
            </div>
            <div className="op-success-btns">
              <Link to="/orders" style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Back to Orders
              </Link>
              <Link to="/dashboard" style={{ background: 'var(--green)', border: 'none', color: '#fff' }}>
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Payment Form ─── */
        <div className="op-grid">
          {/* Order Summary */}
          <div className="op-card">
            <div className="op-card-head">
              <div>
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Order Summary</span>
                <span className="op-order-num" style={{ marginLeft: 10 }}>#{order.orderNumber}</span>
              </div>
              <span className="op-badge"><span className="op-badge-dot"></span>{order.status}</span>
            </div>
            <div className="op-card-body">
              <div className="op-info-grid">
                <div>
                  <div className="op-info-label">Seller</div>
                  <div style={{ fontWeight: 600 }}>{order.business?.name || 'Business'}</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{order.business?.email || ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: 4 }}><span className="op-info-label">Order Date: </span><span style={{ fontWeight: 500 }}>{fmtDate(order.orderDate)}</span></div>
                  {order.approvalType && <div><span className="op-info-label">Approval: </span><span style={{ fontWeight: 500 }}>{order.approvalType}</span></div>}
                </div>
              </div>

              <table className="op-items-table">
                <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                <tbody>
                  {(order.items || []).map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{item.product?.name || `Product #${item.productId}`}</td>
                      <td>{item.quantity}</td>
                      <td>{fmtCurrency(item.unitPrice)}</td>
                      <td style={{ fontWeight: 500 }}>{fmtCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="op-total">
                <div className="op-total-row"><span style={{ color: 'var(--muted)' }}>Subtotal</span><span style={{ fontWeight: 600 }}>{fmtCurrency(order.totalAmount)}</span></div>
                {(order.discountAmount || 0) > 0 && <div className="op-total-row"><span style={{ color: 'var(--accent)' }}>Discount</span><span style={{ color: 'var(--accent)', fontWeight: 600 }}>-{fmtCurrency(order.discountAmount)}</span></div>}
                <div className="op-total-row" style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Total to Pay</span>
                  <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--green)' }}>{fmtCurrency(order.finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="op-card">
            <div className="op-card-head"><span style={{ fontWeight: 600, fontSize: '1rem' }}>Payment</span></div>
            <div className="op-card-body">
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '.73rem', color: 'var(--muted)', marginBottom: 4 }}>Amount Due</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--green)', fontFamily: "'DM Serif Display',serif" }}>{fmtCurrency(order.finalAmount)}</div>
              </div>

              <div style={{ fontSize: '.82rem', fontWeight: 600, marginBottom: 10 }}>Select Payment Method</div>
              <div className="op-method-list">
                {METHODS.map(m => (
                  <label key={m.value} className={`op-method${payMethod === m.value ? ' act' : ''}`} onClick={() => setPayMethod(m.value)}>
                    <input type="radio" name="payMethod" value={m.value} checked={payMethod === m.value} onChange={() => setPayMethod(m.value)} />
                    <span className="op-method-icon">{m.icon}</span>
                    <div className="op-method-info">
                      <div className="op-method-label">{m.label}</div>
                      <div className="op-method-desc">{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="op-ref-field">
                <label>Reference / Transaction Number (optional)</label>
                <input type="text" placeholder="e.g. TXN-00123456" value={payRef} onChange={e => setPayRef(e.target.value)} />
              </div>

              <div className="op-warn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Payment records are final and cannot be altered after submission.
              </div>

              <button className="op-pay-btn" onClick={handlePayment} disabled={paying}>
                {paying ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block' }}></span>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    Pay {fmtCurrency(order.finalAmount)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
