import { useState, useEffect } from 'react'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'

function fmt(n) { return n != null ? Number(n).toLocaleString() : '0' }
function fmtDate(d) { return d ? new Date(d).toLocaleString() : '—' }

// ─── Inventory Management Page ──────────────────────────────────────────────
export function InventoryPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [updateModal, setUpdateModal] = useState(null)
  const [updateQty, setUpdateQty] = useState('')
  const [updateNote, setUpdateNote] = useState('')
  const [updateType, setUpdateType] = useState('ADD')
  const [thresholdModal, setThresholdModal] = useState(null)
  const [thresholdVal, setThresholdVal] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchInventory() }, [])

  async function fetchInventory() {
    setLoading(true)
    try {
      const res = await axios.get('/api/inventory')
      setInventory(res.data || [])
    } catch {
      // If no backend inventory endpoint, build from products
      try {
        const res = await axios.get('/api/products')
        const items = (res.data || []).filter(p => !p.isDeleted && p.isActive).map(p => ({
          id: p.id,
          productName: p.name,
          categoryName: p.category || 'General',
          stock: p.stock || 0,
          lowStockThreshold: p.moq || 10,
          isLowStock: (p.stock || 0) <= (p.moq || 10),
          lastUpdatedAt: p.updatedAt || p.createdAt,
          lastUpdatedBy: p.business?.name || 'System',
          sku: p.sku,
          unit: p.unit || 'piece',
          basePrice: p.basePrice,
          businessName: p.business?.name || 'Unknown',
        }))
        setInventory(items)
      } catch { setInventory([]) }
    } finally { setLoading(false) }
  }

  const lowCount = inventory.filter(i => i.isLowStock && i.stock > 0).length
  const outCount = inventory.filter(i => i.stock === 0).length
  const totalUnits = inventory.reduce((s, i) => s + (i.stock || 0), 0)

  const filtered = inventory.filter(item => {
    const matchSearch = !search || (item.productName || '').toLowerCase().includes(search.toLowerCase()) || (item.sku || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'low' ? item.isLowStock && item.stock > 0 : filter === 'out' ? item.stock === 0 : true
    return matchSearch && matchFilter
  })

  async function handleUpdateStock() {
    if (!updateQty || !updateNote.trim()) return
    setSaving(true)
    try {
      const qty = parseInt(updateQty)
      const finalQty = updateType === 'ADD' ? qty : -qty
      await axios.put(`/api/inventory/${updateModal.id}/stock`, { quantity: finalQty, note: updateNote })
      setMsg('Stock updated successfully!')
      setUpdateModal(null)
      fetchInventory()
    } catch {
      // Fallback: update locally
      setInventory(prev => prev.map(item =>
        item.id === updateModal.id ? {
          ...item,
          stock: Math.max(0, item.stock + (updateType === 'ADD' ? parseInt(updateQty) : -parseInt(updateQty))),
          lastUpdatedAt: new Date().toISOString(),
          lastUpdatedBy: user.businessName || 'You',
          isLowStock: Math.max(0, item.stock + (updateType === 'ADD' ? parseInt(updateQty) : -parseInt(updateQty))) <= item.lowStockThreshold,
        } : item
      ))
      setMsg('Stock updated (local only)')
      setUpdateModal(null)
    } finally { setSaving(false); setTimeout(() => setMsg(''), 3000) }
  }

  async function handleSetThreshold() {
    if (!thresholdVal) return
    setSaving(true)
    try {
      await axios.put(`/api/inventory/${thresholdModal.id}/threshold`, { threshold: parseInt(thresholdVal) })
      setMsg('Threshold updated!')
      setThresholdModal(null)
      fetchInventory()
    } catch {
      setInventory(prev => prev.map(item =>
        item.id === thresholdModal.id ? {
          ...item,
          lowStockThreshold: parseInt(thresholdVal),
          isLowStock: item.stock <= parseInt(thresholdVal),
        } : item
      ))
      setMsg('Threshold updated (local only)')
      setThresholdModal(null)
    } finally { setSaving(false); setTimeout(() => setMsg(''), 3000) }
  }

  const S = {
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24, animation: 'fadeUp .35s ease both' },
    statCard: { background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden' },
    statBar: (color) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }),
    statLabel: { fontSize: '.73rem', color: 'var(--muted)', marginBottom: 6 },
    statVal: { fontFamily: "'DM Serif Display',serif", fontSize: '1.5rem', color: 'var(--text)' },
    card: { background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 14, overflow: 'hidden', animation: 'fadeUp .35s ease both .1s' },
    cardHeader: { padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    searchInput: { padding: '9px 14px 9px 36px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: '.84rem', background: 'var(--surface)', color: 'var(--text)', outline: 'none', width: 260 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '.73rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', borderBottom: '1px solid var(--border)', background: 'var(--bg)' },
    td: { padding: '14px 16px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' },
    alertBar: { background: '#fef3cd', border: '1.5px solid #fbbf24', borderRadius: 10, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: '.86rem', color: '#92400e' },
    btn: (bg, color) => ({ padding: '6px 12px', background: bg, color: color, border: 'none', borderRadius: 6, fontFamily: "'DM Sans',sans-serif", fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all .18s' }),
    filterBtn: (active) => ({ padding: '6px 14px', background: active ? 'var(--green)' : 'var(--bg)', color: active ? '#fff' : 'var(--muted)', border: active ? 'none' : '1.5px solid var(--border)', borderRadius: 6, fontFamily: "'DM Sans',sans-serif", fontSize: '.78rem', fontWeight: 500, cursor: 'pointer' }),
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .2s ease' },
    modalBox: { background: 'var(--surface)', borderRadius: 16, padding: 28, width: 440, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,.15)', animation: 'fadeUp .25s ease' },
    modalTitle: { fontFamily: "'DM Serif Display',serif", fontSize: '1.1rem', color: 'var(--text)', marginBottom: 18 },
    formGroup: { marginBottom: 16 },
    label: { display: 'block', fontSize: '.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 6 },
    input: { width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: '.88rem', outline: 'none', background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: '.88rem', outline: 'none', background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box', resize: 'none', minHeight: 80 },
    badge: (color, bg) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, background: bg, color: color }),
    successMsg: { position: 'fixed', top: 20, right: 20, background: '#16a34a', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: '.86rem', fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(22,163,74,.3)', animation: 'fadeUp .3s ease' },
  }

  return (
    <DashboardLayout activePage="inventory" welcomeText="Monitor and update <strong>stock levels</strong> in real-time across all products.">
      {msg && <div style={S.successMsg}>{msg}</div>}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.6rem', fontWeight: 400, color: 'var(--text)', marginBottom: 3 }}>Inventory Management</h1>
          <p style={{ fontSize: '.84rem', color: 'var(--muted)' }}>Monitor stock levels, set alerts, and manage inventory</p>
        </div>
        <button style={S.btn('var(--green)', '#fff')} onClick={fetchInventory}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      {/* Alert Banner */}
      {(lowCount > 0 || outCount > 0) && (
        <div style={S.alertBar}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span><strong>{lowCount} product{lowCount !== 1 ? 's' : ''}</strong> at low stock level.{outCount > 0 && <> <strong>{outCount}</strong> completely out of stock.</>}</span>
        </div>
      )}

      {/* Stats */}
      <div style={S.statsRow}>
        <div style={S.statCard}>
          <div style={S.statBar('linear-gradient(90deg, var(--accent), var(--teal))')}></div>
          <div style={S.statLabel}>Total Products</div>
          <div style={S.statVal}>{fmt(inventory.length)}</div>
        </div>
        <div style={{ ...S.statCard, cursor: 'pointer', borderColor: filter === 'low' ? '#d97706' : 'var(--border)' }} onClick={() => setFilter(f => f === 'low' ? '' : 'low')}>
          <div style={S.statBar('#d97706')}></div>
          <div style={S.statLabel}>Low Stock</div>
          <div style={{ ...S.statVal, color: '#d97706' }}>{lowCount}</div>
        </div>
        <div style={{ ...S.statCard, cursor: 'pointer', borderColor: filter === 'out' ? '#be123c' : 'var(--border)' }} onClick={() => setFilter(f => f === 'out' ? '' : 'out')}>
          <div style={S.statBar('#be123c')}></div>
          <div style={S.statLabel}>Out of Stock</div>
          <div style={{ ...S.statVal, color: '#be123c' }}>{outCount}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statBar('linear-gradient(90deg, #16a34a, #0d9488)')}></div>
          <div style={S.statLabel}>Total Units</div>
          <div style={S.statVal}>{fmt(totalUnits)}</div>
        </div>
      </div>

      {/* Table Card */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input style={S.searchInput} placeholder="Search products, SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={S.filterBtn(filter === '')} onClick={() => setFilter('')}>All</button>
            <button style={S.filterBtn(filter === 'low')} onClick={() => setFilter('low')}>Low Stock</button>
            <button style={S.filterBtn(filter === 'out')} onClick={() => setFilter('out')}>Out of Stock</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .6s linear infinite', margin: '0 auto 14px' }}></div>
            Loading inventory...
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📦</div>
            <div style={{ fontSize: '.9rem' }}>No inventory items found</div>
          </div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Product</th>
                <th style={S.th}>SKU</th>
                <th style={S.th}>Current Stock</th>
                <th style={S.th}>Alert Threshold</th>
                <th style={S.th}>Last Updated</th>
                <th style={S.th}>Updated By</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} style={{ transition: 'background .15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={S.td}>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{item.productName}</div>
                    <div style={{ fontSize: '.76rem', color: 'var(--muted)' }}>{item.categoryName}</div>
                  </td>
                  <td style={{ ...S.td, fontSize: '.8rem', color: 'var(--muted)', fontFamily: 'monospace' }}>{item.sku || '—'}</td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: item.stock === 0 ? '#be123c' : item.isLowStock ? '#d97706' : 'var(--text)' }}>
                        {fmt(item.stock)}
                      </span>
                      {item.stock === 0 && <span style={S.badge('#be123c', '#fef2f2')}>Out of Stock</span>}
                      {item.isLowStock && item.stock > 0 && (
                        <span style={S.badge('#d97706', '#fef3cd')}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          Low
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ ...S.td, color: 'var(--muted)' }}>&le; {fmt(item.lowStockThreshold)} units</td>
                  <td style={{ ...S.td, fontSize: '.8rem', color: 'var(--muted)' }}>{fmtDate(item.lastUpdatedAt)}</td>
                  <td style={{ ...S.td, fontSize: '.82rem' }}>{item.lastUpdatedBy || '—'}</td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={S.btn('var(--bg)', 'var(--text)')} onClick={() => { setUpdateModal(item); setUpdateQty(''); setUpdateNote(''); setUpdateType('ADD') }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Update
                      </button>
                      <button style={S.btn('var(--bg)', 'var(--text)')} onClick={() => { setThresholdModal(item); setThresholdVal(String(item.lowStockThreshold)) }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        Alert
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Update Stock Modal */}
      {updateModal && (
        <div style={S.modal} onClick={() => setUpdateModal(null)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <div style={S.modalTitle}>Update Stock — {updateModal.productName}</div>

            <div style={{ background: 'var(--bg)', padding: '12px 16px', borderRadius: 10, marginBottom: 18, display: 'flex', justifyContent: 'space-between', fontSize: '.88rem' }}>
              <span style={{ color: 'var(--muted)' }}>Current stock</span>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>{fmt(updateModal.stock)} units</span>
            </div>

            <div style={S.formGroup}>
              <label style={S.label}>Operation</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ ...S.btn(updateType === 'ADD' ? '#16a34a' : 'var(--bg)', updateType === 'ADD' ? '#fff' : 'var(--text)'), flex: 1, justifyContent: 'center', padding: '10px' }}
                  onClick={() => setUpdateType('ADD')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  Add Stock
                </button>
                <button style={{ ...S.btn(updateType === 'DEDUCT' ? '#be123c' : 'var(--bg)', updateType === 'DEDUCT' ? '#fff' : 'var(--text)'), flex: 1, justifyContent: 'center', padding: '10px' }}
                  onClick={() => setUpdateType('DEDUCT')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
                  Deduct Stock
                </button>
              </div>
            </div>

            <div style={S.formGroup}>
              <label style={S.label}>Quantity *</label>
              <input style={S.input} type="number" min={1} value={updateQty} onChange={e => setUpdateQty(e.target.value)} placeholder="Enter quantity" />
            </div>

            <div style={S.formGroup}>
              <label style={S.label}>Reason / Note *</label>
              <textarea style={S.textarea} placeholder="e.g. Received shipment from supplier, Stock count adjustment..." value={updateNote} onChange={e => setUpdateNote(e.target.value)} />
              {!updateNote.trim() && updateNote !== '' && <p style={{ fontSize: '.76rem', color: '#be123c', marginTop: 4 }}>A reason is required for all stock changes</p>}
            </div>

            {updateQty && updateNote.trim() && (
              <div style={{ background: 'var(--light)', padding: '12px 16px', borderRadius: 10, marginBottom: 16, display: 'flex', justifyContent: 'space-between', fontSize: '.86rem' }}>
                <span style={{ color: 'var(--muted)' }}>New stock will be</span>
                <span style={{ fontWeight: 700, color: 'var(--green)' }}>
                  {fmt(Math.max(0, updateModal.stock + (updateType === 'ADD' ? parseInt(updateQty || 0) : -parseInt(updateQty || 0))))} units
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button style={{ ...S.btn('var(--bg)', 'var(--text)'), flex: 1, justifyContent: 'center', padding: '10px', border: '1.5px solid var(--border)' }} onClick={() => setUpdateModal(null)}>Cancel</button>
              <button
                style={{ ...S.btn(updateType === 'ADD' ? '#16a34a' : '#be123c', '#fff'), flex: 1, justifyContent: 'center', padding: '10px', opacity: (!updateQty || !updateNote.trim() || saving) ? 0.5 : 1 }}
                disabled={!updateQty || !updateNote.trim() || saving}
                onClick={handleUpdateStock}
              >
                {saving ? 'Saving...' : updateType === 'ADD' ? 'Add Stock' : 'Deduct Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Threshold Modal */}
      {thresholdModal && (
        <div style={S.modal} onClick={() => setThresholdModal(null)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <div style={S.modalTitle}>Set Low Stock Alert Threshold</div>
            <p style={{ color: 'var(--muted)', marginBottom: 18, fontSize: '.88rem' }}>
              An alert will trigger when <strong style={{ color: 'var(--text)' }}>{thresholdModal.productName}</strong> stock falls to or below this level.
            </p>
            <div style={S.formGroup}>
              <label style={S.label}>Threshold (units) *</label>
              <input style={S.input} type="number" min={1} value={thresholdVal} onChange={e => setThresholdVal(e.target.value)} placeholder="e.g. 50" />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button style={{ ...S.btn('var(--bg)', 'var(--text)'), flex: 1, justifyContent: 'center', padding: '10px', border: '1.5px solid var(--border)' }} onClick={() => setThresholdModal(null)}>Cancel</button>
              <button
                style={{ ...S.btn('var(--green)', '#fff'), flex: 1, justifyContent: 'center', padding: '10px', opacity: (!thresholdVal || saving) ? 0.5 : 1 }}
                disabled={!thresholdVal || saving}
                onClick={handleSetThreshold}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                {saving ? 'Saving...' : 'Set Threshold'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

// ─── Stock Alerts History Page ───────────────────────────────────────────────
export function StockAlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [liveAlerts, setLiveAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const [histRes, liveRes] = await Promise.all([
          axios.get('/api/inventory/alert-history').catch(() => ({ data: [] })),
          axios.get('/api/inventory/low-stock').catch(() => ({ data: [] })),
        ])
        setAlerts(histRes.data || [])
        setLiveAlerts(liveRes.data || [])
      } catch {
        // Fallback: build from products
        try {
          const res = await axios.get('/api/products')
          const low = (res.data || []).filter(p => !p.isDeleted && p.isActive && (p.stock || 0) <= (p.moq || 10))
          setLiveAlerts(low.map(p => ({
            productId: p.id,
            productName: p.name,
            categoryName: p.category || 'General',
            stock: p.stock || 0,
            threshold: p.moq || 10,
          })))
        } catch { /* ignore */ }
      } finally { setLoading(false) }
    }
    fetch()
  }, [])

  const S = {
    card: { background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20, animation: 'fadeUp .35s ease both' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '.73rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', borderBottom: '1px solid var(--border)', background: 'var(--bg)' },
    td: { padding: '14px 16px', borderBottom: '1px solid var(--border)' },
    badge: (color, bg) => ({ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, background: bg, color }),
  }

  return (
    <DashboardLayout activePage="stock-alerts" welcomeText="Low stock alert history and <strong>active warnings</strong> for all products.">
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.6rem', fontWeight: 400, color: 'var(--text)', marginBottom: 3 }}>Stock Alerts</h1>
        <p style={{ fontSize: '.84rem', color: 'var(--muted)' }}>Low stock alert history and active warnings</p>
      </div>

      {/* Live Alerts */}
      {liveAlerts.length > 0 && (
        <div style={{ ...S.card, borderColor: '#d97706', borderWidth: 2 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #fbbf24', background: '#fffbeb', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{ fontWeight: 700, color: '#92400e' }}>{liveAlerts.length} Active Low Stock Alert{liveAlerts.length !== 1 ? 's' : ''}</span>
          </div>
          {liveAlerts.map(item => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '.88rem' }}>{item.productName}</div>
                <div style={{ fontSize: '.76rem', color: 'var(--muted)' }}>{item.categoryName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#d97706', fontSize: '.92rem' }}>{fmt(item.stock)} units</div>
                <div style={{ fontSize: '.73rem', color: 'var(--muted)' }}>threshold: {item.threshold}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert History */}
      <div style={S.card}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>Alert History</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--muted)' }}>Loading...</div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📋</div>
            <div>No alert history yet. Alerts are generated when stock falls below thresholds.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
            <thead>
              <tr>
                <th style={S.th}>Product</th>
                <th style={S.th}>Stock at Alert</th>
                <th style={S.th}>Threshold</th>
                <th style={S.th}>Triggered</th>
                <th style={S.th}>Resolved</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a, i) => (
                <tr key={i}>
                  <td style={S.td}><strong>{a.productName}</strong></td>
                  <td style={{ ...S.td, fontWeight: 600, color: '#d97706' }}>{fmt(a.stockAtAlert)}</td>
                  <td style={S.td}>{a.threshold}</td>
                  <td style={{ ...S.td, fontSize: '.8rem', color: 'var(--muted)' }}>{fmtDate(a.triggeredAt)}</td>
                  <td style={S.td}>{a.resolvedAt ? fmtDate(a.resolvedAt) : <span style={S.badge('#d97706', '#fef3cd')}>Active</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}
