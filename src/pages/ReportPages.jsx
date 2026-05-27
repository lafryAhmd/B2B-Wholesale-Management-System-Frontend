import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'

function fmt(n) { return n != null ? Number(n).toLocaleString() : '0' }
function fmtCurrency(n) { return n != null ? '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$0.00' }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : '—' }

// Simple bar chart component (no recharts dependency)
function SimpleBarChart({ data, dataKey, labelKey, color = '#14532d', height = 220 }) {
  if (!data || data.length === 0) return null
  const maxVal = Math.max(...data.map(d => d[dataKey] || 0), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, padding: '10px 0' }}>
      {data.map((item, i) => {
        const val = item[dataKey] || 0
        const barH = Math.max(4, (val / maxVal) * (height - 40))
        const colors = ['#14532d', '#16a34a', '#0d9488', '#d97706', '#be123c', '#4a90d9', '#925f0a']
        const barColor = color === 'multi' ? colors[i % colors.length] : color
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: '.68rem', color: 'var(--muted)', fontWeight: 600 }}>{fmtCurrency(val)}</div>
            <div style={{ width: '100%', maxWidth: 48, height: barH, background: barColor, borderRadius: '6px 6px 0 0', transition: 'height .4s ease', minWidth: 24 }}></div>
            <div style={{ fontSize: '.68rem', color: 'var(--muted)', textAlign: 'center', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item[labelKey]}</div>
          </div>
        )
      })}
    </div>
  )
}

// Simple line chart component
function SimpleLineChart({ data, lines, labelKey, height = 220 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !data || data.length < 2) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const w = canvas.width = canvas.parentElement.offsetWidth
    const h = canvas.height = height
    const pad = { top: 20, right: 20, bottom: 30, left: 60 }

    ctx.clearRect(0, 0, w, h)

    // Find max across all lines
    let allMax = 0
    lines.forEach(line => {
      data.forEach(d => { if (d[line.key] > allMax) allMax = d[line.key] })
    })
    if (allMax === 0) allMax = 1

    const plotW = w - pad.left - pad.right
    const plotH = h - pad.top - pad.bottom

    // Grid lines
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke()
      ctx.fillStyle = '#9ca3af'; ctx.font = '10px DM Sans'; ctx.textAlign = 'right'
      ctx.fillText(fmtCurrency(allMax - (allMax / 4) * i), pad.left - 6, y + 3)
    }

    // X labels
    ctx.fillStyle = '#9ca3af'; ctx.font = '10px DM Sans'; ctx.textAlign = 'center'
    data.forEach((d, i) => {
      const x = pad.left + (plotW / (data.length - 1)) * i
      ctx.fillText(d[labelKey] || '', x, h - 8)
    })

    // Draw lines
    lines.forEach(line => {
      ctx.strokeStyle = line.color
      ctx.lineWidth = 2.5
      if (line.dashed) ctx.setLineDash([6, 4]); else ctx.setLineDash([])
      ctx.beginPath()
      data.forEach((d, i) => {
        const x = pad.left + (plotW / (data.length - 1)) * i
        const y = pad.top + plotH - ((d[line.key] || 0) / allMax) * plotH
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.setLineDash([])
    })
  }, [data, lines, labelKey, height])

  if (!data || data.length < 2) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Not enough data for chart</div>

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height }}></canvas>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
        {lines.map(l => (
          <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.75rem', color: 'var(--muted)' }}>
            <div style={{ width: 16, height: 3, background: l.color, borderRadius: 2 }}></div>
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}

const S = {
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 },
  statCard: { background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden' },
  statBar: (color) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }),
  statLabel: { fontSize: '.73rem', color: 'var(--muted)', marginBottom: 6 },
  statVal: { fontFamily: "'DM Serif Display',serif", fontSize: '1.5rem', color: 'var(--text)' },
  card: { background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  cardHeader: { padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '.73rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', borderBottom: '1px solid var(--border)', background: 'var(--bg)' },
  td: { padding: '14px 16px', borderBottom: '1px solid var(--border)' },
  input: { padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: '.84rem', background: 'var(--surface)', color: 'var(--text)', outline: 'none' },
  select: { padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: '.84rem', background: 'var(--surface)', color: 'var(--text)', outline: 'none', cursor: 'pointer' },
  btn: (bg, color) => ({ padding: '7px 14px', background: bg, color, border: 'none', borderRadius: 7, fontFamily: "'DM Sans',sans-serif", fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all .18s' }),
  badge: (color, bg) => ({ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, background: bg, color }),
}

// ─── FR-6.1: Company-Wise Sales Report ──────────────────────────────────────
export function SalesReportPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [company, setCompany] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReport() }, [dateFrom, dateTo, company])

  async function fetchReport() {
    setLoading(true)
    try {
      const params = {}
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      if (company) params.company = company
      const res = await axios.get('/api/reports/sales', { params })
      setData(res.data)
    } catch {
      // Fallback: build from orders
      try {
        const [ordRes, bizRes] = await Promise.all([
          axios.get('/api/orders'),
          axios.get('/api/businesses'),
        ])
        const orders = ordRes.data || []
        const businesses = bizRes.data || []
        const bizMap = {}
        businesses.forEach(b => { bizMap[b.id] = b })

        const byBiz = {}
        orders.forEach(o => {
          const bizId = o.businessId || o.business?.id
          const biz = bizMap[bizId] || o.business || {}
          const name = biz.name || `Business #${bizId}`
          if (company && !name.toLowerCase().includes(company.toLowerCase())) return
          if (dateFrom && o.orderDate < dateFrom) return
          if (dateTo && o.orderDate > dateTo + 'T23:59:59') return

          if (!byBiz[name]) byBiz[name] = { companyName: name, totalOrders: 0, totalRevenue: 0, pendingOrders: 0, approvedOrders: 0, rejectedOrders: 0 }
          byBiz[name].totalOrders++
          byBiz[name].totalRevenue += o.finalAmount || o.totalAmount || 0
          if (o.status === 'PENDING_APPROVAL') byBiz[name].pendingOrders++
          if (o.status === 'APPROVED' || o.status === 'PROCESSING' || o.status === 'COMPLETED') byBiz[name].approvedOrders++
          if (o.status === 'REJECTED') byBiz[name].rejectedOrders++
        })

        const rows = Object.values(byBiz).sort((a, b) => b.totalRevenue - a.totalRevenue)
        const chartData = rows.slice(0, 8).map(r => ({ company: r.companyName, revenue: r.totalRevenue }))
        setData({ rows, chartData, totalRevenue: rows.reduce((s, r) => s + r.totalRevenue, 0) })
      } catch { setData({ rows: [], chartData: [] }) }
    } finally { setLoading(false) }
  }

  return (
    <DashboardLayout activePage="sales-report" welcomeText="Analyse <strong>sales performance</strong> per business client.">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.6rem', fontWeight: 400, color: 'var(--text)', marginBottom: 3 }}>Company-Wise Sales Report</h1>
          <p style={{ fontSize: '.84rem', color: 'var(--muted)' }}>Analyse sales performance per business client</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={S.btn('var(--bg)', 'var(--text)')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            CSV
          </button>
          <button style={S.btn('var(--bg)', 'var(--text)')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...S.card, marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input style={{ ...S.input, width: 150 }} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>to</span>
          <input style={{ ...S.input, width: 150 }} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <input style={{ ...S.input, width: 200 }} placeholder="Filter by company..." value={company} onChange={e => setCompany(e.target.value)} />
        </div>
      </div>

      {/* Chart */}
      {!loading && data?.chartData?.length > 0 && (
        <div style={S.card}>
          <div style={S.cardHeader}><span style={{ fontWeight: 600 }}>Revenue by Company</span></div>
          <div style={{ padding: '16px 20px' }}>
            <SimpleBarChart data={data.chartData} dataKey="revenue" labelKey="company" color="multi" />
          </div>
        </div>
      )}

      {/* Table */}
      <div style={S.card}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Loading report...</div>
        ) : !data?.rows?.length ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
            No sales data found for the selected period.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
            <thead>
              <tr>
                <th style={S.th}>Company</th>
                <th style={S.th}>Total Orders</th>
                <th style={S.th}>Total Revenue</th>
                <th style={S.th}>Pending</th>
                <th style={S.th}>Approved</th>
                <th style={S.th}>Rejected</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={i} style={{ transition: 'background .15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...S.td, fontWeight: 700 }}>{row.companyName}</td>
                  <td style={S.td}>{fmt(row.totalOrders)}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: 'var(--green)' }}>{fmtCurrency(row.totalRevenue)}</td>
                  <td style={S.td}>{row.pendingOrders}</td>
                  <td style={{ ...S.td, color: '#16a34a' }}>{row.approvedOrders}</td>
                  <td style={{ ...S.td, color: '#be123c' }}>{row.rejectedOrders}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--bg)' }}>
                <td style={{ ...S.td, fontWeight: 700 }}>Total</td>
                <td style={{ ...S.td, fontWeight: 700 }}>{fmt(data.rows.reduce((s, r) => s + r.totalOrders, 0))}</td>
                <td style={{ ...S.td, fontWeight: 700, color: 'var(--green)' }}>{fmtCurrency(data.rows.reduce((s, r) => s + r.totalRevenue, 0))}</td>
                <td style={{ ...S.td, fontWeight: 600 }}>{data.rows.reduce((s, r) => s + r.pendingOrders, 0)}</td>
                <td style={{ ...S.td, fontWeight: 600 }}>{data.rows.reduce((s, r) => s + r.approvedOrders, 0)}</td>
                <td style={{ ...S.td, fontWeight: 600 }}>{data.rows.reduce((s, r) => s + r.rejectedOrders, 0)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}

// ─── FR-6.2: Monthly Revenue Growth ─────────────────────────────────────────
export function RevenueReportPage() {
  const [months, setMonths] = useState('12')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReport() }, [months])

  async function fetchReport() {
    setLoading(true)
    try {
      const res = await axios.get('/api/reports/revenue', { params: { months } })
      setData(res.data)
    } catch {
      // Fallback: build from orders
      try {
        const res = await axios.get('/api/orders')
        const orders = res.data || []
        const byMonth = {}

        orders.forEach(o => {
          if (!o.orderDate) return
          const d = new Date(o.orderDate)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          if (!byMonth[key]) byMonth[key] = { month: label, sortKey: key, totalRevenue: 0, paidRevenue: 0, overdueRevenue: 0 }
          const amt = o.finalAmount || o.totalAmount || 0
          byMonth[key].totalRevenue += amt
          if (o.status === 'COMPLETED' || o.status === 'PROCESSING') byMonth[key].paidRevenue += amt
          if (o.status === 'PENDING_APPROVAL') byMonth[key].overdueRevenue += amt
        })

        let rows = Object.values(byMonth).sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(-parseInt(months))

        // Calculate growth
        rows.forEach((r, i) => {
          if (i === 0) { r.growthPercent = 0; return }
          const prev = rows[i - 1].totalRevenue
          r.growthPercent = prev > 0 ? ((r.totalRevenue - prev) / prev) * 100 : 0
        })

        setData({
          rows,
          totalRevenue: rows.reduce((s, r) => s + r.totalRevenue, 0),
          paidRevenue: rows.reduce((s, r) => s + r.paidRevenue, 0),
          overdueRevenue: rows.reduce((s, r) => s + r.overdueRevenue, 0),
        })
      } catch { setData({ rows: [] }) }
    } finally { setLoading(false) }
  }

  const latestGrowth = data?.rows?.[data.rows.length - 1]?.growthPercent ?? 0

  return (
    <DashboardLayout activePage="revenue-report" welcomeText="Track <strong>financial trends</strong> month-over-month.">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.6rem', fontWeight: 400, color: 'var(--text)', marginBottom: 3 }}>Monthly Revenue Growth</h1>
          <p style={{ fontSize: '.84rem', color: 'var(--muted)' }}>Track financial trends month-over-month</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select style={S.select} value={months} onChange={e => setMonths(e.target.value)}>
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
            <option value="12">Last 12 months</option>
          </select>
          <button style={S.btn('var(--bg)', 'var(--text)')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={S.statsRow}>
        <div style={S.statCard}>
          <div style={S.statBar('linear-gradient(90deg, var(--accent), var(--teal))')}></div>
          <div style={S.statLabel}>Total Revenue ({months}m)</div>
          <div style={S.statVal}>{fmtCurrency(data?.totalRevenue)}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statBar('#16a34a')}></div>
          <div style={S.statLabel}>Total Paid</div>
          <div style={{ ...S.statVal, color: '#16a34a' }}>{fmtCurrency(data?.paidRevenue)}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statBar('#be123c')}></div>
          <div style={S.statLabel}>Total Overdue</div>
          <div style={{ ...S.statVal, color: '#be123c' }}>{fmtCurrency(data?.overdueRevenue)}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statBar(latestGrowth >= 0 ? '#16a34a' : '#be123c')}></div>
          <div style={S.statLabel}>Latest Month Growth</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={latestGrowth >= 0 ? '#16a34a' : '#be123c'} strokeWidth="2.5">
              {latestGrowth >= 0
                ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>
                : <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>}
            </svg>
            <div style={{ ...S.statVal, color: latestGrowth >= 0 ? '#16a34a' : '#be123c', marginTop: 0 }}>
              {latestGrowth >= 0 ? '+' : ''}{latestGrowth?.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {!loading && data?.rows?.length >= 2 && (
        <div style={S.card}>
          <div style={S.cardHeader}><span style={{ fontWeight: 600 }}>Revenue Trend</span></div>
          <div style={{ padding: '16px 20px' }}>
            <SimpleLineChart
              data={data.rows}
              labelKey="month"
              lines={[
                { key: 'paidRevenue', label: 'Paid', color: '#16a34a' },
                { key: 'overdueRevenue', label: 'Overdue', color: '#be123c', dashed: true },
              ]}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div style={S.card}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Loading report...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
            <thead>
              <tr>
                <th style={S.th}>Month</th>
                <th style={S.th}>Total</th>
                <th style={S.th}>Paid</th>
                <th style={S.th}>Overdue</th>
                <th style={S.th}>MoM Growth</th>
              </tr>
            </thead>
            <tbody>
              {(data?.rows || []).map((row, i) => (
                <tr key={i} style={{ transition: 'background .15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...S.td, fontWeight: 700 }}>{row.month}</td>
                  <td style={S.td}>{fmtCurrency(row.totalRevenue)}</td>
                  <td style={{ ...S.td, color: '#16a34a' }}>{fmtCurrency(row.paidRevenue)}</td>
                  <td style={{ ...S.td, color: '#be123c' }}>{fmtCurrency(row.overdueRevenue)}</td>
                  <td style={S.td}>
                    <span style={{ color: row.growthPercent >= 0 ? '#16a34a' : '#be123c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {row.growthPercent >= 0
                          ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>
                          : <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>}
                      </svg>
                      {row.growthPercent >= 0 ? '+' : ''}{row.growthPercent?.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}

// ─── FR-6.3: Unpaid Invoice Report ──────────────────────────────────────────
export function UnpaidReportPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReport() }, [dateFrom, dateTo, overdueOnly])

  async function fetchReport() {
    setLoading(true)
    try {
      const res = await axios.get('/api/reports/unpaid', { params: { dateFrom, dateTo, overdueOnly } })
      setData(res.data)
    } catch {
      // Fallback: build from invoices
      try {
        const res = await axios.get('/api/invoices')
        const invoices = (res.data || []).filter(inv => inv.status !== 'PAID')
        const today = new Date()

        let rows = invoices.map(inv => ({
          invoiceNumber: inv.invoiceNumber,
          buyerCompany: inv.business?.name || inv.buyerBusiness?.name || 'Unknown',
          issuedAt: inv.createdAt,
          dueDate: inv.dueDate,
          totalAmount: inv.balanceDue || inv.totalAmount,
          isOverdue: inv.dueDate ? new Date(inv.dueDate) < today : false,
        }))

        if (overdueOnly) rows = rows.filter(r => r.isOverdue)
        if (dateFrom) rows = rows.filter(r => r.issuedAt >= dateFrom)
        if (dateTo) rows = rows.filter(r => r.issuedAt <= dateTo + 'T23:59:59')

        setData({
          rows,
          totalOutstanding: rows.reduce((s, r) => s + (r.totalAmount || 0), 0),
          count: rows.length,
        })
      } catch { setData({ rows: [], totalOutstanding: 0, count: 0 }) }
    } finally { setLoading(false) }
  }

  return (
    <DashboardLayout activePage="unpaid-report" welcomeText="Track <strong>outstanding payments</strong> and manage cash flow.">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.6rem', fontWeight: 400, color: 'var(--text)', marginBottom: 3 }}>Unpaid Invoice Report</h1>
          <p style={{ fontSize: '.84rem', color: 'var(--muted)' }}>Track outstanding payments and manage cash flow</p>
        </div>
        <button style={S.btn('var(--bg)', 'var(--text)')}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      {/* Outstanding Banner */}
      {data?.totalOutstanding > 0 && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fbbf24', borderRadius: 12, padding: '18px 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', fontSize: '1rem' }}>Total Outstanding</div>
            <div style={{ color: '#a16207', fontSize: '.85rem', marginTop: 2 }}>{data.count} unpaid invoice{data.count !== 1 ? 's' : ''}</div>
          </div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.8rem', fontWeight: 700, color: '#d97706' }}>
            {fmtCurrency(data.totalOutstanding)}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ ...S.card, marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <input style={{ ...S.input, width: 150 }} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>to</span>
          <input style={{ ...S.input, width: 150 }} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.86rem', cursor: 'pointer', color: 'var(--text)' }}>
            <input type="checkbox" checked={overdueOnly} onChange={e => setOverdueOnly(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
            Overdue only
          </label>
        </div>
      </div>

      {/* Table */}
      <div style={S.card}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Loading...</div>
        ) : !data?.rows?.length ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
            No unpaid invoices found. All payments are up to date!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
            <thead>
              <tr>
                <th style={S.th}>Invoice #</th>
                <th style={S.th}>Company</th>
                <th style={S.th}>Issued</th>
                <th style={S.th}>Due Date</th>
                <th style={S.th}>Outstanding</th>
                <th style={S.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={i} style={{ transition: 'background .15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '.82rem' }}>{row.invoiceNumber}</td>
                  <td style={S.td}>{row.buyerCompany}</td>
                  <td style={{ ...S.td, fontSize: '.82rem', color: 'var(--muted)' }}>{fmtDate(row.issuedAt)}</td>
                  <td style={{ ...S.td, color: row.isOverdue ? '#be123c' : 'var(--text)', fontWeight: row.isOverdue ? 600 : 400 }}>{fmtDate(row.dueDate)}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: '#d97706' }}>{fmtCurrency(row.totalAmount)}</td>
                  <td style={S.td}>
                    <span style={S.badge(row.isOverdue ? '#be123c' : '#d97706', row.isOverdue ? '#fef2f2' : '#fef3cd')}>
                      {row.isOverdue ? 'Overdue' : 'Unpaid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}

// ─── FR-6.4: Top Business Clients ───────────────────────────────────────────
export function TopClientsPage() {
  const [period, setPeriod] = useState('monthly')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReport() }, [period])

  async function fetchReport() {
    setLoading(true)
    try {
      const res = await axios.get('/api/reports/top-clients', { params: { period } })
      setData(res.data)
    } catch {
      // Fallback: build from orders
      try {
        const [ordRes, bizRes] = await Promise.all([
          axios.get('/api/orders'),
          axios.get('/api/businesses'),
        ])
        const orders = ordRes.data || []
        const businesses = bizRes.data || []
        const bizMap = {}
        businesses.forEach(b => { bizMap[b.id] = b })

        // Group by buyer business
        const byBuyer = {}
        orders.forEach(o => {
          const buyerId = o.buyerBusinessId || o.customerId
          if (!buyerId) return
          const biz = bizMap[buyerId] || {}
          const name = biz.name || `Client #${buyerId}`
          if (!byBuyer[buyerId]) byBuyer[buyerId] = { id: buyerId, companyName: name, totalOrders: 0, totalRevenue: 0 }
          byBuyer[buyerId].totalOrders++
          byBuyer[buyerId].totalRevenue += o.finalAmount || o.totalAmount || 0
        })

        let rows = Object.values(byBuyer).sort((a, b) => b.totalRevenue - a.totalRevenue)
        rows = rows.map((r, i) => ({ ...r, rank: i + 1, avgOrderValue: r.totalOrders > 0 ? r.totalRevenue / r.totalOrders : 0 }))

        setData({ rows })
      } catch { setData({ rows: [] }) }
    } finally { setLoading(false) }
  }

  const medals = ['', '🥇', '🥈', '🥉']

  return (
    <DashboardLayout activePage="top-clients" welcomeText="Ranked by <strong>order value and volume</strong>.">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.6rem', fontWeight: 400, color: 'var(--text)', marginBottom: 3 }}>Top-Performing Clients</h1>
          <p style={{ fontSize: '.84rem', color: 'var(--muted)' }}>Ranked by order value and volume</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select style={S.select} value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button style={S.btn('var(--bg)', 'var(--text)')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {!loading && data?.rows?.length >= 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(data.rows.length, 3)}, 1fr)`, gap: 16, marginBottom: 24 }}>
          {data.rows.slice(0, 3).map((client, i) => (
            <div key={client.id} style={{
              background: 'var(--surface)', border: `${i === 0 ? 2 : 1.5}px solid ${i === 0 ? '#fbbf24' : i === 1 ? '#d1d5db' : '#f0cdb0'}`,
              borderRadius: 14, padding: '24px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : '#d97706' }}></div>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{medals[i + 1]}</div>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '.95rem', marginBottom: 6 }}>#{i + 1} {client.companyName}</div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.3rem', fontWeight: 600, color: 'var(--green)' }}>{fmtCurrency(client.totalRevenue)}</div>
              <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: 6 }}>{client.totalOrders} orders</div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={S.card}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Loading...</div>
        ) : !data?.rows?.length ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
            No client data found for the selected period.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
            <thead>
              <tr>
                <th style={S.th}>#</th>
                <th style={S.th}>Company</th>
                <th style={S.th}>Total Orders</th>
                <th style={S.th}>Total Revenue</th>
                <th style={S.th}>Avg Order Value</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((client, i) => (
                <tr key={client.id} style={{ transition: 'background .15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={S.td}>
                    {i < 3 ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 12 7s5-3 7.5-3a2.5 2.5 0 0 1 0 5H18l-6 11L6 9z"/></svg>
                    ) : <span style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{i + 1}</span>}
                  </td>
                  <td style={{ ...S.td, fontWeight: 700 }}>{client.companyName}</td>
                  <td style={S.td}>{fmt(client.totalOrders)}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: 'var(--green)' }}>{fmtCurrency(client.totalRevenue)}</td>
                  <td style={S.td}>{fmtCurrency(client.avgOrderValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}
