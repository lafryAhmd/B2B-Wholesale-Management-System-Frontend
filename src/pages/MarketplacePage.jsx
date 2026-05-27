import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low', 'MOQ: Low to High', 'Best Sellers']

function getProductIcon(name, category) {
  const icons = {
    'Electronics': '📱', 'Apparel': '👔', 'Textiles': '🧵', 'Industrial': '🔧',
    'Home & Kitchen': '🍳', 'Health & Beauty': '💧', 'Food & Beverage': '☕',
    'FMCG': '🛒', 'Auto Parts': '🚗', 'Tools': '🛠️', 'Sports': '⚽',
    'Office': '📎', 'Toys': '🧸', 'Books': '📚', 'Furniture': '🪑',
  }
  if (icons[category]) return icons[category]
  const n = (name || '').toLowerCase()
  if (n.includes('phone') || n.includes('mobile')) return '📱'
  if (n.includes('shirt') || n.includes('polo') || n.includes('cloth')) return '👔'
  if (n.includes('usb') || n.includes('cable') || n.includes('charger')) return '🔌'
  if (n.includes('chip') || n.includes('snack') || n.includes('food')) return '🍿'
  if (n.includes('shoe') || n.includes('sneaker')) return '👟'
  if (n.includes('headphone') || n.includes('earb')) return '🎧'
  return '📦'
}

export default function MarketplacePage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const businessName = user.businessName || 'My Business'
  const initials = businessName ? businessName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'

  const [products, setProducts] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('All')
  const [sort, setSort] = useState('Newest')
  const [cart, setCart] = useState({})
  const [showCart, setShowCart] = useState(false)
  const [showCompanies, setShowCompanies] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [buyModal, setBuyModal] = useState(null)
  const [buyQty, setBuyQty] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [bulkPricing, setBulkPricing] = useState(null)
  const [priceCalc, setPriceCalc] = useState(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [rfqModal, setRfqModal] = useState(null)
  const [rfqMsg, setRfqMsg] = useState('')
  const [rfqQty, setRfqQty] = useState('')
  const [rfqSent, setRfqSent] = useState(false)
  const [rfqLoading, setRfqLoading] = useState(false)
  const [myRfqs, setMyRfqs] = useState([])
  const [showMyRfqs, setShowMyRfqs] = useState(false)
  const navigate = useNavigate()

  // Fetch buyer's RFQs
  async function fetchMyRfqs() {
    if (!user.id) return
    try {
      const res = await axios.get(`/api/rfqs/buyer/${user.id}`)
      setMyRfqs(res.data || [])
    } catch { setMyRfqs([]) }
  }

  async function acceptRfqQuote(rfqId) {
    try {
      await axios.put(`/api/rfqs/${rfqId}/accept`)
      alert('Quote accepted! Order has been created. Check Orders page.')
      fetchMyRfqs()
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message))
    }
  }

  async function rejectRfqQuote(rfqId) {
    if (!confirm('Are you sure you want to reject this quote?')) return
    try {
      await axios.put(`/api/rfqs/${rfqId}/reject`)
      fetchMyRfqs()
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message))
    }
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const [prodRes, bizRes, catRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/businesses'),
          axios.get('/api/categories'),
        ])
        setProducts(prodRes.data || [])
        setBusinesses(bizRes.data || [])
        setCategories(catRes.data || [])
      } catch (err) {
        console.error('Failed to load marketplace data:', err)
        setError('Failed to load marketplace data. Make sure the backend is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const categoryNames = ['All', ...categories.map(c => c.name)]
  const bizMap = {}
  businesses.forEach(b => { bizMap[b.id] = b })

  let filtered = products.filter(p => {
    if (p.isDeleted || !p.isActive) return false
    const matchCat = activeCat === 'All' || p.category === activeCat
    const bizName = p.business?.name || bizMap[p.businessId]?.name || ''
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) || bizName.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase())
    const matchCompany = !selectedCompany || (p.business?.id || p.businessId) === selectedCompany
    return matchCat && matchSearch && matchCompany
  })
  if (sort === 'Price: Low to High') filtered.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0))
  else if (sort === 'Price: High to Low') filtered.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0))
  else if (sort === 'MOQ: Low to High') filtered.sort((a, b) => (a.moq || 0) - (b.moq || 0))
  else filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  const cartItems = Object.entries(cart).filter(([, v]) => v.qty > 0)
  const cartTotal = cartItems.reduce((sum, [, v]) => sum + (v.price * v.qty), 0)
  const activeProducts = products.filter(p => !p.isDeleted && p.isActive)

  function addToCart(product, qty) {
    const biz = product.business || bizMap[product.businessId] || {}
    setCart(prev => ({
      ...prev,
      [product.id]: {
        qty: (prev[product.id]?.qty || 0) + qty,
        price: priceCalc ? priceCalc.finalUnitPrice : product.basePrice,
        name: product.name,
        company: biz.name || 'Unknown',
        unit: product.unit || 'piece',
        icon: getProductIcon(product.name, product.category),
        businessId: biz.id || product.businessId,
      }
    }))
    setBuyModal(null)
    setBuyQty('')
    setBulkPricing(null)
    setPriceCalc(null)
  }

  function removeFromCart(productId) {
    setCart(prev => { const n = { ...prev }; delete n[productId]; return n })
  }

  async function openBuyModal(product) {
    setBuyModal(product)
    setBuyQty(String(product.moq || 1))
    setBulkPricing(null)
    setPriceCalc(null)
    try {
      const res = await axios.get(`/api/products/${product.id}/pricing`)
      setBulkPricing(res.data || [])
    } catch { setBulkPricing([]) }
    try {
      const res = await axios.get(`/api/products/${product.id}/calculate-price?quantity=${product.moq || 1}`)
      setPriceCalc(res.data)
    } catch { /* ignore */ }
  }

  async function recalcPrice(productId, qty) {
    if (!qty || qty < 1) { setPriceCalc(null); return }
    try {
      const res = await axios.get(`/api/products/${productId}/calculate-price?quantity=${qty}`)
      setPriceCalc(res.data)
    } catch { setPriceCalc(null) }
  }

  async function placeOrder() {
    if (cartItems.length === 0) return
    if (!user.id) {
      alert('Please log in to place an order.')
      navigate('/login')
      return
    }
    setOrderLoading(true)
    const itemsByBiz = {}
    for (const [prodId] of cartItems) {
      const prod = products.find(p => p.id === Number(prodId))
      if (!prod) continue
      const bizId = prod.business?.id || prod.businessId
      if (!bizId) continue
      if (!itemsByBiz[bizId]) itemsByBiz[bizId] = []
      itemsByBiz[bizId].push({ productId: Number(prodId), quantity: cart[prodId].qty })
    }
    const bizEntries = Object.entries(itemsByBiz)
    if (bizEntries.length === 0) {
      alert('No valid products in cart.')
      setOrderLoading(false)
      return
    }
    const successOrders = []
    const failedOrders = []
    for (const [bizId, items] of bizEntries) {
      try {
        const res = await axios.post('/api/orders', {
          customerId: null,
          businessId: Number(bizId),
          buyerBusinessId: Number(user.id),
          notes: 'Order placed from Marketplace',
          items,
        })
        successOrders.push(res.data)
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.error || err.message
        const sellerName = bizMap[Number(bizId)]?.name || `Business #${bizId}`
        failedOrders.push(`${sellerName}: ${msg}`)
      }
    }
    setOrderLoading(false)
    if (failedOrders.length === 0) {
      setCart({})
      setShowCart(false)
      alert(`Order placed successfully! ${successOrders.length} order(s) created.`)
      navigate('/orders')
    } else if (successOrders.length > 0) {
      alert(`${successOrders.length} order(s) placed.\n\n${failedOrders.length} failed:\n${failedOrders.join('\n')}`)
    } else {
      alert(`Failed to place order:\n${failedOrders.join('\n')}`)
    }
  }

  function getStockStatus(stock) {
    if (stock > 100) return { label: 'In Stock', color: '#16a34a', bg: '#f0fdf4' }
    if (stock > 20) return { label: 'Limited', color: '#d97706', bg: '#fffbeb' }
    if (stock > 0) return { label: 'Low Stock', color: '#dc2626', bg: '#fef2f2' }
    return { label: 'Out of Stock', color: '#6b7280', bg: '#f3f4f6' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8faf8', color: '#1a2e1a', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        :root{--green:#14532d;--green2:#166534;--accent:#16a34a;--teal:#0d9488;--text:#1a2e1a;--muted:#64846a;--border:#e2ece2;--surface:#fff;--bg:#f8faf8;--light:#f0f7f0;}

        /* TOPBAR */
        .mp-topbar{background:linear-gradient(135deg,#14532d 0%,#166534 100%);height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 32px;flex-shrink:0;box-shadow:0 2px 16px rgba(20,83,45,.15);position:sticky;top:0;z-index:100;}
        .mp-brand{display:flex;align-items:center;gap:12px;}
        .mp-logo{width:34px;height:34px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:9px;display:flex;align-items:center;justify-content:center;}
        .mp-brand-name{font-family:'DM Serif Display',serif;font-size:1.1rem;color:#fff;letter-spacing:-.02em;}
        .mp-brand-name b{color:#86efac;font-weight:400;}
        .mp-topnav{display:flex;align-items:center;gap:2px;}
        .mp-topnav a,.mp-topnav span{padding:7px 14px;border-radius:7px;font-size:.83rem;font-weight:500;color:rgba(255,255,255,.55);text-decoration:none;transition:all .18s;display:flex;align-items:center;gap:6px;cursor:pointer;}
        .mp-topnav a:hover,.mp-topnav span:hover{background:rgba(255,255,255,.08);color:#fff;}
        .mp-topnav .act{background:rgba(255,255,255,.13);color:#fff;}
        .mp-topright{display:flex;align-items:center;gap:10px;}
        .mp-icon-btn{width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);cursor:pointer;color:rgba(255,255,255,.65);display:flex;align-items:center;justify-content:center;position:relative;transition:all .18s;}
        .mp-icon-btn:hover{background:rgba(255,255,255,.16);color:#fff;}
        .mp-badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:9px;background:#ef4444;color:#fff;font-size:.65rem;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;}
        .mp-user-chip{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);border-radius:9px;padding:5px 12px 5px 6px;cursor:pointer;transition:all .18s;}
        .mp-user-chip:hover{background:rgba(255,255,255,.18);}
        .mp-user-avatar{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#0d9488);display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;color:#fff;}
        .mp-user-name{font-size:.82rem;font-weight:500;color:rgba(255,255,255,.85);}

        /* LAYOUT */
        .mp-layout{display:flex;flex:1;overflow:hidden;}
        .mp-sidebar{width:240px;flex-shrink:0;background:#fff;border-right:1px solid #e2ece2;display:flex;flex-direction:column;overflow-y:auto;}
        .mp-sb-section{padding:18px 14px 10px;}
        .mp-sb-label{font-size:.65rem;font-weight:700;color:#98b098;text-transform:uppercase;letter-spacing:.13em;padding:0 10px;margin-bottom:8px;}
        .mp-nav{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;font-size:.84rem;font-weight:500;color:#64846a;text-decoration:none;transition:all .18s;margin-bottom:2px;cursor:pointer;}
        .mp-nav:hover{background:#f0f7f0;color:#1a2e1a;}
        .mp-nav.act{background:linear-gradient(135deg,#f0fdf4,#ecfdf5);color:#14532d;font-weight:600;}
        .mp-nav.act svg{color:#16a34a;}
        .mp-nav svg{flex-shrink:0;color:#98b098;}
        .mp-nav-count{margin-left:auto;font-size:.67rem;font-weight:700;background:#16a34a;color:#fff;border-radius:10px;padding:2px 7px;}
        .mp-nav-count.warn{background:#d97706;}
        .mp-sep{height:1px;background:#e2ece2;margin:10px 14px;}
        .mp-sb-footer{margin-top:auto;padding:16px 14px;border-top:1px solid #e2ece2;}
        .mp-sb-user{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;cursor:pointer;transition:background .18s;}
        .mp-sb-user:hover{background:#f0f7f0;}
        .mp-sb-avatar{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#16a34a,#0d9488);display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:#fff;flex-shrink:0;}
        .mp-sb-name{font-size:.84rem;font-weight:600;color:#1a2e1a;}
        .mp-sb-role{font-size:.72rem;color:#64846a;}
        .mp-sb-dot{width:8px;height:8px;border-radius:50%;background:#16a34a;margin-left:auto;box-shadow:0 0 6px rgba(22,163,74,.4);flex-shrink:0;}

        /* MAIN AREA */
        .mp-main{flex:1;overflow-y:auto;display:flex;flex-direction:column;}
        .mp-hero{background:linear-gradient(135deg,#14532d 0%,#166534 50%,#0d9488 100%);padding:28px 36px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
        .mp-hero-left h2{font-family:'DM Serif Display',serif;font-size:1.35rem;color:#fff;margin:0 0 4px;font-weight:400;}
        .mp-hero-left p{font-size:.84rem;color:rgba(255,255,255,.65);margin:0;}
        .mp-hero-actions{display:flex;gap:10px;}
        .mp-hero-btn{padding:9px 18px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:7px;border:none;}
        .mp-hero-btn.outline{background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.25);color:#fff;}
        .mp-hero-btn.outline:hover{background:rgba(255,255,255,.18);}
        .mp-hero-btn.solid{background:#fff;color:#14532d;}
        .mp-hero-btn.solid:hover{background:#f0fdf4;box-shadow:0 4px 16px rgba(0,0,0,.15);}

        .mp-content{padding:28px 36px 48px;}

        /* STATS */
        .mp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;}
        .mp-stat{background:#fff;border:1.5px solid #e2ece2;border-radius:12px;padding:18px 20px;position:relative;overflow:hidden;transition:all .2s;}
        .mp-stat:hover{border-color:#86efac;box-shadow:0 4px 16px rgba(20,83,45,.06);}
        .mp-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;margin-bottom:12px;}
        .mp-stat-val{font-family:'DM Serif Display',serif;font-size:1.55rem;color:#1a2e1a;margin-bottom:2px;}
        .mp-stat-label{font-size:.77rem;color:#64846a;}
        .mp-stat-bar{position:absolute;top:0;left:0;right:0;height:3px;}

        /* TOOLBAR */
        .mp-toolbar{display:flex;align-items:center;gap:14px;margin-bottom:22px;flex-wrap:wrap;}
        .mp-search-box{flex:1;min-width:280px;position:relative;}
        .mp-search-box input{width:100%;padding:11px 16px 11px 42px;border:1.5px solid #e2ece2;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.86rem;background:#fff;color:#1a2e1a;outline:none;transition:all .2s;box-sizing:border-box;}
        .mp-search-box input:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.08);}
        .mp-search-box input::placeholder{color:#98b098;}
        .mp-search-box svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#98b098;}
        .mp-filter-select{padding:11px 14px;border:1.5px solid #e2ece2;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.83rem;background:#fff;color:#1a2e1a;cursor:pointer;outline:none;min-width:170px;}
        .mp-filter-select:focus{border-color:#16a34a;}
        .mp-view-toggle{display:flex;gap:3px;background:#f0f7f0;border-radius:8px;padding:3px;}
        .mp-view-btn{width:34px;height:32px;border:none;background:none;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#98b098;transition:all .18s;}
        .mp-view-btn.act{background:#fff;color:#14532d;box-shadow:0 1px 4px rgba(20,83,45,.1);}

        /* CATEGORIES */
        .mp-cats{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:24px;}
        .mp-cat{padding:7px 16px;border-radius:20px;font-size:.8rem;font-weight:500;border:1.5px solid #e2ece2;background:#fff;color:#64846a;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;}
        .mp-cat:hover{border-color:#86efac;color:#14532d;background:#f0fdf4;}
        .mp-cat.act{background:linear-gradient(135deg,#14532d,#166534);color:#fff;border-color:transparent;box-shadow:0 2px 8px rgba(20,83,45,.2);}
        .mp-clear-filter{padding:7px 14px;border-radius:20px;font-size:.8rem;font-weight:500;border:1.5px solid #fecaca;background:#fef2f2;color:#dc2626;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;align-items:center;gap:5px;}

        /* PRODUCT GRID */
        .mp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:20px;}
        .mp-card{background:#fff;border:1.5px solid #e2ece2;border-radius:14px;overflow:hidden;transition:all .25s;position:relative;}
        .mp-card:hover{border-color:#86efac;transform:translateY(-4px);box-shadow:0 12px 36px rgba(20,83,45,.1);}
        .mp-card-img{height:160px;background:linear-gradient(135deg,#f8faf8 0%,#f0f7f0 100%);display:flex;align-items:center;justify-content:center;font-size:3.8rem;position:relative;overflow:hidden;}
        .mp-card-img img{max-height:100%;max-width:100%;object-fit:contain;}
        .mp-card-badges{position:absolute;top:10px;left:10px;display:flex;gap:5px;flex-wrap:wrap;}
        .mp-card-badge{font-size:.65rem;font-weight:600;padding:3px 8px;border-radius:5px;backdrop-filter:blur(8px);}
        .mp-card-stock-badge{position:absolute;top:10px;right:10px;}
        .mp-card-body{padding:16px 18px 18px;}
        .mp-card-seller{display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #f0f7f0;}
        .mp-card-seller-avatar{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#16a34a,#0d9488);display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:700;color:#fff;flex-shrink:0;}
        .mp-card-seller-name{font-size:.76rem;font-weight:600;color:#1a2e1a;}
        .mp-card-seller-verified{display:flex;align-items:center;gap:3px;font-size:.65rem;color:#16a34a;font-weight:600;}
        .mp-card-title{font-size:.95rem;font-weight:600;color:#1a2e1a;margin-bottom:6px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .mp-card-sku{font-size:.7rem;color:#98b098;margin-bottom:10px;font-family:monospace;}
        .mp-card-specs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;}
        .mp-card-spec{display:flex;flex-direction:column;gap:2px;}
        .mp-card-spec-label{font-size:.67rem;color:#98b098;text-transform:uppercase;letter-spacing:.05em;font-weight:600;}
        .mp-card-spec-val{font-size:.82rem;font-weight:600;color:#1a2e1a;}
        .mp-card-pricing{background:#f8faf8;border-radius:10px;padding:12px 14px;margin-bottom:14px;}
        .mp-card-price-row{display:flex;align-items:baseline;justify-content:space-between;}
        .mp-card-price{font-family:'DM Serif Display',serif;font-size:1.35rem;color:#14532d;}
        .mp-card-price-unit{font-size:.73rem;color:#64846a;font-family:'DM Sans',sans-serif;}
        .mp-card-price-note{font-size:.68rem;color:#16a34a;font-weight:500;margin-top:2px;}
        .mp-card-actions{display:flex;gap:8px;}
        .mp-btn-buy{flex:1;padding:10px;background:linear-gradient(135deg,#14532d,#166534);color:#fff;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;}
        .mp-btn-buy:hover{box-shadow:0 4px 16px rgba(20,83,45,.25);transform:translateY(-1px);}
        .mp-btn-rfq{padding:10px 14px;background:#fff;color:#14532d;border:1.5px solid #e2ece2;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:5px;}
        .mp-btn-rfq:hover{border-color:#16a34a;color:#16a34a;background:#f0fdf4;}

        /* LIST VIEW */
        .mp-list{display:flex;flex-direction:column;gap:12px;}
        .mp-list-item{display:flex;align-items:center;gap:20px;background:#fff;border:1.5px solid #e2ece2;border-radius:12px;padding:18px 22px;transition:all .22s;}
        .mp-list-item:hover{border-color:#86efac;box-shadow:0 6px 20px rgba(20,83,45,.06);}
        .mp-list-icon{width:60px;height:60px;border-radius:12px;background:linear-gradient(135deg,#f8faf8,#f0f7f0);display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;}
        .mp-list-info{flex:1;min-width:0;}
        .mp-list-title{font-size:.9rem;font-weight:600;color:#1a2e1a;}
        .mp-list-meta{font-size:.77rem;color:#64846a;margin-top:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .mp-list-meta .sep{width:3px;height:3px;border-radius:50%;background:#ccc;}
        .mp-list-specs{display:flex;gap:24px;flex-shrink:0;align-items:center;}
        .mp-list-spec{text-align:center;min-width:70px;}
        .mp-list-spec-val{font-size:.88rem;font-weight:600;color:#1a2e1a;}
        .mp-list-spec-label{font-size:.68rem;color:#98b098;text-transform:uppercase;letter-spacing:.03em;}
        .mp-list-price{font-family:'DM Serif Display',serif;font-size:1.15rem;color:#14532d;white-space:nowrap;min-width:100px;text-align:right;}
        .mp-list-price-unit{font-size:.7rem;color:#64846a;font-family:'DM Sans',sans-serif;display:block;}

        /* COMPANY VIEW */
        .mp-companies{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px;margin-bottom:28px;}
        .mp-co-card{background:#fff;border:1.5px solid #e2ece2;border-radius:14px;padding:22px;transition:all .22s;cursor:pointer;position:relative;overflow:hidden;}
        .mp-co-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#16a34a,#0d9488);opacity:0;transition:opacity .2s;}
        .mp-co-card:hover{border-color:#86efac;transform:translateY(-3px);box-shadow:0 8px 28px rgba(20,83,45,.08);}
        .mp-co-card:hover::before{opacity:1;}
        .mp-co-card.selected{border-color:#16a34a;background:#f0fdf4;}
        .mp-co-card.selected::before{opacity:1;}
        .mp-co-top{display:flex;gap:16px;margin-bottom:14px;}
        .mp-co-avatar{width:52px;height:52px;border-radius:12px;background:linear-gradient(135deg,#16a34a,#0d9488);display:flex;align-items:center;justify-content:center;font-size:.95rem;font-weight:700;color:#fff;flex-shrink:0;}
        .mp-co-name{font-size:.95rem;font-weight:700;color:#1a2e1a;margin-bottom:2px;}
        .mp-co-type-badge{font-size:.67rem;font-weight:600;padding:3px 9px;border-radius:5px;background:#f0f7f0;color:#16a34a;display:inline-block;margin-bottom:4px;}
        .mp-co-loc{font-size:.77rem;color:#64846a;display:flex;align-items:center;gap:4px;}
        .mp-co-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding-top:14px;border-top:1px solid #f0f7f0;}
        .mp-co-stat{text-align:center;}
        .mp-co-stat-val{font-size:1rem;font-weight:700;color:#14532d;}
        .mp-co-stat-label{font-size:.68rem;color:#98b098;}

        /* CART PANEL */
        .mp-cart-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:200;backdrop-filter:blur(3px);}
        .mp-cart-panel{position:fixed;right:0;top:0;width:420px;height:100vh;background:#fff;box-shadow:-12px 0 40px rgba(0,0,0,.12);z-index:201;display:flex;flex-direction:column;animation:cartSlideIn .28s ease;}
        @keyframes cartSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        .mp-cart-head{padding:22px 26px;border-bottom:1px solid #e2ece2;display:flex;align-items:center;justify-content:space-between;}
        .mp-cart-title{font-family:'DM Serif Display',serif;font-size:1.1rem;color:#1a2e1a;}
        .mp-cart-count-badge{font-size:.72rem;font-weight:700;background:#f0f7f0;color:#16a34a;padding:3px 9px;border-radius:12px;margin-left:8px;}
        .mp-cart-close{width:34px;height:34px;border-radius:8px;border:1.5px solid #e2ece2;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64846a;transition:all .18s;}
        .mp-cart-close:hover{border-color:#dc2626;color:#dc2626;background:#fef2f2;}
        .mp-cart-body{flex:1;overflow-y:auto;padding:8px 26px;}
        .mp-cart-item{display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #f0f7f0;}
        .mp-cart-item:last-child{border-bottom:none;}
        .mp-cart-item-icon{width:46px;height:46px;border-radius:10px;background:#f8faf8;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;}
        .mp-cart-item-info{flex:1;}
        .mp-cart-item-name{font-size:.85rem;font-weight:600;color:#1a2e1a;}
        .mp-cart-item-co{font-size:.73rem;color:#64846a;margin-top:1px;}
        .mp-cart-item-qty{font-size:.77rem;color:#98b098;margin-top:4px;}
        .mp-cart-item-price{font-size:.9rem;font-weight:700;color:#14532d;white-space:nowrap;}
        .mp-cart-remove{font-size:.72rem;color:#dc2626;cursor:pointer;border:none;background:none;font-family:'DM Sans',sans-serif;padding:3px 0;margin-top:3px;font-weight:500;}
        .mp-cart-remove:hover{text-decoration:underline;}
        .mp-cart-footer{padding:22px 26px;border-top:1px solid #e2ece2;background:#f8faf8;}
        .mp-cart-summary{margin-bottom:16px;}
        .mp-cart-row{display:flex;justify-content:space-between;margin-bottom:6px;}
        .mp-cart-row-label{font-size:.82rem;color:#64846a;}
        .mp-cart-row-val{font-size:.82rem;font-weight:600;color:#1a2e1a;}
        .mp-cart-total-row{display:flex;justify-content:space-between;padding-top:10px;border-top:1.5px solid #e2ece2;margin-top:6px;}
        .mp-cart-total-label{font-size:.9rem;font-weight:600;color:#1a2e1a;}
        .mp-cart-total-val{font-family:'DM Serif Display',serif;font-size:1.35rem;color:#14532d;}
        .mp-checkout-btn{width:100%;padding:13px;background:linear-gradient(135deg,#14532d,#166534);color:#fff;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .mp-checkout-btn:hover{box-shadow:0 6px 20px rgba(20,83,45,.25);}
        .mp-checkout-btn:disabled{opacity:.6;cursor:wait;}

        /* BUY MODAL */
        .mp-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
        .mp-modal{background:#fff;border-radius:18px;padding:0;width:480px;max-width:92vw;box-shadow:0 24px 60px rgba(0,0,0,.18);overflow:hidden;}
        .mp-modal-header{background:linear-gradient(135deg,#14532d,#166534);padding:22px 28px;color:#fff;}
        .mp-modal-title{font-family:'DM Serif Display',serif;font-size:1.15rem;font-weight:400;}
        .mp-modal-subtitle{font-size:.78rem;color:rgba(255,255,255,.6);margin-top:2px;}
        .mp-modal-body{padding:24px 28px;}
        .mp-modal-product{display:flex;gap:16px;padding:16px;background:#f8faf8;border-radius:12px;margin-bottom:20px;border:1px solid #e2ece2;}
        .mp-modal-picon{width:56px;height:56px;border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;border:1px solid #e2ece2;}
        .mp-modal-pname{font-size:.9rem;font-weight:600;color:#1a2e1a;}
        .mp-modal-pprice{font-size:.85rem;color:#16a34a;font-weight:700;margin-top:3px;}
        .mp-modal-pmoq{font-size:.74rem;color:#64846a;margin-top:3px;display:flex;align-items:center;gap:4px;}
        .mp-modal-field{margin-bottom:18px;}
        .mp-modal-field label{display:block;font-size:.78rem;font-weight:600;color:#1a2e1a;margin-bottom:7px;text-transform:uppercase;letter-spacing:.03em;}
        .mp-modal-field input,.mp-modal-field textarea{width:100%;padding:11px 14px;border:1.5px solid #e2ece2;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.86rem;outline:none;background:#fff;color:#1a2e1a;box-sizing:border-box;transition:all .2s;}
        .mp-modal-field input:focus,.mp-modal-field textarea:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.08);}
        .mp-modal-hint{font-size:.72rem;color:#98b098;margin-top:5px;}
        .mp-tiers{margin-bottom:18px;}
        .mp-tiers-title{font-size:.78rem;font-weight:600;color:#1a2e1a;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
        .mp-tier{display:flex;justify-content:space-between;padding:8px 12px;border-radius:7px;font-size:.78rem;margin-bottom:4px;background:#f8faf8;border:1px solid transparent;transition:all .15s;}
        .mp-tier.active{background:#f0fdf4;border-color:#86efac;font-weight:600;}
        .mp-tier-range{color:#64846a;}
        .mp-tier-discount{color:#16a34a;font-weight:600;}
        .mp-modal-calc{background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:14px 16px;margin-bottom:18px;}
        .mp-calc-row{display:flex;justify-content:space-between;margin-bottom:6px;}
        .mp-calc-row:last-child{margin-bottom:0;}
        .mp-calc-label{font-size:.8rem;color:#64846a;}
        .mp-calc-val{font-size:.8rem;font-weight:600;color:#1a2e1a;}
        .mp-calc-total{font-family:'DM Serif Display',serif;font-size:1.2rem;color:#14532d;}
        .mp-calc-save{font-size:.75rem;color:#d97706;font-weight:600;}
        .mp-modal-btns{display:flex;gap:10px;}
        .mp-modal-btns button{flex:1;padding:12px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.86rem;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;}

        /* RFQ MODAL */
        .mp-rfq-success{text-align:center;padding:20px 0;}
        .mp-rfq-success-icon{width:56px;height:56px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin:0 auto 14px;}

        /* EMPTY & LOADING */
        .mp-empty{text-align:center;padding:60px 20px;color:#64846a;}
        .mp-empty-icon{font-size:3rem;margin-bottom:14px;}
        .mp-loading{text-align:center;padding:80px 20px;}
        .mp-spinner{width:40px;height:40px;border:3px solid #e2ece2;border-top-color:#16a34a;border-radius:50%;animation:spin .6s linear infinite;margin:0 auto 16px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}

        @media(max-width:1100px){.mp-stats{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:768px){
          .mp-grid{grid-template-columns:1fr;}
          .mp-sidebar{display:none;}
          .mp-content{padding:20px 16px;}
          .mp-cart-panel{width:100vw;}
          .mp-companies{grid-template-columns:1fr;}
          .mp-stats{grid-template-columns:1fr 1fr;}
          .mp-toolbar{flex-direction:column;}
        }
      `}</style>

      {/* TOPBAR */}
      <header className="mp-topbar">
        <div className="mp-brand">
          <div className="mp-logo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/><circle cx="20" cy="18" r="2.5" fill="#86efac"/></svg></div>
          <div className="mp-brand-name">Stock<b>Bridge</b></div>
        </div>
        <nav className="mp-topnav">
          <Link to="/"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Home</Link>
          <Link to="/dashboard"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>Dashboard</Link>
          <span className="act"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Marketplace</span>
          <Link to="/products">My Listings</Link>
          <Link to="/orders">Orders</Link>
        </nav>
        <div className="mp-topright">
          <button className="mp-icon-btn" onClick={() => setShowCart(!showCart)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartItems.length > 0 && <div className="mp-badge">{cartItems.length}</div>}
          </button>
          <button className="mp-icon-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
          <div className="mp-user-chip"><div className="mp-user-avatar">{initials}</div><span className="mp-user-name">{businessName}</span></div>
        </div>
      </header>

      <div className="mp-layout">
        {/* SIDEBAR */}
        <aside className="mp-sidebar">
          <div className="mp-sb-section">
            <div className="mp-sb-label">Navigation</div>
            <Link className="mp-nav" to="/dashboard"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>Overview</Link>
            <Link className="mp-nav act" to="/marketplace"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Marketplace<span className="mp-nav-count">{activeProducts.length}</span></Link>
          </div>
          <div className="mp-sep"></div>
          <div className="mp-sb-section">
            <div className="mp-sb-label">My Business</div>
            <Link className="mp-nav" to="/products"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>Products</Link>
            <Link className="mp-nav" to="/orders"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Orders</Link>
            <Link className="mp-nav" to="/invoices"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Invoices</Link>
          </div>
          <div className="mp-sep"></div>
          <div className="mp-sb-section">
            <div className="mp-sb-label">Inventory</div>
            <Link className="mp-nav" to="/inventory"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>Stock Management</Link>
            <Link className="mp-nav" to="/inventory/alerts"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Stock Alerts</Link>
          </div>
          <div className="mp-sep"></div>
          <div className="mp-sb-section">
            <div className="mp-sb-label">Reports</div>
            <Link className="mp-nav" to="/reports/sales"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>Sales Report</Link>
            <Link className="mp-nav" to="/reports/revenue"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Revenue Growth</Link>
            <Link className="mp-nav" to="/reports/unpaid"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Unpaid Invoices</Link>
            <Link className="mp-nav" to="/reports/top-clients"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 12 7s5-3 7.5-3a2.5 2.5 0 0 1 0 5H18l-6 11L6 9z"/></svg>Top Clients</Link>
          </div>
          <div className="mp-sep"></div>
          <div className="mp-sb-section">
            <div className="mp-sb-label">Account</div>
            <a className="mp-nav" href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings</a>
            <Link className="mp-nav" to="/login" style={{ color: '#dc2626' }} onClick={() => localStorage.removeItem('user')}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</Link>
          </div>
          <div className="mp-sb-footer">
            <div className="mp-sb-user">
              <div className="mp-sb-avatar">{initials}</div>
              <div><div className="mp-sb-name">{businessName}</div><div className="mp-sb-role">{user.businessType || 'Business'}</div></div>
              <div className="mp-sb-dot"></div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="mp-main">
          {/* HERO */}
          <div className="mp-hero">
            <div className="mp-hero-left">
              <h2>{showCompanies ? 'Supplier Directory' : 'B2B Wholesale Marketplace'}</h2>
              <p>{showCompanies
                ? 'Discover verified suppliers and browse their product catalogs'
                : `${activeProducts.length} products from ${businesses.length} verified suppliers`}</p>
            </div>
            <div className="mp-hero-actions">
              <button className="mp-hero-btn outline" onClick={() => setShowCompanies(!showCompanies)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {showCompanies ? 'Browse Products' : 'View Suppliers'}
              </button>
              <button className="mp-hero-btn outline" onClick={() => { setShowMyRfqs(!showMyRfqs); if (!showMyRfqs) fetchMyRfqs(); setShowCompanies(false) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {showMyRfqs ? 'Back to Products' : 'My Quotes'}
                {myRfqs.filter(r => r.status === 'QUOTED').length > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700, marginLeft: 4 }}>
                    {myRfqs.filter(r => r.status === 'QUOTED').length}
                  </span>
                )}
              </button>
              {cartItems.length > 0 && (
                <button className="mp-hero-btn solid" onClick={() => setShowCart(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  View Cart ({cartItems.length})
                </button>
              )}
            </div>
          </div>

          <div className="mp-content">
            {/* MY RFQS VIEW */}
            {showMyRfqs && (
              <div style={{ animation: 'fadeUp .3s ease' }}>
                <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.3rem', color: 'var(--text)', marginBottom: 6 }}>My Quote Requests</h3>
                <p style={{ color: 'var(--muted)', fontSize: '.84rem', marginBottom: 20 }}>Track your RFQs and respond to supplier quotes</p>

                {myRfqs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--surface)', borderRadius: 14, border: '1.5px solid var(--border)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📋</div>
                    <div style={{ color: 'var(--muted)', fontSize: '.9rem' }}>No quote requests yet</div>
                    <div style={{ color: 'var(--muted)', fontSize: '.8rem', marginTop: 4 }}>Click "RFQ" on any product to request a custom quote</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {myRfqs.map(rfq => {
                      const stMap = {
                        PENDING: { bg: '#fef3c7', color: '#92400e', label: 'Awaiting Response' },
                        QUOTED: { bg: '#dbeafe', color: '#1e40af', label: 'Quote Received' },
                        ACCEPTED: { bg: '#dcfce7', color: '#166534', label: 'Accepted' },
                        ORDERED: { bg: '#d1fae5', color: '#065f46', label: 'Order Created' },
                        REJECTED: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
                        EXPIRED: { bg: '#f3f4f6', color: '#6b7280', label: 'Expired' },
                      }
                      const st = stMap[rfq.status] || stMap.PENDING
                      return (
                        <div key={rfq.id} style={{
                          background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 14,
                          padding: '18px 22px', transition: 'all .2s',
                          borderLeft: rfq.status === 'QUOTED' ? '4px solid #3b82f6' : rfq.status === 'PENDING' ? '4px solid #f59e0b' : '4px solid var(--border)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text)' }}>{rfq.rfqNumber}</span>
                                <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: '.7rem', fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                              </div>
                              <div style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)' }}>{rfq.product?.name || 'Product'}</div>
                              <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 2 }}>
                                Seller: <b>{rfq.sellerBusiness?.name || 'Unknown'}</b> · Qty: <b>{rfq.requestedQuantity}</b> · Sent: {rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : ''}
                              </div>
                            </div>
                          </div>

                          {rfq.status === 'QUOTED' && (
                            <div style={{
                              background: 'var(--light)', borderRadius: 10, padding: '14px 18px', marginBottom: 12,
                              border: '1.5px solid var(--accent)'
                            }}>
                              <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: 6 }}>Supplier's Quote:</div>
                              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 6 }}>
                                <div>
                                  <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Price/Unit: </span>
                                  <b style={{ color: 'var(--green)', fontSize: '1rem' }}>${Number(rfq.offeredPrice || 0).toLocaleString()}</b>
                                </div>
                                {rfq.offeredDiscount > 0 && (
                                  <div>
                                    <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Discount: </span>
                                    <b style={{ color: '#d97706' }}>{rfq.offeredDiscount}%</b>
                                  </div>
                                )}
                                <div>
                                  <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Total: </span>
                                  <b style={{ color: 'var(--green)', fontSize: '1.1rem' }}>${Number(rfq.offeredTotal || 0).toLocaleString()}</b>
                                </div>
                                {rfq.validUntil && (
                                  <div>
                                    <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Valid Until: </span>
                                    <b style={{ color: 'var(--text)' }}>{rfq.validUntil}</b>
                                  </div>
                                )}
                              </div>
                              {rfq.sellerNotes && <div style={{ fontSize: '.8rem', color: 'var(--muted)', fontStyle: 'italic' }}>"{rfq.sellerNotes}"</div>}

                              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button onClick={() => acceptRfqQuote(rfq.id)} style={{
                                  padding: '8px 20px', background: 'var(--green)', color: '#fff', border: 'none',
                                  borderRadius: 8, cursor: 'pointer', fontSize: '.84rem', fontWeight: 700
                                }}>Accept & Create Order</button>
                                <button onClick={() => rejectRfqQuote(rfq.id)} style={{
                                  padding: '8px 20px', background: 'var(--surface)', color: '#be123c',
                                  border: '1.5px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontSize: '.84rem', fontWeight: 600
                                }}>Decline</button>
                              </div>
                            </div>
                          )}

                          {rfq.status === 'ORDERED' && rfq.orderId && (
                            <div style={{ background: 'var(--light)', borderRadius: 8, padding: '10px 14px', fontSize: '.84rem' }}>
                              <span style={{ color: 'var(--accent)' }}>Order #{rfq.orderId} created </span>
                              <button onClick={() => navigate('/orders')} style={{
                                background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer',
                                fontWeight: 700, fontSize: '.84rem', textDecoration: 'underline'
                              }}>View Orders</button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STATS */}
            {!showMyRfqs && <div className="mp-stats" style={{ animation: 'fadeUp .35s ease both' }}>
              <div className="mp-stat">
                <div className="mp-stat-bar" style={{ background: 'linear-gradient(90deg,#16a34a,#22c55e)' }}></div>
                <div className="mp-stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
                <div className="mp-stat-val">{activeProducts.length}</div>
                <div className="mp-stat-label">Products Available</div>
              </div>
              <div className="mp-stat">
                <div className="mp-stat-bar" style={{ background: 'linear-gradient(90deg,#0d9488,#14b8a6)' }}></div>
                <div className="mp-stat-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div className="mp-stat-val">{businesses.length}</div>
                <div className="mp-stat-label">Verified Suppliers</div>
              </div>
              <div className="mp-stat">
                <div className="mp-stat-bar" style={{ background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' }}></div>
                <div className="mp-stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </div>
                <div className="mp-stat-val">{categories.length}</div>
                <div className="mp-stat-label">Product Categories</div>
              </div>
              <div className="mp-stat">
                <div className="mp-stat-bar" style={{ background: 'linear-gradient(90deg,#ea580c,#f97316)' }}></div>
                <div className="mp-stat-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                </div>
                <div className="mp-stat-val">{cartItems.length > 0 ? `$${cartTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '0'}</div>
                <div className="mp-stat-label">{cartItems.length > 0 ? `${cartItems.length} items in cart` : 'Cart Empty'}</div>
              </div>
            </div>}

            {/* LOADING */}
            {loading && (
              <div className="mp-loading">
                <div className="mp-spinner"></div>
                <div style={{ color: '#64846a', fontSize: '.9rem' }}>Loading marketplace...</div>
              </div>
            )}

            {/* ERROR */}
            {error && !loading && (
              <div className="mp-empty">
                <div className="mp-empty-icon">&#9888;&#65039;</div>
                <div style={{ color: '#dc2626', fontSize: '.9rem' }}>{error}</div>
                <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '10px 24px', background: '#14532d', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>Retry</button>
              </div>
            )}

            {/* COMPANY VIEW */}
            {!loading && !error && !showMyRfqs && showCompanies && (
              <div style={{ animation: 'fadeUp .35s ease both' }}>
                <div className="mp-toolbar">
                  <div className="mp-search-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" placeholder="Search suppliers by name, location, type..." value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>
                <div className="mp-companies">
                  {businesses.filter(b => (b.name || '').toLowerCase().includes(search.toLowerCase()) || (b.city || '').toLowerCase().includes(search.toLowerCase()) || (b.businessType || '').toLowerCase().includes(search.toLowerCase())).map(b => {
                    const prodCount = products.filter(p => (p.business?.id || p.businessId) === b.id && !p.isDeleted && p.isActive).length
                    const bInit = (b.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                    return (
                      <div key={b.id} className={`mp-co-card${selectedCompany === b.id ? ' selected' : ''}`} onClick={() => { setSelectedCompany(selectedCompany === b.id ? null : b.id); setShowCompanies(false) }}>
                        <div className="mp-co-top">
                          <div className="mp-co-avatar">{bInit}</div>
                          <div>
                            <div className="mp-co-name">{b.name}</div>
                            {b.businessType && <div className="mp-co-type-badge">{b.businessType}</div>}
                            <div className="mp-co-loc">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                              {[b.city, b.zipCode].filter(Boolean).join(', ') || 'No address listed'}
                            </div>
                          </div>
                        </div>
                        <div className="mp-co-stats">
                          <div className="mp-co-stat"><div className="mp-co-stat-val">{prodCount}</div><div className="mp-co-stat-label">Products</div></div>
                          <div className="mp-co-stat"><div className="mp-co-stat-val">{b.email ? '1' : '0'}</div><div className="mp-co-stat-label">Verified</div></div>
                          <div className="mp-co-stat"><div className="mp-co-stat-val">B2B</div><div className="mp-co-stat-label">Trade</div></div>
                        </div>
                      </div>
                    )
                  })}
                  {businesses.length === 0 && (
                    <div className="mp-empty"><div className="mp-empty-icon">&#127970;</div><div>No suppliers found.</div></div>
                  )}
                </div>
              </div>
            )}

            {/* PRODUCT VIEW */}
            {!loading && !error && !showMyRfqs && !showCompanies && (
              <div style={{ animation: 'fadeUp .35s ease both' }}>
                {/* TOOLBAR */}
                <div className="mp-toolbar">
                  <div className="mp-search-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" placeholder="Search products, SKU, companies..." value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <select className="mp-filter-select" value={sort} onChange={e => setSort(e.target.value)}>
                    {sortOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="mp-view-toggle">
                    <button className={`mp-view-btn${viewMode === 'grid' ? ' act' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    </button>
                    <button className={`mp-view-btn${viewMode === 'list' ? ' act' : ''}`} onClick={() => setViewMode('list')} title="List view">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </button>
                  </div>
                </div>

                {/* MAIN CATEGORY CARDS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                  {[
                    { name: 'Electronics', icon: '📱', bg: 'linear-gradient(135deg, #172554, #1e40af)', desc: 'Phones, Cables & More' },
                    { name: 'FMCG', icon: '🛒', bg: 'linear-gradient(135deg, #065f46, #059669)', desc: 'Fast Moving Goods' },
                    { name: 'Textiles', icon: '🧵', bg: 'linear-gradient(135deg, #7c2d12, #ea580c)', desc: 'Fabrics & Clothing' }
                  ].map(cat => {
                    const count = products.filter(p => p.category === cat.name && !p.isDeleted && p.isActive).length
                    return (
                      <div
                        key={cat.name}
                        onClick={() => setActiveCat(cat.name)}
                        style={{
                          background: activeCat === cat.name ? cat.bg : '#f8faf8',
                          border: activeCat === cat.name ? 'none' : '1.5px solid #e2ece2',
                          borderRadius: 14,
                          padding: '20px 18px',
                          cursor: 'pointer',
                          transition: 'all 0.25s',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={e => {
                          if (activeCat !== cat.name) {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <span style={{ fontSize: 32 }}>{cat.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '1.05rem',
                              fontWeight: 700,
                              color: activeCat === cat.name ? '#fff' : '#1a2e1a',
                              marginBottom: 2
                            }}>{cat.name}</div>
                            <div style={{
                              fontSize: '.75rem',
                              color: activeCat === cat.name ? 'rgba(255,255,255,0.8)' : '#64846a'
                            }}>{cat.desc}</div>
                          </div>
                        </div>
                        <div style={{
                          fontSize: '.85rem',
                          fontWeight: 600,
                          color: activeCat === cat.name ? 'rgba(255,255,255,0.9)' : '#16a34a'
                        }}>{count} Products Available</div>
                      </div>
                    )
                  })}
                </div>

                {/* CATEGORIES */}
                <div className="mp-cats">
                  {categoryNames.map(c => (
                    <button key={c} className={`mp-cat${activeCat === c ? ' act' : ''}`} onClick={() => setActiveCat(c)}>{c}</button>
                  ))}
                  {selectedCompany && (
                    <button className="mp-clear-filter" onClick={() => setSelectedCompany(null)}>
                      {bizMap[selectedCompany]?.name || 'Company'} &#10005;
                    </button>
                  )}
                </div>

                {/* RESULTS INFO */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <span style={{ fontSize: '.82rem', color: '#64846a' }}>
                    Showing <b style={{ color: '#1a2e1a' }}>{filtered.length}</b> {filtered.length === 1 ? 'product' : 'products'}
                    {selectedCompany && <> from <b style={{ color: '#16a34a' }}>{bizMap[selectedCompany]?.name}</b></>}
                    {activeCat !== 'All' && <> in <b style={{ color: '#14532d' }}>{activeCat}</b></>}
                  </span>
                </div>

                {/* PRODUCTS */}
                {filtered.length === 0 ? (
                  <div className="mp-empty">
                    <div className="mp-empty-icon">&#128230;</div>
                    <div style={{ fontSize: '.9rem', marginBottom: 6 }}>No products match your criteria</div>
                    <div style={{ fontSize: '.8rem', color: '#98b098' }}>Try adjusting your search or filters</div>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="mp-grid">
                    {filtered.map(p => {
                      const biz = p.business || bizMap[p.businessId] || {}
                      const icon = getProductIcon(p.name, p.category)
                      const stock = getStockStatus(p.stock || 0)
                      const bInit = (biz.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                      return (
                        <div key={p.id} className="mp-card">
                          <div className="mp-card-img" onClick={() => navigate(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = icon }} /> : icon}
                            <div className="mp-card-badges">
                              {p.moq >= 50 && <span className="mp-card-badge" style={{ background: 'rgba(234,88,12,.1)', color: '#ea580c' }}>Bulk Only</span>}
                              {p.category && <span className="mp-card-badge" style={{ background: 'rgba(22,163,74,.1)', color: '#16a34a' }}>{p.category}</span>}
                            </div>
                            <div className="mp-card-stock-badge">
                              <span style={{ fontSize: '.65rem', fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: stock.bg, color: stock.color }}>{stock.label}</span>
                            </div>
                          </div>
                          <div className="mp-card-body">
                            <div className="mp-card-seller">
                              <div className="mp-card-seller-avatar">{bInit}</div>
                              <div style={{ flex: 1 }}>
                                <div className="mp-card-seller-name">{biz.name || 'Unknown Seller'}</div>
                              </div>
                              <div className="mp-card-seller-verified">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                Verified
                              </div>
                            </div>
                            <div className="mp-card-title" onClick={() => navigate(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>{p.name}</div>
                            {p.sku && <div className="mp-card-sku">SKU: {p.sku}</div>}
                            <div className="mp-card-specs">
                              <div className="mp-card-spec">
                                <span className="mp-card-spec-label">Min. Order</span>
                                <span className="mp-card-spec-val">{p.moq || 1} {p.unit || 'pcs'}</span>
                              </div>
                              <div className="mp-card-spec">
                                <span className="mp-card-spec-label">Available</span>
                                <span className="mp-card-spec-val">{(p.stock || 0).toLocaleString()} {p.unit || 'pcs'}</span>
                              </div>
                            </div>
                            <div className="mp-card-pricing">
                              <div className="mp-card-price-row">
                                <div className="mp-card-price">${Number(p.basePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="mp-card-price-unit">/{p.unit || 'piece'}</span></div>
                              </div>
                              <div className="mp-card-price-note">Bulk discounts available</div>
                            </div>
                            <div className="mp-card-actions">
                              <button className="mp-btn-buy" onClick={() => openBuyModal(p)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                                Order Now
                              </button>
                              <button className="mp-btn-rfq" onClick={() => { setRfqModal(p); setRfqMsg(''); setRfqQty(''); setRfqSent(false) }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                RFQ
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="mp-list">
                    {filtered.map(p => {
                      const biz = p.business || bizMap[p.businessId] || {}
                      const icon = getProductIcon(p.name, p.category)
                      const stock = getStockStatus(p.stock || 0)
                      return (
                        <div key={p.id} className="mp-list-item">
                          <div className="mp-list-icon">{icon}</div>
                          <div className="mp-list-info">
                            <div className="mp-list-title">{p.name}</div>
                            <div className="mp-list-meta">
                              <span>{biz.name || 'Unknown'}</span>
                              <span className="sep"></span>
                              <span>{p.category || 'General'}</span>
                              {p.sku && <><span className="sep"></span><span style={{ fontFamily: 'monospace', fontSize: '.72rem' }}>SKU: {p.sku}</span></>}
                              <span className="sep"></span>
                              <span style={{ color: stock.color, fontWeight: 600, fontSize: '.72rem' }}>{stock.label}</span>
                            </div>
                          </div>
                          <div className="mp-list-specs">
                            <div className="mp-list-spec"><div className="mp-list-spec-val">{p.moq || 1}</div><div className="mp-list-spec-label">MOQ</div></div>
                            <div className="mp-list-spec"><div className="mp-list-spec-val">{(p.stock || 0).toLocaleString()}</div><div className="mp-list-spec-label">Stock</div></div>
                          </div>
                          <div>
                            <div className="mp-list-price">${Number(p.basePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="mp-list-price-unit">per {p.unit || 'piece'}</span></div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="mp-btn-buy" style={{ padding: '8px 16px' }} onClick={() => openBuyModal(p)}>Order</button>
                            <button className="mp-btn-rfq" style={{ padding: '8px 12px' }} onClick={() => { setRfqModal(p); setRfqMsg(''); setRfqQty(''); setRfqSent(false) }}>RFQ</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* BUY MODAL */}
      {buyModal && (
        <div className="mp-modal-overlay" onClick={() => { setBuyModal(null); setBulkPricing(null); setPriceCalc(null) }}>
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-header">
              <div className="mp-modal-title">Place Wholesale Order</div>
              <div className="mp-modal-subtitle">Review pricing tiers and specify your quantity</div>
            </div>
            <div className="mp-modal-body">
              <div className="mp-modal-product">
                <div className="mp-modal-picon">{getProductIcon(buyModal.name, buyModal.category)}</div>
                <div>
                  <div className="mp-modal-pname">{buyModal.name}</div>
                  <div className="mp-modal-pprice">${Number(buyModal.basePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {buyModal.unit || 'piece'}</div>
                  <div className="mp-modal-pmoq">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    MOQ: {buyModal.moq || 1} {buyModal.unit || 'piece'}s &middot; {(buyModal.stock || 0).toLocaleString()} available
                  </div>
                </div>
              </div>

              {bulkPricing && bulkPricing.length > 0 && (
                <div className="mp-tiers">
                  <div className="mp-tiers-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    Volume Pricing Tiers
                  </div>
                  {bulkPricing.filter(t => t.isActive !== false).map((tier, i) => (
                    <div key={i} className={`mp-tier${priceCalc && priceCalc.appliedTier && priceCalc.appliedTier === tier.id ? ' active' : ''}`}>
                      <span className="mp-tier-range">{tier.minQuantity}{tier.maxQuantity ? `\u2013${tier.maxQuantity}` : '+'} units</span>
                      <span className="mp-tier-discount">
                        {tier.discountPercent ? `${tier.discountPercent}% off` : ''}
                        {tier.tierPrice ? ` $${Number(tier.tierPrice).toFixed(2)}/unit` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mp-modal-field">
                <label>Order Quantity ({buyModal.unit || 'piece'}s)</label>
                <input
                  type="number"
                  min={buyModal.moq || 1}
                  max={buyModal.stock || 99999}
                  value={buyQty}
                  onChange={e => {
                    setBuyQty(e.target.value)
                    const q = Number(e.target.value)
                    if (q >= (buyModal.moq || 1)) recalcPrice(buyModal.id, q)
                  }}
                  placeholder={`Minimum ${buyModal.moq || 1} ${buyModal.unit || 'piece'}s`}
                />
                <div className="mp-modal-hint">Minimum order: {buyModal.moq || 1} &middot; Available stock: {(buyModal.stock || 0).toLocaleString()}</div>
              </div>

              {priceCalc && Number(buyQty) >= (buyModal.moq || 1) && (
                <div className="mp-modal-calc">
                  {priceCalc.discountPercent > 0 && (
                    <div className="mp-calc-row">
                      <span className="mp-calc-save">Bulk Discount: {priceCalc.discountPercent}% off &mdash; You save ${Number(priceCalc.totalSavings || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="mp-calc-row">
                    <span className="mp-calc-label">Unit Price</span>
                    <span className="mp-calc-val">${Number(priceCalc.finalUnitPrice || buyModal.basePrice).toFixed(2)}</span>
                  </div>
                  <div className="mp-calc-row">
                    <span className="mp-calc-label">Quantity</span>
                    <span className="mp-calc-val">{buyQty} {buyModal.unit || 'piece'}s</span>
                  </div>
                  <div className="mp-calc-row" style={{ paddingTop: 8, borderTop: '1px solid #86efac', marginTop: 6 }}>
                    <span className="mp-calc-label" style={{ fontWeight: 600, color: '#14532d' }}>Order Total</span>
                    <span className="mp-calc-total">${Number(priceCalc.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
              {!priceCalc && Number(buyQty) >= (buyModal.moq || 1) && (
                <div className="mp-modal-calc">
                  <div className="mp-calc-row">
                    <span className="mp-calc-label" style={{ fontWeight: 600 }}>Estimated Total</span>
                    <span className="mp-calc-total">${(Number(buyModal.basePrice || 0) * Number(buyQty)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              <div className="mp-modal-btns">
                <button onClick={() => { setBuyModal(null); setBulkPricing(null); setPriceCalc(null) }} style={{ background: '#f8faf8', border: '1.5px solid #e2ece2', color: '#1a2e1a' }}>Cancel</button>
                <button
                  onClick={() => {
                    const qty = Number(buyQty)
                    if (qty >= (buyModal.moq || 1) && qty <= (buyModal.stock || 99999)) addToCart(buyModal, qty)
                  }}
                  style={{
                    background: Number(buyQty) >= (buyModal.moq || 1) ? 'linear-gradient(135deg,#14532d,#166534)' : '#d1d5db',
                    border: 'none', color: '#fff',
                    cursor: Number(buyQty) >= (buyModal.moq || 1) ? 'pointer' : 'not-allowed'
                  }}
                  disabled={Number(buyQty) < (buyModal.moq || 1)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  Add to Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RFQ MODAL */}
      {rfqModal && (
        <div className="mp-modal-overlay" onClick={() => setRfqModal(null)}>
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-header">
              <div className="mp-modal-title">Request for Quotation</div>
              <div className="mp-modal-subtitle">Send a custom pricing inquiry to the supplier</div>
            </div>
            <div className="mp-modal-body">
              {rfqSent ? (
                <div className="mp-rfq-success">
                  <div className="mp-rfq-success-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a2e1a', marginBottom: 6 }}>RFQ Submitted!</div>
                  <div style={{ fontSize: '.84rem', color: '#64846a', marginBottom: 20 }}>Your request for <b>{rfqModal.name}</b> has been sent to the supplier. They will respond within 24-48 hours.</div>
                  <button onClick={() => setRfqModal(null)} style={{ padding: '10px 28px', background: '#14532d', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>Done</button>
                </div>
              ) : (
                <>
                  <div className="mp-modal-product">
                    <div className="mp-modal-picon">{getProductIcon(rfqModal.name, rfqModal.category)}</div>
                    <div>
                      <div className="mp-modal-pname">{rfqModal.name}</div>
                      <div className="mp-modal-pprice">${Number(rfqModal.basePrice || 0).toFixed(2)} / {rfqModal.unit || 'piece'}</div>
                      <div className="mp-modal-pmoq">From: {(rfqModal.business || bizMap[rfqModal.businessId] || {}).name || 'Supplier'}</div>
                    </div>
                  </div>
                  <div className="mp-modal-field">
                    <label>Required Quantity</label>
                    <input type="number" placeholder="Enter desired quantity" min={1} value={rfqQty} onChange={e => setRfqQty(e.target.value)} />
                  </div>
                  <div className="mp-modal-field">
                    <label>Message to Supplier</label>
                    <textarea rows={4} placeholder="Describe your requirements, delivery timeline, special packaging needs, etc." value={rfqMsg} onChange={e => setRfqMsg(e.target.value)} style={{ resize: 'vertical' }}></textarea>
                  </div>
                  <div className="mp-modal-btns">
                    <button onClick={() => setRfqModal(null)} style={{ background: '#f8faf8', border: '1.5px solid #e2ece2', color: '#1a2e1a' }}>Cancel</button>
                    <button
                      disabled={rfqLoading || !rfqQty || Number(rfqQty) < 1}
                      onClick={async () => {
                        if (!user.id) { alert('Please log in first.'); return }
                        setRfqLoading(true)
                        try {
                          await axios.post('/api/rfqs', {
                            productId: rfqModal.id,
                            buyerBusinessId: Number(user.id),
                            requestedQuantity: Number(rfqQty),
                            message: rfqMsg
                          })
                          setRfqSent(true)
                        } catch (err) {
                          alert('Failed to send RFQ: ' + (err.response?.data?.message || err.message))
                        } finally {
                          setRfqLoading(false)
                        }
                      }}
                      style={{
                        background: (!rfqQty || Number(rfqQty) < 1) ? '#ccc' : 'linear-gradient(135deg,#14532d,#166534)',
                        border: 'none', color: '#fff',
                        cursor: (!rfqQty || Number(rfqQty) < 1) ? 'not-allowed' : 'pointer',
                        opacity: rfqLoading ? 0.7 : 1
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      {rfqLoading ? 'Sending...' : 'Send RFQ'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CART PANEL */}
      {showCart && (
        <>
          <div className="mp-cart-overlay" onClick={() => setShowCart(false)}></div>
          <div className="mp-cart-panel">
            <div className="mp-cart-head">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="mp-cart-title">Purchase Order</span>
                <span className="mp-cart-count-badge">{cartItems.length} items</span>
              </div>
              <button className="mp-cart-close" onClick={() => setShowCart(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="mp-cart-body">
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: '#64846a' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>&#128722;</div>
                  <div style={{ fontSize: '.9rem', fontWeight: 600, color: '#1a2e1a', marginBottom: 4 }}>Your order is empty</div>
                  <div style={{ fontSize: '.8rem' }}>Browse products and add them to your order</div>
                </div>
              ) : (
                cartItems.map(([id, item]) => (
                  <div key={id} className="mp-cart-item">
                    <div className="mp-cart-item-icon">{item.icon}</div>
                    <div className="mp-cart-item-info">
                      <div className="mp-cart-item-name">{item.name}</div>
                      <div className="mp-cart-item-co">{item.company}</div>
                      <div className="mp-cart-item-qty">{item.qty} {item.unit}s @ ${Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{item.unit}</div>
                      <button className="mp-cart-remove" onClick={() => removeFromCart(id)}>Remove</button>
                    </div>
                    <div className="mp-cart-item-price">${(item.price * item.qty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                ))
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="mp-cart-footer">
                <div className="mp-cart-summary">
                  <div className="mp-cart-row">
                    <span className="mp-cart-row-label">Subtotal ({cartItems.length} items)</span>
                    <span className="mp-cart-row-val">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="mp-cart-row">
                    <span className="mp-cart-row-label">Shipping</span>
                    <span className="mp-cart-row-val" style={{ color: '#16a34a' }}>To be calculated</span>
                  </div>
                  <div className="mp-cart-total-row">
                    <span className="mp-cart-total-label">Order Total</span>
                    <span className="mp-cart-total-val">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <button className="mp-checkout-btn" onClick={placeOrder} disabled={orderLoading}>
                  {orderLoading ? (
                    <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite' }}></div> Processing...</>
                  ) : (
                    <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Submit Purchase Order</>
                  )}
                </button>
                <div style={{ textAlign: 'center', marginTop: 10, fontSize: '.72rem', color: '#98b098' }}>Orders are subject to supplier approval and stock availability</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
